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
app.post("/portfolios", async (req, res) => {
  const token = req.headers.authorization;
  const isValidToken = users.find((user) => user.token === token);

  if (!token) {
    res.status(400);
    return res.json({ message: "Token not found in request headers." });

  } else if(!isValidToken) {
    res.status(401);
    return res.json({ message: "Unauthorized. Token not found in database." });
  }

  if (!req?.body?.title) {
    res.status(400);
    return res.json('"title" is a required!');
  }
  if (!req?.body?.img) {
    res.status(400);
    return res.json('"img" is a required!');
  }
  if (!req?.body?.project_link) {
    res.status(400);
    return res.json('"project_link" is a required!');
  }

  const newPortfolio = await req.body;
  portfolios.push({ ...newPortfolio, id: uuidv4() });

  res.status(201);
  res.json(portfolios);
});

// PUT Current Portfolio
app.put("/portfolio", async (req, res) => {
  const token = req.headers.authorization;
  const isValidToken = users.find((user) => user.token === token);

  if (!token) {
    res.status(400);
    return res.json({ message: "Token not found in request headers." });

  } else if(!isValidToken) {
    res.status(401);
    return res.json({ message: "Unauthorized. Token not found in database." });
  }

  if (!req?.body?.id) {
    res.status(404);
    return res.json('Not Found!');
  }
  if (!req?.body?.title) {
    res.status(400);
    return res.json('"title" is a required!');
  }
  if (!req?.body?.img) {
    res.status(400);
    return res.json('"img" is a required!');
  }
  if (!req?.body?.project_link) {
    res.status(400);
    return res.json('"project_link" is a required!');
  }

  const postId = await req.body.id;
  const editedPost = await req.body;

  portfolios = portfolios.filter((post) => post.id !== postId);
  portfolios.push(editedPost);

  res.status(201);
  res.json(portfolios);
});

// Run the server and report out to the logs
app.listen(2208, () => {
  console.log("Server started on port 2208");
});
