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
  const formBg = winEl.querySelector("#formBg");
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
const bgKey = "win98-desktop-bg";
const txtKey = "win98-text";
const defaultTxt = "#000000";
const defaultBg = "#008080";
const openSettingsBtn = document.getElementById("open-settings-btn");
const settingsTemplate = document.getElementById("settings-window-template");

function changeDesktopColor(color, save = false) {
  if (!color) return;
  document.body.style.background = color;
  if (save) {
    localStorage.setItem(bgKey, color);
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
const savedBg = localStorage.getItem(bgKey) || defaultBg;
const savedTxt = localStorage.getItem(txtKey) || defaultTxt;
changeDesktopColor(savedBg, false);
changeTextColor(savedTxt, false);

let settingsWin = null;
let settingsInitialized = false;

function initSettingsLogic(winEl) {
  const formBg = winEl.querySelector("#settings-bg-form");
  const presetSelectBg = winEl.querySelector("#bg-preset");
  const colorInputBg = winEl.querySelector("#bg-custom");
  const currentBg = localStorage.getItem(bgKey) || defaultBg;

  const formTxt = winEl.querySelector("#settings-text-form");
  const presetSelectTxt = winEl.querySelector("#text-preset");
  const colorInputTxt = winEl.querySelector("#text-custom");
  const currentTxt = localStorage.getItem(txtKey) || defaultTxt;

  // Sæt startværdier til den aktuelle gemte baggrundsfarve
  if (colorInputBg) {
    colorInputBg.value = currentBg;
    colorInputBg.addEventListener("input", () => {
      changeDesktopColor(colorInputBg.value, false);
      if (presetSelectBg) {
        const match = [...presetSelectBg.options].find(
          (opt) => opt.value.toLowerCase() === colorInputBg.value.toLowerCase()
        );
        presetSelectBg.value = match ? match.value : "";
      }
    });
  }

  if (presetSelectBg) {
    const match = [...presetSelectBg.options].find(
      (opt) => opt.value.toLowerCase() === currentBg.toLowerCase()
    );
    if (match) presetSelectBg.value = match.value;

    presetSelectBg.addEventListener("change", () => {
      if (!presetSelectBg.value) return;
      if (colorInputBg) colorInputBg.value = presetSelectBg.value;
      changeDesktopColor(presetSelectBg.value, false);
    });
  }

  if (formBg) {
    formBg.addEventListener("submit", (e) => {
      e.preventDefault();
      const chosenColor = colorInputBg?.value || presetSelectBg?.value;
      changeDesktopColor(chosenColor, true);
    });
  }

  // Tekstfarve-valg
  if (colorInputTxt) {
    colorInputTxt.value = currentTxt;
    colorInputTxt.addEventListener("input", () => {
      changeTextColor(colorInputTxt.value, false);
      if (presetSelectTxt) {
        const match = [...presetSelectTxt.options].find(
          (opt) => opt.value.toLowerCase() === colorInputTxt.value.toLowerCase()
        );
        presetSelectTxt.value = match ? match.value : "";
      }
    });
  }

  if (presetSelectTxt) {
    const match = [...presetSelectTxt.options].find(
      (opt) => opt.value.toLowerCase() === currentTxt.toLowerCase()
    );
    if (match) presetSelectTxt.value = match.value;

    presetSelectTxt.addEventListener("change", () => {
      if (!presetSelectTxt.value) return;
      if (colorInputTxt) colorInputTxt.value = presetSelectTxt.value;
      changeTextColor(presetSelectTxt.value, false);
    });
  }

  if (formTxt) {
    formTxt.addEventListener("submit", (e) => {
      e.preventDefault();
      const chosenColor = colorInputTxt?.value || presetSelectTxt?.value;
      changeTextColor(chosenColor, true);
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