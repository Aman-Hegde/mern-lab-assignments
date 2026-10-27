# MERN Lab Assignments

This folder contains two independent college lab applications. Run each application from its own folder.

## Prerequisites

- Node.js 20.19 or newer (or Node.js 22.12 or newer) and npm
- MongoDB Community Server or a MongoDB Atlas connection (Task 2 only)

## Task 1: CRUD Operations on an Array

### Objective

Task 1 demonstrates Create, Read, Update, and Delete operations using an HTML/CSS/JavaScript frontend and an Express REST API. Products are stored in a server-side JavaScript array, so changes reset when the server restarts.

### Technologies

- HTML5 and CSS3
- Vanilla JavaScript and the Fetch API
- Node.js and Express.js
- REST API

### How CRUD works

- **Create:** The form sends a `POST` request. Express assigns a unique ID and adds the product to the array.
- **Read:** The page sends a `GET` request when it opens and renders the returned array in the table.
- **Update:** Edit fills the form with an existing product. Submitting sends a `PUT` request for its ID.
- **Delete:** Delete asks for confirmation and sends a `DELETE` request for the selected ID.

### API endpoints

| Method | Endpoint | Purpose | Success status |
| --- | --- | --- | --- |
| GET | `/api/items` | Get every product | 200 |
| POST | `/api/items` | Create a product | 201 |
| PUT | `/api/items/:id` | Update one product | 200 |
| DELETE | `/api/items/:id` | Delete one product | 200 |

POST and PUT accept JSON such as:

```json
{
  "name": "Notebook",
  "price": 80
}
```

### Install and run Task 1

```powershell
cd task1-crud
npm install
npm start
```

Open <http://localhost:3000>. To use a different port in PowerShell, run `$env:PORT=3001; npm start`.
Run the automated API checks with `npm test`.

### Task 1 viva questions

1. **What is CRUD?** CRUD means Create, Read, Update, and Delete, the four basic operations performed on stored data.
2. **Why does the data reset after restarting?** Products are held only in a JavaScript array in process memory, not in permanent storage.
3. **Why are different HTTP methods used?** They communicate the operation clearly: GET reads, POST creates, PUT updates, and DELETE removes.
4. **How is the table updated without reloading the page?** The Fetch API requests JSON, and JavaScript rebuilds the table rows in the DOM.
5. **Why does the server validate data if the browser already does?** Client validation improves the user experience, but server validation protects the API from invalid direct requests.

## Task 2: React Signup with MongoDB

### Objective

Task 2 implements a signup process. React validates and submits the form, Express validates it again, bcrypt hashes the password, and Mongoose saves the user in MongoDB. Login is intentionally outside this assignment.

### Technologies

- React with Vite and CSS3
- Browser Fetch API
- Node.js, Express.js, and CORS
- MongoDB and Mongoose
- bcryptjs password hashing
- dotenv environment variables

### Signup flow

1. React checks that the email is valid and the password has at least six characters.
2. React sends `POST /api/auth/signup` to the Express backend.
3. Express repeats validation and normalizes the email to lowercase.
4. Mongoose checks whether that email already exists.
5. bcryptjs hashes the password with 10 salt rounds.
6. Mongoose stores the email and hash. The API returns only a success message, never the hash.

### Configure MongoDB

In the server folder, copy the example configuration:

```powershell
cd task2-signup\server
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

For a local MongoDB server, the example URI is ready to use:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/college_signup
```

For MongoDB Atlas, replace it with the connection string supplied by Atlas. Put the database user and password only in `.env`; never commit that file. If the Atlas password has special characters, URL-encode them. Add your current IP address to Atlas Network Access.

The client defaults to `http://localhost:5000`. To change the backend address, copy `client/.env.example` to `client/.env` and edit `VITE_API_URL`.

### Install and run Task 2

Open one PowerShell terminal for the backend:

```powershell
cd task2-signup\server
npm install
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
npm start
```

Open a second PowerShell terminal for React:

```powershell
cd task2-signup\client
npm install
npm run dev
```

Open the Vite address shown in the terminal, normally <http://localhost:5173>.

The server's `npm test` command checks validation, duplicate handling, email normalization, hashing, and response safety with stubbed model methods. It does not write to MongoDB. The client's `npm run build` command verifies that React compiles.

### Verify a registered user in MongoDB

With MongoDB Compass, connect using the URI from `.env`, open the `college_signup` database, and inspect the `users` collection. The document should contain a lowercase `email`, a bcrypt value in `password`, and timestamps. The password value must not equal the password entered in the form.

With `mongosh`, run:

```javascript
use college_signup
db.users.find({}, { email: 1, password: 1, createdAt: 1 })
```

Do not share the returned password hashes or connection credentials.

### Public repository safety

- Keep real credentials only in local `.env` files. The repository ignores `.env` and `.env.*` while allowing the safe `.env.example` templates.
- Do not use `git add -f` on an environment file and do not upload the project folder manually with hidden environment files included.
- Before every commit, inspect `git status --short --ignored` and confirm that `.env`, `node_modules`, `dist`, logs, and editor settings are not staged.
- If a credential is ever committed, remove it from Git history and rotate it immediately. Merely deleting the file in a later commit is not enough.

### Common errors and solutions

- **`MONGODB_URI is missing`:** Create `server/.env` from `.env.example` and restart the server.
- **`MongoDB connection failed`:** Start the local MongoDB service, or check the Atlas URI, database credentials, and IP access list.
- **`EADDRINUSE`:** Another app uses the port. Stop it or change `PORT` in the server `.env`.
- **Frontend says it cannot reach the server:** Start the backend and make sure `VITE_API_URL` uses the correct backend port.
- **CORS error:** Make sure `CLIENT_URL` in `server/.env` exactly matches the React address, then restart Express.
- **Email already registered:** Use another email, or delete the test document from the database if appropriate.
- **Changes to `.env` do not appear:** Restart the relevant Vite or Express development server.

### Task 2 viva questions

1. **Why hash a password?** Hashing stores a one-way representation, reducing harm if the database is exposed. Plaintext passwords must never be stored.
2. **What does Mongoose do?** It connects Node.js to MongoDB and provides schemas, models, validation, queries, and indexes.
3. **Why is email marked unique?** The unique MongoDB index guarantees that two documents cannot use the same normalized email, even if simultaneous requests occur.
4. **What is CORS?** Cross-Origin Resource Sharing tells the browser whether the React origin is allowed to call the API on another origin or port.
5. **Why validate on both frontend and backend?** Frontend validation gives quick feedback; backend validation is the trusted security and data-integrity boundary.

## Project structure

```text
mern-lab-assignments/
  task1-crud/             Express server and static HTML/CSS/JS
  task2-signup/
    client/               React and Vite frontend
    server/               Express, Mongoose, and bcrypt API
```
