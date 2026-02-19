// Auto focus search on load
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.focus();
  }
});

// Fetch products
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

  // Latest tool
  latestContainer.innerHTML = `
    <span class="code-badge">CODE</span>
    <strong>#${latestTool.code}</strong> — ${latestTool.name}
  `;
  latestButton.href = latestTool.link;

  // Show first 20
  renderTools(products.slice(0, 20));

  // Search
  const searchInput = document.getElementById("searchInput");

  searchInput.addEventListener("input", function () {
    const query = this.value.toLowerCase().trim();

    if (!query) {
      renderTools(products.slice(0, 20));
      return;
    }

    const filtered = products.filter(p =>
      p.code.includes(query) ||
      p.name.toLowerCase().includes(query)
    );

    renderTools(filtered);
  });
}

// Render tools
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

    const card = document.createElement("a");
    card.className = "tool-card";
    card.href = tool.link;
    card.target = "_blank";
    card.rel = "noopener";

    card.innerHTML = `
      <div class="tool-top">
        <div class="code-group">
          <span class="code-label">CODE</span>
          <span class="code-number">#${tool.code}</span>
        </div>
        <span class="tag">${tool.tag}</span>
      </div>

      <h3>${tool.name}</h3>
      <p class="description">${tool.description}</p>

      <div class="card-footer">
        <span class="open-text">Open →</span>
      </div>
    `;

    container.appendChild(card);
  });
}
