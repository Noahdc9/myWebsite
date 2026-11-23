let topZIndex = 1;

function focusWindow(winEl) {
  topZIndex += 1;
  winEl.style.zIndex = String(topZIndex);
}

function setupWindow(winEl) {
  const dragHandle = winEl.querySelector(".win98-titlebar");
  const closeBtn = winEl.querySelector(".win98-close-btn");

  winEl.addEventListener("mousedown", () => {
    focusWindow(winEl);
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      winEl.classList.add("win98-window--hidden");
    });
  }

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
  const rect = winEl.getBoundingClientRect();
  const minTop = 0;
  const maxTop = Math.max(0, window.innerHeight - rect.height);

  const clampedTop = Math.max(minTop, Math.min(newTop, maxTop));
  winEl.style.top = `${clampedTop}px`;
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
  const formBg = winEl.querySelector("#form");
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

  formBg.addEventListener("submit", async (e) => {
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

// Indstillinger-vindue
const bgKey1 = "win98-desktop-bg";
const bgKey2 = "win98-desktop-bg-2";
const txtKey = "win98-text";
const defaultTxt = "#000000";
const defaultBg1 = "#008080";
const defaultBg2 = "#e8cbd6";
const openSettingsBtn = document.getElementById("open-settings-btn");
const settingsTemplate = document.getElementById("settings-window-template");

function changeDesktopColor(color, color2, save = false) {
  if (!color) return;
  if (!color2) return;
  document.body.style.backgroundImage = `linear-gradient(${color},${color2 || defaultBg2})`;
  if (save) {
    localStorage.setItem(bgKey1, color);
    localStorage.setItem(bgKey2, color2);

  }
}

function changeTextColor(color, save = true) {
  if (!color) return;
  document.body.style.color = color;
  if (save) {
    localStorage.setItem(txtKey, color);
  }
}

// Anvend gemte farver ved sideindlæsning
const savedBg1 = localStorage.getItem(bgKey1) || defaultBg1;
const savedBg2 = localStorage.getItem(bgKey2) || defaultBg2;
const savedTxt = localStorage.getItem(txtKey) || defaultTxt;
changeDesktopColor(savedBg1, savedBg2,false);
changeTextColor(savedTxt, false);

let settingsWin = null;
let settingsInitialized = false;

function initSettingsLogic(winEl) {
  const colorInputBg1 = winEl.querySelector("#bg-custom");
  const currentBg1 = localStorage.getItem(bgKey1) || defaultBg1;
  
  const colorInputBg2 = winEl.querySelector("#bg-2-custom");
  const currentBg2 = localStorage.getItem(bgKey2) || defaultBg2;

  const colorInputTxt = winEl.querySelector("#text-custom");
  const currentTxt = localStorage.getItem(txtKey) || defaultTxt;

  const saveBtn = winEl.querySelector("#save-settings-button");
  if (saveBtn){
    saveBtn.addEventListener("click", (e)=>{
      e.preventDefault();
      const chosenBg1 = colorInputBg1?.value || defaultBg1;
    const chosenBg2 = colorInputBg2?.value ||  defaultBg2;
    const chosenTxt = colorInputTxt?.value ||  defaultTxt;

    changeDesktopColor(chosenBg1, chosenBg2, true);
    changeTextColor(chosenTxt, true);
    winEl.classList.add("win98-window--hidden");
    });
  }
  // Sæt startværdier til den aktuelle gemte baggrundsfarve
  if (colorInputBg1) {
    colorInputBg1.value = currentBg1;
    colorInputBg1.addEventListener("input", () => {
      changeDesktopColor(colorInputBg1.value,colorInputBg2.value, false);

    });
  }
    if (colorInputBg2) {
    colorInputBg2.value = currentBg2;
    colorInputBg2.addEventListener("input", () => {
      changeDesktopColor(colorInputBg1.value, colorInputBg2.value, false);

    });
  }

  // Tekstfarve-valg
  if (colorInputTxt) {
    colorInputTxt.value = currentTxt;
    colorInputTxt.addEventListener("input", () => {
      changeTextColor(colorInputTxt.value, false);

    });
  }


 }

openSettingsBtn.addEventListener("click", () => {
  if (!settingsWin) {
    const clone = settingsTemplate.content.cloneNode(true);
    document.body.appendChild(clone);
    settingsWin = document.getElementById("win98-settings");
    settingsWin.style.top = "80px";
    settingsWin.style.left = "220px";
    setupWindow(settingsWin);
  }

  settingsWin.classList.remove("win98-window--hidden");
  focusWindow(settingsWin);

  if (!settingsInitialized) {
    initSettingsLogic(settingsWin);
    settingsInitialized = true;
  }
});