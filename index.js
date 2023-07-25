const uuidv4 = require("uuid").v4;
const jwt = require("jsonwebtoken");
const express = require("express");
const config = require("config");
const cors = require("cors");
const fs = require("fs");

const app = express();
const port = 9000;

app.use(express.json());
app.use(cors());

// Secret Key for jwt
// const secretkey = config.get('SECRET_KEY')

// Portfolios
let portfolios = []

// users
const users = []


// Login
app.post("/auth/login", (req, res) => {
  const { name, password } = req.body;

  if (users.find((user) => user.name === name && user.password === password)) {
    let currentUser = users.find((user) => (user.name === name ? user : null));

    res.status(200)
    res.json({
      message: "Success",
      user: { _id: currentUser._id, name: currentUser.name },
      access_token: currentUser.access_token,
    })
  } else {
    res.status(401)
    res.json({ message: "Invalid login or password." })
  }
});

// Run the server and report out to the logs
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});