const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const app = express();

app.use(cors());
app.use(express.json());

// Portfolios
let portfolios = [];

// users
let users = [];

// Register
app.post("/auth/register", async (req, res) => {
  let name = "";
  let password = "";

  try {
    name = req?.body?.name;
    password = req?.body?.password;
  } catch (error) {
    console.log(error);
  }

  if (typeof name !== "string" || typeof password !== "string") {
    res.status(400);
    return res.json({
      message: "The type of name and password must be String!",
    });
  }

  if (users.find((user) => user.name === name)) {
    res.status(400);
    return res.json({ message: "This username is already registered." });
  }

  if (
    name.length < 4 ||
    name.length > 16 ||
    password.length < 4 ||
    password.length > 12
  ) {
    res.status(401);
    return res.json({
      message:
        "Invalid requirement. 'name' must be at least 4 and at most 16 characters. The 'password' must be at least 4 and at most 12 characters long.",
    });
  }

  const user = {
    name,
    password,
    _id: String(new Date().getTime()),
    access_token:
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15),
  };

  users.push(user);

  res.status(201);
  res.json({
    message: "You have successfully registered.",
    user: { _id: user._id, name: user.name },
    token: user.access_token,
  });
});

// Login
app.post("/auth/login", (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    res.status(400);
    return res.json({ message: "Invalid login or password." });
  }

  const currentUser = users.find((user) => user.name === name && user.password === password);

  if (currentUser) {
    res.status(200);
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
  res.json({ user: { _id: currentUser._id, name: currentUser.name } });
});

// GET Portfolios
app.get("/portfolios", (req, res) => {
  res.status(200);
  res.json(portfolios);
});

// POST Portfolios
app.post("/portfolios", (req, res) => {
  const token = req.headers.authorization;
  const isValidToken = users.find((user) => user.access_token === token);

  if (!token) {
    res.status(400);
    return res.json({ message: "Token not found in request headers." });
  }

  if (!isValidToken) {
    res.status(401);
    return res.json({ message: "Unauthorized. Token not found in database." });
  }

  const { title, img, project_link } = req.body;

  if (!title || !img || !project_link) {
    res.status(400);
    return res.json({
      message: '"title", "img", and "project_link" are required fields!',
    });
  }

  const newPortfolio = {
    id: uuidv4(),
    title,
    img,
    project_link,
  };

  portfolios.push(newPortfolio);

  res.status(201);
  res.json(portfolios);
});

// PUT Current Portfolio
app.put("/portfolios/:id", (req, res) => {
  const token = req.headers.authorization;
  const isValidToken = users.find((user) => user.access_token === token);

  if (!token) {
    res.status(400);
    return res.json({ message: "Token not found in request headers." });
  }

  if (!isValidToken) {
    res.status(401);
    return res.json({ message: "Unauthorized. Token not found in database." });
  }

  const { id } = req.params;
  const { title, img, project_link } = req.body;

  if (!id) {
    res.status(404);
    return res.json({ message: "Not Found!" });
  }

  if (!title || !img || !project_link) {
    res.status(400);
    return res.json({
      message: '"title", "img", and "project_link" are required fields!',
    });
  }

  const portfolioIndex = portfolios.findIndex((portfolio) => portfolio.id === id);

  if (portfolioIndex === -1) {
    res.status(404);
    return res.json({ message: "Portfolio not found!" });
  }

  const editedPortfolio = {
    id,
    title,
    img,
    project_link,
  };

  portfolios[portfolioIndex] = editedPortfolio;

  res.status(200);
  res.json(portfolios);
});

// Run the server and report out to the logs
app.listen(2208, () => {
  console.log("Server started on port 2208");
});
