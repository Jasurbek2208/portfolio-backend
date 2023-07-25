import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken"
import express from "express";
import config from "config"
import cors from "cors";
import fs from "fs";

const app = express();
const port = 9000;

app.use(express.json());
app.use(cors());

// Secret Key for jwt
const secretkey = config.get('SECRET_KEY')

// Portfolios
let portfolios = JSON.parse(JSON.stringify(config.get('PORTFOLIOS')));

// users
const users = JSON.parse(JSON.stringify(config.get('USERS')));


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