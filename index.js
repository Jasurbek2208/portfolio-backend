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


// Run the server and report out to the logs
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});