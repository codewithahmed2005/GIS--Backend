import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const PORT = 5000;

// __dirname setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors());
app.use(express.json());

// Path to users file (fake database)
const usersPath = path.join(__dirname, "users.json");

// ---------------- AUTH ROUTES ----------------

// SIGNUP
app.post("/api/signup", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.json({ success: false, message: "All fields are required" });
  }

  // Read existing users
  let users = JSON.parse(fs.readFileSync(usersPath, "utf-8"));

  // Check if user exists
  const exists = users.find(u => u.email === email);
  if (exists) {
    return res.json({ success: false, message: "Email already registered" });
  }

  // New user
  const newUser = { id: Date.now(), name, email, password };
  users.push(newUser);

  // Save to DB
  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

  return res.json({ success: true, message: "Signup successful!" });
});

// LOGIN
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  let users = JSON.parse(fs.readFileSync(usersPath, "utf-8"));

  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.json({ success: false, message: "Invalid email or password" });
  }

  return res.json({
    success: true,
    message: "Login successful!",
    user: { id: user.id, name: user.name, email: user.email }
  });
});

// ---------------- FRONTEND SERVE ----------------
const frontendPath = path.join(__dirname, "../frontend");

app.use(express.static(frontendPath));

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 GIS Server running at http://localhost:${PORT}`);
});
