const COPY_BUTTON_STYLE_ID = "copy-buttons-style";
const COPY_ICON = `<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false"><path fill="currentColor" d="M0 6.75C0 5.784.784 5 1.75 5h3.5a.75.75 0 0 1 0 1.5h-3.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-3.5a.75.75 0 0 1 1.5 0v3.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path fill="currentColor" d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg>`;
const CHECK_ICON = `<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false"><path fill="currentColor" d="M13.78 4.22a.75.75 0 0 1 0 1.06l-6.25 6.25a.75.75 0 0 1-1.06 0L2.22 7.28a.75.75 0 1 1 1.06-1.06L7 9.94l5.72-5.72a.75.75 0 0 1 1.06 0Z"></path></svg>`;

function setButtonToCopyIcon(btn) {
  btn.innerHTML = COPY_ICON;
  btn.title = "Copy";
  btn.setAttribute("aria-label", "Copy code");
}

function setButtonToCopiedIcon(btn) {
  btn.innerHTML = CHECK_ICON;
  btn.title = "Copied";
  btn.setAttribute("aria-label", "Copied");
}

function ensureStyles(doc) {
  if (doc.getElementById(COPY_BUTTON_STYLE_ID)) return;

  const style = doc.createElement("style");
  style.id = COPY_BUTTON_STYLE_ID;
  style.textContent = `
pre {
  position: relative;
}
.copy-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  cursor: pointer;
  background: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px;
  opacity: 0.7;
  transition: opacity 0.2s;
}
.copy-btn:hover { opacity: 1; }
.copy-btn.copied {
  background: #d4edda;
  border-color: #28a745;
  color: #28a745;
}
`;
  doc.head.append(style);
}

function addCopyButtons(doc) {
  doc.querySelectorAll("pre").forEach((pre) => {
    if (pre.querySelector(".copy-btn")) return;

    const btn = doc.createElement("button");
    btn.className = "copy-btn";
    setButtonToCopyIcon(btn);
    btn.addEventListener("click", () => {
      const code = pre.querySelector("code")?.innerText ?? pre.innerText;
      navigator.clipboard.writeText(code).then(() => {
        setButtonToCopiedIcon(btn);
        btn.classList.add("copied");
        setTimeout(() => {
          setButtonToCopyIcon(btn);
          btn.classList.remove("copied");
        }, 2000);
      });
    });

    pre.append(btn);
  });
}

export function enableCopyButtons({doc = document, invalidation} = {}) {
  ensureStyles(doc);
  addCopyButtons(doc);

  const observer = new MutationObserver(() => addCopyButtons(doc));
  observer.observe(doc.body, {childList: true, subtree: true});

  if (invalidation && typeof invalidation.then === "function") {
    invalidation.then(() => observer.disconnect());
  }

  return () => observer.disconnect();
}
