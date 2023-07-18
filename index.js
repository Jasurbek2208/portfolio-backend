const express = require("express");
const cors = require("cors");
const v4 = require("uuid");
const app = express();

app.use(cors());
app.use(express.json());

// Portfolios
let portfolios = [];

// users
let users = [];


// Run the server and report out to the logs
app.listen(2208, () => {
  console.log("Server started on port 2208");
});
