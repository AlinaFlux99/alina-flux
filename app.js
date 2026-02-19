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

// ---------- Load products ----------
fetch(`products.json?ts=${Date.now()}`, { cache: "no-store" })
  .then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  })
  .then((data) => initApp(Array.isArray(data) ? data : []))
  .catch((err) => console.error("Error loading products:", err));

function initApp(products) {
  // Sort newest first (higher code = newer)
  products.sort((a, b) => toNum(b.code) - toNum(a.code));

  // Latest tool
  const latestTool = products[0];
  const latestContainer = byId("latest-tool");
  const latestButton = byId("latest-button");

  if (latestTool && latestContainer && latestButton) {
    const code = safeText(latestTool.code);
    const name = safeText(latestTool.name);

    latestContainer.innerHTML = `
      <span class="latest-code">Post #${code}</span>
      <span class="latest-sep">—</span>
      <span class="latest-name">${escapeHtml(name)}</span>
    `;

    latestButton.href = safeText(latestTool.link, "#");
    latestButton.setAttribute("rel", "noopener noreferrer");
    latestButton.setAttribute("target", "_blank");
    latestButton.setAttribute("aria-label", `Open latest: ${name}`);
  }

  // Render initial (top 20)
  const initial = products.slice(0, 20);
  renderTools(initial);

  // Autofocus search + glow on load (Instagram-friendly)
  const searchInput = byId("searchInput");
  if (searchInput) {
    // Put cursor in search automatically
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

    // Enter opens the first result (fast mobile flow)
    searchInput.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      const first = document.querySelector(".tool-card-link");
      if (first && first.href) window.open(first.href, "_blank", "noopener");
    });
  }
}

// ---------- Render tool cards (ENTIRE CARD CLICKABLE) ----------
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
    const link = safeText(tool.link, "#");

    // Use <a> as the whole card (so card is clickable)
    // IMPORTANT: No nested <a> inside to avoid layout breaking.
    const card = document.createElement("a");
    card.className = "tool-card tool-card-link";
    card.href = link;
    card.target = "_blank";
    card.rel = "noopener noreferrer";
    card.setAttribute("aria-label", `Open Post #${code}: ${name}`);

    card.innerHTML = `
      <div class="tool-top">
        <div class="tool-meta">
          <span class="code">Post #${escapeHtml(code)}</span>
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

// ---------- Minimal HTML escape (prevents breaking UI) ----------
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
