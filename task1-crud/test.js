const assert = require("node:assert/strict");
const app = require("./server");

async function request(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const body = await response.json();
  return { status: response.status, body };
}

async function runTests() {
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    const home = await fetch(baseUrl);
    assert.equal(home.status, 200);
    assert.match(await home.text(), /Product Management/);

    const initial = await request(baseUrl, "/api/items");
    assert.equal(initial.status, 200);
    assert.deepEqual(initial.body.map((item) => item.name), ["Book", "Pen"]);

    const created = await request(baseUrl, "/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Notebook", price: 80 }),
    });
    assert.equal(created.status, 201);
    assert.equal(created.body.id, 3);

    const updated = await request(baseUrl, `/api/items/${created.body.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Large Notebook", price: 95.5 }),
    });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.name, "Large Notebook");
    assert.equal(updated.body.price, 95.5);

    const invalid = await request(baseUrl, "/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "", price: -1 }),
    });
    assert.equal(invalid.status, 400);
    assert.ok(invalid.body.message);

    const deleted = await request(baseUrl, `/api/items/${created.body.id}`, { method: "DELETE" });
    assert.equal(deleted.status, 200);

    const finalItems = await request(baseUrl, "/api/items");
    assert.equal(finalItems.body.some((item) => item.id === created.body.id), false);

    const missing = await request(baseUrl, "/api/items/99999", { method: "DELETE" });
    assert.equal(missing.status, 404);

    console.log("Task 1 tests passed: frontend, GET, POST, PUT, DELETE, validation, and 404 handling.");
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

runTests().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

