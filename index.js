const uuidv4 = require("uuid").v4;
const jwt = require("jsonwebtoken");
const express = require("express");
const config = require("config");
const multer = require("multer");
const cors = require("cors");
const path = require('path');
const fs = require("fs");
const app = express();
const port = 9000;

// Define storage for multer
const storage = multer.diskStorage({
  destination: "uploads/",

  filename: function (req, file, cb) {
    cb(null, uuidv4() + "-" + file.originalname);
  },
});

// File upload middleware
const upload = multer({ storage });

app.use(express.json());

app.use(cors());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");

  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");

  res.header(
    "Access-Control-Allow-Headers",

    "Origin, X-Requested-With, Content-Type, Accept"
  );

  next();
});

// Secret Key for jwt
const secretkey = config.get("SECRET_KEY");

// Portfolios
let portfolios = JSON.parse(JSON.stringify(config.get("PORTFOLIOS")));

// users
const users = JSON.parse(JSON.stringify(config.get("USERS")));

// Access Token generator
function generateAccessToken(user) {
  const payload = { ...user };

  const options = { expiresIn: "1h" };

  return jwt.sign(payload, secretkey, options);
}

// Update DB json
function updateDB(dbname, newdata, isupdate = "POST", currentid = 0) {
  fs.readFile("config/default.json", "utf8", (err, jsondata) => {
    if (err) {
      console.log(err);

      return;
    }

    try {
      const data = JSON.parse(jsondata);

      if (isupdate === "PUT") {
        data[dbname] = data[dbname].map((item) =>
          item.id === currentid ? newdata : item
        );
      } else if (isupdate === "DELETE") {
        data[dbname] = data[dbname].filter((item) => item.id !== currentid);
      } else {
        data[dbname].push(newdata);
      }

      fs.writeFile(
        "config/default.json",

        JSON.stringify(data),

        "utf8",

        (error) => {
          if (error) {
            console.log("Error in rewriting default.json file: ", error);
          } else {
            console.log("Default.json file successfully rewritten!");
          }
        }
      );
    } catch (error) {
      console.log("Error in updating default.json file: ", error);
    }
  });
}

// Generating image from url
function getImage(filename, callback) {
  const filePath = path.join(__dirname, 'uploads', filename);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.error(err);
      callback(null); // Error handling
      return;
    }

    const ext = path.extname(filename).slice(1);
    const mimeType = `image/${ext}`;

    const base64Data = data.toString('base64');
    const base64Image = `data:${mimeType};base64,${base64Data}`;

    callback(base64Image);
  });
}

// Register
app.post("/auth/register", (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    res.status(400);

    return res.json({ message: '"name" and "password" are required!' });
  }

  if (typeof name !== "string" || typeof password !== "string") {
    res.status(400);

    return res.json({
      message: "The type of name and password must be String!",
    });
  }

  if (users.find((user) => user.name === name)) {
    res.status(400);

    return res.json({ message: "This username is already registered." });
  }

  if (
    name.length < 4 ||
    name.length > 16 ||
    password.length < 4 ||
    password.length > 12
  ) {
    res.status(401);

    return res.json({
      message:
        "Invalid requirement. 'name' must be between 4 and 16 characters. The 'password' must be between 4 and 12 characters long.",
    });
  }

  const user = {
    name,

    password,

    _id: String(new Date().getTime()),

    access_token: null,
  };

  const access_token = generateAccessToken(user);

  user.access_token = access_token;

  users.push(user);

  updateDB("USERS", user);

  res.status(201);

  res.json({
    message: "You have successfully registered.",

    user: { _id: user._id, name: user.name },

    access_token: user.access_token,
  });
});

// Login
app.post("/auth/login", (req, res) => {
  const { name, password } = req.body;

  const user = users.find(
    (user) => user.name === name && user.password === password
  );

  if (user) {
    res.status(200);

    res.json({
      message: "Success",

      user: { _id: user._id, name: user.name },

      access_token: user.access_token,
    });
  } else {
    res.status(401);

    res.json({ message: "Invalid login or password." });
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

    return res.json({
      message: "Unauthorized. Token not found in the database.",
    });
  }

  res.status(200);

  return res.json({ user: { _id: currentUser._id, name: currentUser.name } });
});

// GET Portfolios
app.get("/portfolios", (req, res) => {
  const newPortfolios = [];

  portfolios.forEach((item) => {
    // Generating URL for all images in the array
    getImage(item.img.filename, (base64Image) => {
      newPortfolios.push({ ...item, img: base64Image });

      if (newPortfolios.length === portfolios.length) {
        res.status(200).json(newPortfolios);
      }
    });
  });
});

// POST Portfolios
app.post("/portfolio", upload.single("file"), (req, res) => {
  const file = req.file;

  const { title, project_link, github_link } = req.body;

  const token = req.headers.authorization;

  const isValidToken = users.find((user) => user.access_token === token);

  if (!token) {
    res.status(400);

    return res.json({ message: "Token not found in request headers." });
  }

  if (!isValidToken) {
    res.status(401);

    return res.json({
      message: "Unauthorized. Token not found in the database.",
    });
  }

  if ((!title || !file, !project_link)) {
    res.status(400);

    return res.json({
      message: '"title", "file", and "project_link" are required!',
    });
  }

  // Genereting URL for image
  fs.readFile(file.path, (err, data) => {
    const imageURL =
      "data:image/" +
      file.mimetype.split("/")[1] +
      ";base64," +
      data.toString("base64");

    const portfolio = {
      title,

      img: file,

      project_link,

      github_link: github_link || null,

      id: uuidv4(),
    };

    updateDB("PORTFOLIOS", portfolio);

    portfolios.push(portfolio);

    res.status(201);

    res.json({
      message: "Post successfully added!",
      data: { ...portfolio, img: imageURL },
    });
  });
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

    return res.json({
      message: "Unauthorized. Token not found in the database.",
    });
  }

  if (!id) {
    res.status(404);

    return res.json({ message: 'Invalid "id"!' });
  }

  const existingPortfolio = portfolios.find((post) => post.id === id);

  if (!existingPortfolio) {
    res.status(403);

    return res.json({ message: `Post not found!` });
  }

  if (!title || !img || !project_link) {
    res.status(400);

    return res.json({
      message: '"title", "img", and "project_link" are required!',
    });
  }

  const portfolio = {
    title,

    img,

    project_link,

    github_link: github_link || null,

    id,
  };

  portfolios = portfolios.map((post) => (post.id === id ? portfolio : post));

  updateDB("PORTFOLIOS", portfolio, "PUT", id);

  res.status(200);

  res.json({ message: "Post successfully edited!", data: portfolio });
});

// Get one current id post
app.get("/portfolios/:id", (req, res) => {
  const id = req.params.id;

  const existingPortfolio = portfolios.find((post) => post.id === id);

  if (!existingPortfolio) {
    res.status(403);

    return res.json({ message: "Post not found!" });
  }

  // Generating URL for all images in the array
  getImage(existingPortfolio.img.filename, (base64Image) => {
    const newPortfolio = { ...existingPortfolio, img: base64Image }

    res.status(200).json({ data: newPortfolio });
  });
});

// DELETE Portfolio
app.delete("/portfolio/:id", (req, res) => {
  const id = req.params.id;

  const token = req.headers.authorization;

  const isValidToken = users.find((user) => user.access_token === token);

  if (!token) {
    res.status(400);

    return res.json({ message: "Token not found in request headers." });
  }

  if (!isValidToken) {
    res.status(401);

    return res.json({
      message: "Unauthorized. Token not found in the database.",
    });
  }

  if (!id) {
    res.status(404);

    return res.json({ message: 'Invalid "id"!' });
  }

  const existingPortfolio = portfolios.find((post) => post.id === id);

  if (!existingPortfolio) {
    res.status(403);

    return res.json({ message: "Post not found!" });
  }

  portfolios = portfolios.filter((post) => post.id !== id);

  updateDB("PORTFOLIOS", portfolios, "DELETE", id);

  res.status(204).json({ message: "Post successfully deleted!" });
});

// Run the server and log the message
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});