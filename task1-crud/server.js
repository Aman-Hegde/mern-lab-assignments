const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// This array acts as temporary storage and resets whenever the server restarts.
let items = [
  { id: 1, name: "Book", price: 250 },
  { id: 2, name: "Pen", price: 25 },
];
let nextId = 3;

function validateItem(body) {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const price = Number(body.price);

  if (!name) {
    return { error: "Name is required." };
  }

  if (body.price === "" || body.price === null || body.price === undefined || !Number.isFinite(price) || price < 0) {
    return { error: "Price must be a non-negative number." };
  }

  return { value: { name, price } };
}

app.get("/api/items", (req, res) => {
  res.json(items);
});

app.post("/api/items", (req, res) => {
  const validation = validateItem(req.body || {});
  if (validation.error) {
    return res.status(400).json({ message: validation.error });
  }

  const item = { id: nextId++, ...validation.value };
  items.push(item);
  return res.status(201).json(item);
});

app.put("/api/items/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = items.findIndex((item) => item.id === id);

  if (!Number.isInteger(id) || index === -1) {
    return res.status(404).json({ message: "Product not found." });
  }

  const validation = validateItem(req.body || {});
  if (validation.error) {
    return res.status(400).json({ message: validation.error });
  }

  items[index] = { id, ...validation.value };
  return res.json(items[index]);
});

app.delete("/api/items/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = items.findIndex((item) => item.id === id);

  if (!Number.isInteger(id) || index === -1) {
    return res.status(404).json({ message: "Product not found." });
  }

  const [deletedItem] = items.splice(index, 1);
  return res.json({ message: "Product deleted successfully.", item: deletedItem });
});

// Return JSON for unknown API routes instead of the HTML application.
app.use("/api", (req, res) => {
  res.status(404).json({ message: "API route not found." });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Task 1 server running at http://localhost:${PORT}`);
  });
}

module.exports = app;

