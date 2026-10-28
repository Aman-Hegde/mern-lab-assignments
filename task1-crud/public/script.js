const form = document.getElementById("product-form");
const idInput = document.getElementById("item-id");
const nameInput = document.getElementById("name");
const priceInput = document.getElementById("price");
const submitButton = document.getElementById("submit-button");
const cancelButton = document.getElementById("cancel-button");
const productList = document.getElementById("product-list");
const message = document.getElementById("message");
const productCount = document.getElementById("product-count");

const RENDER_API_URL = "https://stockflow-api-aman.onrender.com";
const isLocalDevelopment = ["localhost", "127.0.0.1"].includes(window.location.hostname);
const API_BASE_URL = isLocalDevelopment ? "" : RENDER_API_URL;

function apiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

function showMessage(text, type = "success") {
  message.textContent = text;
  message.className = `message ${type}`;
}

function resetForm() {
  form.reset();
  idInput.value = "";
  submitButton.querySelector("span").textContent = "Submit";
  cancelButton.classList.add("hidden");
}

function makeButton(label, className, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.className = className;
  button.addEventListener("click", onClick);
  return button;
}

function renderProducts(items) {
  productList.replaceChildren();
  productCount.textContent = items.length;

  if (items.length === 0) {
    const row = productList.insertRow();
    const cell = row.insertCell();
    cell.colSpan = 4;
    cell.className = "empty-row";
    cell.textContent = "No products available.";
    return;
  }

  items.forEach((item) => {
    const row = productList.insertRow();
    row.insertCell().textContent = item.id;
    row.insertCell().textContent = item.name;
    row.insertCell().textContent = Number(item.price).toFixed(2);

    const actionCell = row.insertCell();
    actionCell.className = "action-buttons";
    actionCell.append(
      makeButton("Edit", "edit-button", () => startEditing(item)),
      makeButton("Delete", "delete-button", () => deleteProduct(item.id))
    );
  });
}

async function loadProducts() {
  try {
    const response = await fetch(apiUrl("/api/items"));
    if (!response.ok) throw new Error("Could not load products.");
    renderProducts(await response.json());
  } catch (error) {
    showMessage(error.message, "error");
  }
}

function startEditing(item) {
  idInput.value = item.id;
  nameInput.value = item.name;
  priceInput.value = item.price;
  submitButton.querySelector("span").textContent = "Update";
  cancelButton.classList.remove("hidden");
  nameInput.focus();
  showMessage(`Editing product #${item.id}.`);
}

async function deleteProduct(id) {
  if (!window.confirm("Are you sure you want to delete this product?")) return;

  try {
    const response = await fetch(apiUrl(`/api/items/${id}`), { method: "DELETE" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Could not delete product.");
    if (idInput.value === String(id)) resetForm();
    showMessage(result.message);
    await loadProducts();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const id = idInput.value;
  const payload = { name: nameInput.value.trim(), price: priceInput.value };
  if (!payload.name || payload.price === "" || Number(payload.price) < 0) {
    showMessage("Enter a name and a valid non-negative price.", "error");
    return;
  }

  submitButton.disabled = true;
  try {
    const response = await fetch(apiUrl(id ? `/api/items/${id}` : "/api/items"), {
      method: id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Could not save product.");

    resetForm();
    showMessage(id ? "Product updated successfully." : "Product added successfully.");
    await loadProducts();
  } catch (error) {
    showMessage(error.message, "error");
  } finally {
    submitButton.disabled = false;
  }
});

cancelButton.addEventListener("click", () => {
  resetForm();
  showMessage("Edit cancelled.");
});

loadProducts();
