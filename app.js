// app.js (FULL REPLACE)

// ---------- Helpers ----------
const byId = (id) => document.getElementById(id);

function toNum(x) {
  const n = parseInt(String(x).replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
}

function safeText(x, fallback = "") {
  if (x === null || x === undefined) return fallback;
  return String(x);
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ---------- Popup State ----------
let allProducts = [];
let pendingRedirectUrl = "#";
let pendingTool = null;

// ---------- Load products ----------
fetch(`products.json?ts=${Date.now()}`, { cache: "no-store" })
  .then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  })
  .then((data) => {
    allProducts = Array.isArray(data) ? data : [];
    initApp(allProducts);
  })
  .catch((err) => console.error("Error loading products:", err));

// ---------- Init App ----------
function initApp(products) {
  // Sort newest first (higher code = newer)
  products.sort((a, b) => toNum(b.code) - toNum(a.code));

  setupPopup();

  // Latest tool
  const latestTool = products[0];
  const latestContainer = byId("latest-tool");
  const latestButton = byId("latest-button");

  if (latestTool && latestContainer && latestButton) {
    const code = safeText(latestTool.code);
    const name = safeText(latestTool.name);

    latestContainer.innerHTML = `
      <span class="latest-code">Code ${escapeHtml(code)}</span>
      <span class="latest-sep">—</span>
      <span class="latest-name">${escapeHtml(name)}</span>
    `;

    latestButton.href = safeText(latestTool.link, "#");
    latestButton.setAttribute("rel", "noopener noreferrer");
    latestButton.setAttribute("aria-label", `Open latest: ${name}`);

    latestButton.addEventListener("click", (e) => {
      e.preventDefault();
      openToolkitPopup(latestTool);
    });
  }

  // Render initial (top 20)
  renderTools(products.slice(0, 20));

  // Autofocus search + glow on load
  const searchInput = byId("searchInput");
  if (searchInput) {
    setTimeout(() => {
      searchInput.focus({ preventScroll: true });
      searchInput.classList.add("glow-on");
      setTimeout(() => searchInput.classList.remove("glow-on"), 900);
    }, 250);

    // Debounced search
    let t = null;
    searchInput.addEventListener("input", function () {
      clearTimeout(t);
      t = setTimeout(() => {
        const query = this.value.toLowerCase().trim();

        if (!query) {
          renderTools(products.slice(0, 20));
          return;
        }

        const filtered = products.filter((p) => {
          const code = safeText(p.code).toLowerCase();
          const name = safeText(p.name).toLowerCase();
          return code.includes(query) || name.includes(query);
        });

        renderTools(filtered);
      }, 80);
    });

    // Enter opens popup for the first result
    searchInput.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;

      e.preventDefault();

      const query = searchInput.value.toLowerCase().trim();

      let filtered = products;
      if (query) {
        filtered = products.filter((p) => {
          const code = safeText(p.code).toLowerCase();
          const name = safeText(p.name).toLowerCase();
          return code.includes(query) || name.includes(query);
        });
      }

      const firstTool = filtered[0];
      if (firstTool) {
        openToolkitPopup(firstTool);
      }
    });
  }
}

// ---------- Popup Setup ----------
function setupPopup() {
  const popup = byId("toolkit-popup");
  const popupClose = byId("popup-close");
  const popupContinue = byId("popup-continue");
  const popupForm = byId("toolkit-form");
  const popupEmail = byId("popup-email");

  if (!popup) return;

  if (popupClose) {
    popupClose.addEventListener("click", closeToolkitPopup);
  }

  if (popup) {
    popup.addEventListener("click", (e) => {
      if (e.target === popup) {
        closeToolkitPopup();
      }
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !popup.classList.contains("hidden")) {
      closeToolkitPopup();
    }
  });

  if (popupContinue) {
    popupContinue.addEventListener("click", () => {
      redirectToPendingTool();
    });
  }

  if (popupForm) {
    popupForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = popupEmail ? popupEmail.value.trim() : "";
      const messageEl = byId("popup-message");
      const submitBtn = byId("popup-submit");

      if (!email || !isValidEmail(email)) {
        showPopupMessage("Please enter a valid email address.");
        return;
      }

      try {
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = "Sending...";
        }

        clearPopupMessage();

        const payload = {
          email,
          source: "alinaflux_popup",
          tool_code: pendingTool ? safeText(pendingTool.code) : "",
          tool_name: pendingTool ? safeText(pendingTool.name) : "",
          redirect_url: pendingRedirectUrl
        };

        const res = await fetch("/api/subscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          throw new Error(`Subscribe failed: HTTP ${res.status}`);
        }

        if (messageEl) {
          messageEl.classList.remove("hidden");
          messageEl.textContent = "Toolkit sent. Redirecting you to the tool...";
        }

        setTimeout(() => {
          redirectToPendingTool();
        }, 900);
      } catch (err) {
        console.error("Subscription error:", err);
        showPopupMessage("Something went wrong. Please try again or continue to the tool.");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Unlock Free Toolkit";
        }
      }
    });
  }
}

function openToolkitPopup(tool) {
  const popup = byId("toolkit-popup");
  const popupEmail = byId("popup-email");

  pendingTool = tool || null;
  pendingRedirectUrl = tool && tool.link ? safeText(tool.link, "#") : "#";

  clearPopupMessage();

  if (popupEmail) {
    popupEmail.value = "";
  }

  if (popup) {
    popup.classList.remove("hidden");
    popup.setAttribute("aria-hidden", "false");
  }

  setTimeout(() => {
    if (popupEmail) popupEmail.focus();
  }, 60);
}

function closeToolkitPopup() {
  const popup = byId("toolkit-popup");
  if (!popup) return;

  popup.classList.add("hidden");
  popup.setAttribute("aria-hidden", "true");
  clearPopupMessage();
}

function redirectToPendingTool() {
  const url = pendingRedirectUrl || "#";
  closeToolkitPopup();

  if (url && url !== "#") {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

function showPopupMessage(message) {
  const messageEl = byId("popup-message");
  if (!messageEl) return;

  messageEl.textContent = message;
  messageEl.classList.remove("hidden");
}

function clearPopupMessage() {
  const messageEl = byId("popup-message");
  if (!messageEl) return;

  messageEl.textContent = "";
  messageEl.classList.add("hidden");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ---------- Render tool cards ----------
function renderTools(tools) {
  const container = byId("tools-container");
  const noResults = byId("no-results");
  if (!container) return;

  container.innerHTML = "";

  if (!tools || tools.length === 0) {
    if (noResults) noResults.classList.remove("hidden");
    return;
  }

  if (noResults) noResults.classList.add("hidden");

  tools.forEach((tool) => {
    const code = safeText(tool.code);
    const name = safeText(tool.name);
    const desc = safeText(tool.description);
    const tag = safeText(tool.tag);

    const card = document.createElement("a");
    card.className = "tool-card tool-card-link";
    card.href = safeText(tool.link, "#");
    card.setAttribute("aria-label", `Open Code ${code}: ${name}`);

    card.addEventListener("click", (e) => {
      e.preventDefault();
      openToolkitPopup(tool);
    });

    card.innerHTML = `
      <div class="tool-top">
        <div class="tool-meta">
          <span class="code">Code ${escapeHtml(code)}</span>
          ${tag ? `<span class="tag">${escapeHtml(tag)}</span>` : ""}
        </div>
        <span class="cta">Open</span>
      </div>

      <h3 class="tool-title">${escapeHtml(name)}</h3>
      ${desc ? `<p class="description">${escapeHtml(desc)}</p>` : ""}
    `;

    container.appendChild(card);
  });
}
