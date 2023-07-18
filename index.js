const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const app = express();

app.use(cors());
app.use(express.json());

// Portfolios
let portfolios = [];

// users
const users = [];

// Register
app.post("/auth/register", (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    res.status(300);
    return res.json({ message: '"name" and "password" is required!' });
  }

  if (typeof name !== "string" || typeof password !== "string") {
    res.status(300);
    return res.json({
      message: "The type of name and password must be String!",
    });
  }

  if (users.find((user) => user.name === name)) {
    res.status(400);
    return res.json({ message: "This username is already registered." });
  }

  if (
    name.length > 4 &&
    name.length < 16 &&
    password.length > 4 &&
    password.length < 12
  ) {
    const user = {
      name,
      password,
      _id: String(new Date().getTime()),
      access_token:
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15),
    };

    users.push(user);

    res.json({
      message: "You have successfully registered.",
      user: { _id: user._id, name: user.name },
      token: user.access_token,
    });
  } else {
    res.status(401);
    return res.json({
      message:
        "Invalid requirement. 'name' must be at least 4 and at most 16 characters. The 'password' must be at least 4 and at most 12 characters long.",
    });
  }
});

// Login
app.post("/auth/login", (req, res) => {
  const { name, password } = req.body;

  if (users.find((user) => user.name === name && user.password === password)) {
    let currentUser = users.find((user) => (user.name === name ? user : null));

    res.json({
      message: "success",
      user: { _id: currentUser._id, name: currentUser.name },
      token: currentUser.access_token,
    });
  } else {
    res.status(401);
    res.json({ message: "Invalid login or password." });
  }
});

// UserME
app.get("/auth/userme", (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    res.status(400);
    return res.json({ message: "Token not found in request headers." });
  }

  const currentUser = users.find((user) => user.access_token === token);
  if (!currentUser) {
    res.status(401);
    return res.json({ message: "Unauthorized. Token not found in database." });
  }

  res.status(200);
  return res.json({ user: { _id: currentUser._id, name: currentUser.name } });
});

// GET Portfolios
app.get("/portfolios", (req, res) => {
  res.json(portfolios);
});

// POST Portfolios
app.post("/portfolios", (req, res) => {
  const { title, img, project_link, github_link } = req.body;
  const token = req?.headers?.authorization;
  portfolios.push({ title, img, project_link, github_link: github_link || null, id: uuidv4() });

  res.status(201);
  res.json({ message: "Post successfully added!", data: portfolios });
});

// Run the server and report out to the logs
app.listen(2208, () => {
  console.log("Server started on port 2208");
});
