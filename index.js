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
const secretkey = "kbticr7kmbrvjpm8ditjn4fhryt8pncqj8nvjyn5uox06cs3vf70l1f9ymhi4cvtr0ar28ea4jq2a264bth30dxef0ut2ve99y2dgfr1peos882ezz0t7an"

// Portfolios
let portfolios = JSON.parse(JSON.stringify(config.get('PORTFOLIOS')));

// users
const users = JSON.parse(JSON.stringify(config.get('USERS')));

// Run the server and report out to the logs
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});