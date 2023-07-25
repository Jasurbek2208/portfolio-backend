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

// Register
app.post("/auth/register", (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    res.status(300);
    return res.json({ message: '"name" and "password" is required!' });
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
      access_token: null
    }

    const access_token = generateAccessToken(user)
    user.access_token = access_token

    users.push(user)
    updateDB('USERS', user)

    res.status(201)
    res.json({
      message: "You have successfully registered.",
      user: { _id: user._id, name: user.name },
      access_token: user.access_token,
    });

  } else {
    res.status(401)
    return res.json({
      message:
        "Invalid requirement. 'name' must be at least 4 and at most 16 characters. The 'password' must be at least 4 and at most 12 characters long.",
    })
  }
});

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

// UserME
app.get("/auth/userme", (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    res.status(400);
    return res.json({ message: "Token not found in request headers." });
  }

  const currentUser = users.find((user) => user.access_token === token);
  if (!currentUser) {
    res.status(401);
    return res.json({ message: "Unauthorized. Token not found in database." });
  }

  res.status(200);
  return res.json({ user: { _id: currentUser._id, name: currentUser.name } });
});

// GET Portfolios
app.get("/portfolios", (req, res) => {
  res.status(200);
  res.json(portfolios);
});

// POST Portfolios
app.post("/portfolio", (req, res) => {
  const { title, img, project_link, github_link } = req.body;
  const token = req.headers.authorization;
  const isValidToken = users.find((user) => user.access_token === token);

  if (!token) {
    res.status(400);
    return res.json({ message: "Token not found in request headers." });

  }
  if (!isValidToken) {
    res.status(401);
    return res.json({ message: "Unauthorized. Token not found in database." });
  }
  if (!title) {
    res.status(400);
    return res.json({ message: '"title" is a required!' });
  }
  if (!img) {
    res.status(400);
    return res.json({ message: '"img" is a required!' });
  }
  if (!project_link) {
    res.status(400);
    return res.json({ message: '"project_link" is a required!' });
  }

  const portfolio = { title, img, project_link, github_link: github_link || null, id: uuidv4() }

  updateDB('PORTFOLIOS', portfolio)
  portfolios.push(portfolio);

  res.status(201);
  res.json({ message: "Post successfully added!", data: portfolio });
});

// PUT Current Portfolio
app.put("/portfolio/:id", (req, res) => {
  const id = req.params.id;
  const { title, img, project_link, github_link } = req.body;

  const token = req.headers.authorization;
  const isValidToken = users.find((user) => user.access_token === token);

  if (!token) {
    res.status(400);
    return res.json({ message: "Token not found in request headers." });
  }
  if (!isValidToken) {
    res.status(401);
    return res.json({ message: "Unauthorized. Token not found in database." });
  }

  if (!id) {
    res.status(404);
    return res.json({ message: 'Invaild "id"!' });
  }
  
  if (!portfolios.find((post) => post.id === id)) {
    res.status(403);
    return res.json({ message: `Post not found!` });
  }

  if (!title) {
    res.status(400);
    return res.json({ message: '"title" is a required!' });
  }
  if (!img) {
    res.status(400);
    return res.json({ message: '"img" is a required!' });
  }
  if (!project_link) {
    res.status(400);
    return res.json({ message: '"project_link" is a required!' });
  }

  const portfolio = { title, img, project_link, github_link, id }

  portfolios = portfolios.filter((post) => post.id !== id);

  updateDB('PORTFOLIOS', portfolio, "PUT", id)
  portfolios.push(portfolio);

  res.status(200);
  res.json({ message: "Post successfully edited!", data: portfolio });
});

app.delete('/portfolio/:id', (req, res) => {
  const id = req.params.id
  
  const token = req.headers.authorization;
  const isValidToken = users.find((user) => user.access_token === token);

  if (!token) {
    res.status(400);
    return res.json({ message: "Token not found in request headers." });

  }
  if (!isValidToken) {
    res.status(401);
    return res.json({ message: "Unauthorized. Token not found in database." });
  }
  
  if (!id) {
    res.status(404);
    return res.json({ message: 'Invaild "id"!' })
  }
  
  if (!portfolios.find((post) => post.id === id)) {
    res.status(403);
    return res.json({ message: 'Post not found!' })
  }

  portfolios = portfolios.filter((post) => post.id !== id)
  updateDB('PORTFOLIOS', portfolios, "DELETE", id)
  
  res.json({ message: 'Post successful deleted!' })
  res.status(204)
})

// Run the server and report out to the logs
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});