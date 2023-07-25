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

// Access Token generator
function generateAccessToken(user) {
  const payload = { ...user }

  const options = { expiresIn: '1h' }

  return jwt.sign(payload, secretkey, options)
}

// Update DB json
function updateDB(dbname, newdata, isupdate = "POST", currentid = 0) {
  fs.readFile('config/default.json', 'utf8', (err, jsondata) => {
    if (err) {
      console.log(err)
      return
    }

    try {
      const data = JSON.parse(JSON.stringify(JSON.parse(jsondata)))

      if (isupdate === "PUT") {
        const newdatas = data?.[dbname].filter((item) => item.id !== currentid);
        data[dbname] = [...newdatas, newdata]

      } else if (isupdate === "DELETE") {
        data[dbname] = newdata

      } else {
        data?.[dbname].push(newdata)
      }

      fs.writeFile('config/default.json', JSON.stringify(data), 'utf8', (error) => {
        if (error) {
          console.log("Error in rewriting default.json file: ", error);
        } else {
          console.log("Default.json file successfully rewrited!");
        }
      })

    } catch (error) {
      console.log("Error in updating default.json file: ", error);
    }
  })
}

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