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
const secretkey = config.get('SECRET_KEY')

// Portfolios
let portfolios = JSON.parse(JSON.stringify(config.get('PORTFOLIOS')));

// users
const users = JSON.parse(JSON.stringify(config.get('USERS')));

// Access Token generator
function generateAccessToken(user) {
  const payload = { ...user }

  const options = { expiresIn: '1h' }

  return jwt.sign(payload, secretkey, options)
}


// Run the server and report out to the logs
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});