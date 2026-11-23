let topZIndex = 1;

function focusWindow(winEl) {
  topZIndex += 1;
  winEl.style.zIndex = String(topZIndex);
}

function setupWindow(winEl) {
  const dragHandle = winEl.querySelector(".win98-titlebar");
  const closeBtn = winEl.querySelector(".win98-close-btn");

  // Bring vinduet forrest ved klik hvor som helst i vinduet
  winEl.addEventListener("mousedown", () => {
    focusWindow(winEl);
  });

  // Luk vinduet uden at slette det fra DOM'en
  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      winEl.classList.add("win98-window--hidden");
    });
  }

  // Drag-and-drop på titelbjælken
  if (dragHandle) {
    let offsetX = 0;
    let offsetY = 0;
    let isDragging = false;

    dragHandle.addEventListener("mousedown", (e) => {
      if (e.target.closest("button")) return;
      focusWindow(winEl);
      isDragging = true;
      offsetX = e.clientX - winEl.offsetLeft;
      offsetY = e.clientY - winEl.offsetTop;
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      winEl.style.left = `${e.clientX - offsetX}px`;
      win98StyleTop(winEl, e.clientY - offsetY);
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
    });
  }
}

function win98StyleTop(winEl, newTop) {
  winEl.style.top = `${newTop}px`;
}

// Sæt startvinduet op
const mainWin = document.getElementById("win98-main");
setupWindow(mainWin);
focusWindow(mainWin);

// Gæstebogsvindue via <template>
const openGuestbookBtn = document.getElementById("open-guestbook-btn");
const guestbookTemplate = document.getElementById("guestbook-window-template");

let guestbookWin = null;
let guestbookInitialized = false;

function initGuestbookLogic(winEl) {
  const form = winEl.querySelector("#form");
  const nameInput = winEl.querySelector("#name");
  const textInput = winEl.querySelector("#text");
  const list = winEl.querySelector("#messages");
  const status = winEl.querySelector("#status");

  async function load() {
    try {
      const res = await fetch("/api/messages");
      const messages = await res.json();
      list.replaceChildren();

      for (const m of messages) {
        const div = document.createElement("div");
        div.className = "msg";

        const meta = document.createElement("div");
        meta.className = "meta";
        meta.textContent = `${m.name} · ${m.created}`;

        const body = document.createElement("div");
        body.textContent = m.text;

        div.append(meta, body);
        list.append(div);
      }
    } catch (e) {
      status.textContent = "Kunne ikke hente beskeder.";
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.textContent = "Sender...";

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameInput.value,
          text: textInput.value
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        status.textContent = err.error || "Noget gik galt.";
        return;
      }

      textInput.value = "";
      status.textContent = "Sendt!";
      await load();
    } catch (e) {
      status.textContent = "Kunne ikke sende.";
    }
  });

  load();
}

openGuestbookBtn.addEventListener("click", () => {
  if (!guestbookWin) {
    const clone = guestbookTemplate.content.cloneNode(true);
    document.body.appendChild(clone);
    guestbookWin = document.getElementById("win98-guestbook");
    guestbookWin.style.top = "110px";
    guestbookWin.style.left = "160px";
    setupWindow(guestbookWin);
  }

  guestbookWin.classList.remove("win98-window--hidden");
  focusWindow(guestbookWin);

  if (!guestbookInitialized) {
    initGuestbookLogic(guestbookWin);
    guestbookInitialized = true;
  }
});