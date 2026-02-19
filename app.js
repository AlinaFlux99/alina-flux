// Fetch products.json
fetch("products.json")
  .then(response => response.json())
  .then(data => {
    initApp(data);
  })
  .catch(error => {
    console.error("Error loading products:", error);
  });

function initApp(products) {

  // Sort newest first (higher code = newer)
  products.sort((a, b) => Number(b.code) - Number(a.code));

  const latestTool = products[0];
  const latestContainer = document.getElementById("latest-tool");
  const latestButton = document.getElementById("latest-button");

  // Display latest tool
  latestContainer.innerHTML = `
    <strong>Post #${latestTool.code}</strong> – ${latestTool.name}
  `;
  latestButton.href = latestTool.link;

  // Display latest 20 tools
  renderTools(products.slice(0, 20));

  // Search logic
  const searchInput = document.getElementById("searchInput");

  searchInput.addEventListener("input", function() {
    const query = this.value.toLowerCase().trim();

    if (query === "") {
      renderTools(products.slice(0, 20));
      return;
    }

    const filtered = products.filter(product =>
      product.code.includes(query) ||
      product.name.toLowerCase().includes(query)
    );

    renderTools(filtered);
  });
}

// Render tool cards
function renderTools(tools) {

  const container = document.getElementById("tools-container");
  const noResults = document.getElementById("no-results");

  container.innerHTML = "";

  if (tools.length === 0) {
    noResults.classList.remove("hidden");
    return;
  }

  noResults.classList.add("hidden");

  tools.forEach(tool => {
    const div = document.createElement("div");
    div.className = "tool-card";

    div.innerHTML = `
      <div class="tool-header">
        <span class="code">Post #${tool.code}</span>
        <span class="tag">${tool.tag}</span>
      </div>
      <h3>${tool.name}</h3>
      <p class="description">${tool.description}</p>
      <a href="${tool.link}" target="_blank" class="btn primary">Open</a>
    `;

    container.appendChild(div);
  });
}
