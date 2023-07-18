const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());


// Run the server and report out to the logs
app.listen(2208, () => {
  console.log("Server started on port 2208");
});
