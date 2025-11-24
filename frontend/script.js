const API_BASE_URL = "http://localhost:8000";

document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  fetchAndRenderMedicines();
});

function showStatus(message, type = "info") {
  const statusEl = document.getElementById("status");
  if (!statusEl) return;

  statusEl.textContent = message;
  statusEl.className = ""; // reset
  statusEl.classList.add(`status-${type}`); // for styling
}

// ------- Fetch & render medicines -------

async function fetchAndRenderMedicines() {
  showStatus("Loading medicines...", "info");

  try {
    const response = await fetch(`${API_BASE_URL}/medicines`);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();

    // The backend returns something like { "medicines": [ ... ] }
    const medicines = Array.isArray(data.medicines) ? data.medicines : [];



    renderMedicines(medicines);
    showStatus(`Loaded ${medicines.length} medicines.`, "success");
  } catch (error) {
    console.error("Failed to fetch medicines:", error);
    showStatus("Failed to load medicines. Please try again.", "error");
  }
}

function renderMedicines(medicines) {
  const tbody = document.getElementById("medicines-table-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (!Array.isArray(medicines) || medicines.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 2;
    cell.textContent = "No medicines available.";
    row.appendChild(cell);
    tbody.appendChild(row);
    return;
  }

  medicines.forEach((med) => {
    // Defensive checks to handle missing/invalid data
    const safeName =
      typeof med.name === "string" && med.name.trim()
        ? med.name
        : "Unknown name";

    let safePriceDisplay = "N/A";
    if (med.price !== undefined && med.price !== null) {
      const priceNumber = Number(med.price);
      if (!Number.isNaN(priceNumber)) {
        safePriceDisplay = priceNumber.toFixed(2);
      }
    }

    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = safeName;

    const priceCell = document.createElement("td");
    priceCell.textContent = safePriceDisplay;

    row.appendChild(nameCell);
    row.appendChild(priceCell);

    tbody.appendChild(row);
  });
}

// ------- Event listeners for forms & buttons -------

function setupEventListeners() {
  const createForm = document.getElementById("create-form");
  const updateForm = document.getElementById("update-form");
  const deleteForm = document.getElementById("delete-form");
  const averageBtn = document.getElementById("average-btn");

  if (createForm) {
    createForm.addEventListener("submit", handleCreate);
  }

  if (updateForm) {
    updateForm.addEventListener("submit", handleUpdate);
  }

  if (deleteForm) {
    deleteForm.addEventListener("submit", handleDelete);
  }

  if (averageBtn) {
    averageBtn.addEventListener("click", handleAverageClick);
  }
}

// ------- Create medicine -------

async function handleCreate(event) {
  event.preventDefault();

  const form = event.target;
  const name = form.querySelector("#create-name")?.value.trim();
  const price = form.querySelector("#create-price")?.value;

  if (!name || !price) {
    showStatus("Please provide both name and price.", "error");
    return;
  }

  try {
    const body = new URLSearchParams();
    body.append("name", name);
    body.append("price", price);

    const response = await fetch(`${API_BASE_URL}/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error || "Create failed");
    }

    showStatus(data.message || "Medicine created successfully.", "success");
    form.reset();
    fetchAndRenderMedicines();
  } catch (error) {
    console.error("Create error:", error);
    showStatus("Failed to create medicine.", "error");
  }
}

// ------- Update medicine -------

async function handleUpdate(event) {
  event.preventDefault();

  const form = event.target;
  const name = form.querySelector("#update-name")?.value.trim();
  const price = form.querySelector("#update-price")?.value;

  if (!name || !price) {
    showStatus("Please provide both name and new price.", "error");
    return;
  }

  try {
    const body = new URLSearchParams();
    body.append("name", name);
    body.append("price", price);

    const response = await fetch(`${API_BASE_URL}/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error || "Update failed");
    }

    showStatus(data.message || "Medicine updated successfully.", "success");
    form.reset();
    fetchAndRenderMedicines();
  } catch (error) {
    console.error("Update error:", error);
    showStatus("Failed to update medicine.", "error");
  }
}

// ------- Delete medicine -------

async function handleDelete(event) {
  event.preventDefault();

  const form = event.target;
  const name = form.querySelector("#delete-name")?.value.trim();

  if (!name) {
    showStatus("Please provide the name of the medicine to delete.", "error");
    return;
  }

  try {
    const body = new URLSearchParams();
    body.append("name", name);

    const response = await fetch(`${API_BASE_URL}/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    const data = await response.json();

    if (!response.ok || data.error) {
      throw new Error(data.error || "Delete failed");
    }

    showStatus(data.message || "Medicine deleted successfully.", "success");
    form.reset();
    fetchAndRenderMedicines();
  } catch (error) {
    console.error("Delete error:", error);
    showStatus("Failed to delete medicine.", "error");
  }
}

// ------- Average price -------

async function handleAverageClick() {
  try {
    const response = await fetch(`${API_BASE_URL}/medicines/average-price`);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const data = await response.json();

    if (data.average_price == null || data.count === 0) {
      showStatus("No valid prices available to calculate an average.", "info");
      return;
    }

    const rounded = Number(data.average_price).toFixed(2);
    showStatus(
      `Average price: ${rounded} (across ${data.count} medicines)`,
      "success"
    );
  } catch (error) {
    console.error("Average price error:", error);
    showStatus("Failed to fetch average price.", "error");
  }
}
