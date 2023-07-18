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
    name = await req?.body?.name;
    password = await req?.body?.password;
  } catch (error) {
    console.log(error);
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

// Run the server and report out to the logs
app.listen(2208, () => {
  console.log("Server started on port 2208");
});
