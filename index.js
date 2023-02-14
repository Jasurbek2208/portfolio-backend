const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// Portfolios
// const portfolios = JSON.parse(process.env.USERS_DB);

// users
// let users = JSON.parse(process.env.USERS_DB);

// Register
app.post("/auth/register", (req, res) => {
  const obj = req.body;
  const name = JSON.parse(obj.body).name;
  const password = JSON.parse(obj.body).password;

  if (typeof name !== "string" || typeof password !== "string") {
    res.status(300);
    res.json({ message: "The type of name and password must be String!" });
    
  } else if (users.find((user) => user.name === name)) {
    res.status(400);
    res.json({ message: "This username is already registered." });
    
  } else if (String(name).length > 4 &&
    String(name).length < 16 &&
    String(password).length > 4 &&
    String(password).length < 12
  ) {
    const user = {
      name: name,
      password: password,
      _id: String(new Date().getTime()),
      access_token:
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15),
    };

    users.push(user);
    process.env.USERS_DB = JSON.stringify(users);
    
    res.json({
      message: "You have successfully registered.",
      user: { _id: user._id, name: user.name },
      token: user.access_token,
    });
    
  } else {
    res.status(401);
    res.json({
      message: `invalid require. 'name' must be at least 4 and at most 16 characters. The 'password' must be at least 4 and at most 12 characters long.`,
    });
  }
});

// Login
app.post("/auth/login", (req, res) => {
  const obj = req.body;
  const name = JSON.parse(obj.body).name;
  const password = JSON.parse(obj.body).password;

  if (users.find((user) => user.name === name && user.password === password)) {
    let currentUser = users.find((user) => (user.name === name ? user : null));

    res.json({
      message: "success",
      user: { _id: currentUser._id, name: currentUser.name },
      token: currentUser.access_token,
    });
  } else {
    res.status(401);
    res.json({ message: "invalid login or password." });
  }
});

// UserME
app.get("/auth/userme", (req, res) => {
  const token = req.headers.authorization;
  
  if (!token) {
    res.status(400);
    return res.json({ message: "Token not found in request headers." });
  }

  const currentUser = users.find(user => user.access_token === token);
  if (!currentUser) {
    res.status(401);
    return res.json({ message: "Unauthorized. Token not found in database." });
  }

  res.status(200);
  return res.json({ user: { _id: currentUser._id, name: currentUser.name } });
});


// GET Portfolios
app.get("/portfolios", (req, res) => {
  res.json(JSON.parse(process.env.USERS_DB));
});

// POST Portfolios
app.post("/portfolios", (req, res) => {
  const newPortfolio = req.body;
  portfolios.push(newPortfolio);
  res.json(portfolios);
});

//

// Run the server and report out to the logs
app.listen(4004, () => {
  console.log("Server started on port 4004");
});
