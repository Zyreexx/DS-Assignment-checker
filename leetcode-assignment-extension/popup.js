const button = document.querySelector("#check");
const summary = document.querySelector("#summary");
const message = document.querySelector("#message");
const list = document.querySelector("#list");
const assignment = fetch("assignment.json").then(response => response.json());

button.addEventListener("click", async () => {
  button.disabled = true;
  message.className = "";
  message.textContent = "Checking your LeetCode progress…";
  list.replaceChildren();

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url?.startsWith("https://leetcode.com/")) {
      throw new Error("Open leetcode.com in this tab, then click Check progress.");
    }
    const [problems, result] = await Promise.all([
      assignment,
      chrome.tabs.sendMessage(tab.id, { type: "check-assignment" }),
    ]);
    if (!result?.ok) throw new Error(result?.error || "Could not read your LeetCode progress.");
    render(problems, new Set(result.solved), result.username);
  } catch (error) {
    message.className = "error";
    message.textContent = error.message || "Could not check progress. Refresh LeetCode and try again.";
  } finally {
    button.disabled = false;
  }
});

function render(problems, solved, username) {
  const remaining = problems.filter(problem => !solved.has(problem.slug));
  summary.textContent = `${username}: ${problems.length - remaining.length} of ${problems.length} solved`;
  message.textContent = "";
  if (!remaining.length) {
    const done = document.createElement("p");
    done.className = "done";
    done.textContent = "All assignment problems are solved. Nice work!";
    list.append(done);
    return;
  }

  const title = document.createElement("h2");
  title.className = "section-title";
  title.textContent = "Remaining problems";
  list.append(title);

  let currentTopic = "";
  for (const problem of remaining) {
    if (problem.topic !== currentTopic) {
      currentTopic = problem.topic;
      const heading = document.createElement("h2");
      heading.className = "topic";
      heading.textContent = currentTopic;
      list.append(heading);
    }
    const row = document.createElement("div");
    row.className = "problem";
    const name = document.createElement("div");
    name.className = "problem-name";
    name.textContent = problem.name;
    row.append(name);
    const link = document.createElement("a");
    link.href = `https://leetcode.com/problems/${problem.slug}/`;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = "LeetCode problem ↗";
    row.append(link);
    if (problem.video) {
      const video = document.createElement("a");
      video.className = "video";
      video.href = problem.video;
      video.target = "_blank";
      video.rel = "noreferrer";
      video.textContent = "YouTube solution ↗";
      row.append(video);
    }
    list.append(row);
  }
}
