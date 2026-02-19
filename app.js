/* =========================================================
   Alina Flux – Premium App Logic v2
   Clean • Fast • Clickable Cards • Auto Focus
   ========================================================= */

// Load products
fetch("products.json")
  .then(res => res.json())
  .then(data => initApp(data))
  .catch(err => console.error("Error loading products:", err));

function initApp(products) {

  // Sort newest first
  products.sort((a, b) => Number(b.code) - Number(a.code));

  const latestTool = products[0];
  const latestContainer = document.getElementById("latest-tool");
  const latestButton = document.getElementById("latest-button");
  const searchInput = document.getElementById("searchInput");

  /* =========================
     Latest Tool Section
  ========================== */

  latestContainer.innerHTML = `
    <strong>Post #${latestTool.code}</strong> – ${latestTool.name}
  `;

  latestButton.href = latestTool.link;

  /* =========================
     Render Default (Top 20)
  ========================== */

  renderTools(products.slice(0, 20));

  /* =========================
     Auto Focus Search
  ========================== */

  window.addEventListener("load", () => {
    searchInput.focus();
  });

  /* =========================
     Search Logic
  ========================== */

  searchInput.addEventListener("input", function () {
    const query = this.value.toLowerCase().trim();

    if (query === "") {
      renderTools(products.slice(0, 20));
      return;
    }

    const filtered = products.filter(product =>
      String(product.code).includes(query) ||
      product.name.toLowerCase().includes(query)
    );

    renderTools(filtered);
  });
}


/* =========================================================
   Render Tool Cards
   Entire Card Clickable
   ========================================================= */

function renderTools(tools) {

  const container = document.getElementById("tools-container");
  const noResults = document.getElementById("no-results");

  container.innerHTML = "";

  if (!tools.length) {
    noResults.classList.remove("hidden");
    return;
  }

  noResults.classList.add("hidden");

  tools.forEach(tool => {

    // Create clickable card wrapper (anchor)
    const card = document.createElement("a");
    card.href = tool.link;
    card.target = "_blank";
    card.className = "tool-card";
    card.style.textDecoration = "none";
    card.style.color = "inherit";

    card.innerHTML = `
      <div class="tool-header">
        <span class="code">Post #${tool.code}</span>
        <span class="tag">${tool.tag}</span>
      </div>

      <h3>${tool.name}</h3>

      <p class="description">
        ${tool.description}
      </p>

      <div class="button-row">
        <span class="btn">Open</span>
      </div>
    `;

    container.appendChild(card);
  });
}
