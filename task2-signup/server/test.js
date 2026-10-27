const assert = require("node:assert/strict");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const { app } = require("./server");

async function signup(baseUrl, body) {
  const response = await fetch(`${baseUrl}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { status: response.status, body: await response.json() };
}

async function runTests() {
  const originalFindOne = User.findOne;
  const originalCreate = User.create;
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  try {
    assert.equal((await signup(baseUrl, { email: "", password: "" })).status, 400);
    assert.equal((await signup(baseUrl, { email: "wrong", password: "123456" })).status, 400);
    assert.equal((await signup(baseUrl, { email: "student@example.com", password: "123" })).status, 400);

    User.findOne = () => ({ lean: async () => ({ email: "student@example.com" }) });
    const duplicate = await signup(baseUrl, { email: "Student@Example.com", password: "password123" });
    assert.equal(duplicate.status, 409);

    let savedUser;
    User.findOne = () => ({ lean: async () => null });
    User.create = async (user) => { savedUser = user; return user; };
    const success = await signup(baseUrl, { email: " Student@Example.com ", password: "password123" });
    assert.equal(success.status, 201);
    assert.deepEqual(success.body, { message: "User registered successfully" });
    assert.equal(savedUser.email, "student@example.com");
    assert.notEqual(savedUser.password, "password123");
    assert.equal(await bcrypt.compare("password123", savedUser.password), true);
    assert.equal(JSON.stringify(success.body).includes(savedUser.password), false);

    User.create = async () => { const error = new Error("duplicate key"); error.code = 11000; throw error; };
    assert.equal((await signup(baseUrl, { email: "student@example.com", password: "password123" })).status, 409);

    console.log("Task 2 tests passed: validation, normalization, duplicate handling, hashing, and safe response.");
    console.log("MongoDB persistence was not tested; these tests use stubbed model methods.");
  } finally {
    User.findOne = originalFindOne;
    User.create = originalCreate;
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

runTests().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

