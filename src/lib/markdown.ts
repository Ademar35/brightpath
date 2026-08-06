/** Minimal markdown -> HTML for our own authored lesson content (headers, bold, code, lists, code blocks). */
export function renderLessonMarkdown(md: string): string {
  const lines = md.split("\n");
  let html = "";
  let inList = false;
  let inCodeBlock = false;
  let codeBuf: string[] = [];

  const closeList = () => {
    if (inList) {
      html += "</ul>";
      inList = false;
    }
  };

  const inline = (text: string) =>
    text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");

  for (const rawLine of lines) {
    const line = rawLine;
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        html += `<pre><code>${codeBuf.map((l) => l.replace(/&/g, "&amp;").replace(/</g, "&lt;")).join("\n")}</code></pre>`;
        codeBuf = [];
        inCodeBlock = false;
      } else {
        closeList();
        inCodeBlock = true;
      }
      continue;
    }
    if (inCodeBlock) {
      codeBuf.push(line);
      continue;
    }
    if (line.startsWith("## ")) {
      closeList();
      html += `<h2>${inline(line.slice(3))}</h2>`;
    } else if (line.startsWith("- ")) {
      if (!inList) {
        html += "<ul class='list-disc pl-5 space-y-1 mb-3'>";
        inList = true;
      }
      html += `<li>${inline(line.slice(2))}</li>`;
    } else if (line.trim() === "") {
      closeList();
    } else {
      closeList();
      html += `<p>${inline(line)}</p>`;
    }
  }
  closeList();
  return html;
}
