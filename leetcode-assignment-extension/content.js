chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type !== "check-assignment") return;
  checkProgress()
    .then(sendResponse)
    .catch(error => sendResponse({ ok: false, error: error.message }));
  return true;
});

async function checkProgress() {
  const csrf = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/)?.[1];
  if (!csrf) throw new Error("You may be signed out. Sign in to LeetCode, refresh, then try again.");

  const userData = await query("query { userStatus { isSignedIn username } }", {}, csrf);
  const user = userData.userStatus;
  if (!user?.isSignedIn) throw new Error("You may be signed out. Sign in to LeetCode, refresh, then try again.");

  const solved = await getSolved(csrf);
  return {
    ok: true,
    username: user.username,
    solved: [...solved],
  };
}

async function getSolved(csrf) {
  const queryText = `query progress($filters: UserProgressQuestionListInput) {
    userProgressQuestionList(filters: $filters) {
      totalNum questions { titleSlug }
    }
  }`;
  const solved = new Set();
  let skip = 0;

  while (true) {
    const data = await query(queryText, { filters: {
      questionStatus: "SOLVED", skip, limit: 1000,
    } }, csrf);
    const progress = data.userProgressQuestionList;
    if (!progress) {
      throw new Error("LeetCode did not return the solved list. This progress feature may require Premium.");
    }
    const questions = progress.questions || [];
    for (const question of questions) if (question.titleSlug) solved.add(question.titleSlug);
    skip += questions.length;
    if (!questions.length || skip >= progress.totalNum) return solved;
  }
}

async function query(queryText, variables, csrf) {
  const response = await fetch("/graphql/", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": csrf,
    },
    body: JSON.stringify({ query: queryText, variables }),
  });
  if (!response.ok) throw new Error(`LeetCode returned HTTP ${response.status}. Refresh and try again.`);
  const result = await response.json();
  if (result.errors?.length) {
    const reason = result.errors[0].message || "LeetCode API error";
    throw new Error(`${reason}. The progress endpoint may require Premium or may have changed.`);
  }
  return result.data || {};
}
