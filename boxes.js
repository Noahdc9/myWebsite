const win = document.getElementById("win98");
const dragHandle = document.getElementById("win98-drag");
let offsetX = 0;
let offsetY = 0;
let isDragging = false;

dragHandle.addEventListener("mousedown", (e) => {
  if (e.target.closest("button")) return;
  isDragging = true;
  offsetX = e.clientX - win.offsetLeft;
  offsetY = e.clientY - win.offsetTop;
});

document.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  win.style.left = `${e.clientX - offsetX}px`;
  win.style.top = `${e.clientY - offsetY}px`;
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

document.getElementById("openChatBtn").addEventListener("click", () => {
  win.style.display = "none";
});

document.getElementById("settingsBtn").addEventListener("click", () => {
  alert("");
});