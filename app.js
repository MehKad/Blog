const express = require("express");
const session = require("express-session");
const fs = require("fs");
const app = express();
const bodyParser = require("body-parser");

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(bodyParser.urlencoded({ extended: false }));

app.set("view engine", "pug");
app.set("views", "./views");

const users = JSON.parse(fs.readFileSync("./db/users.json", "utf8"));

app.get("/", (req, res) => {
  res.render("welcome");
});

app.get("/public/style.css", (req, res) => {
  res.sendFile(__dirname + "/public/style.css");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  const Cuser = req.body.username;
  const Cpassword = req.body.password;

  const user = users.find(
    (i) => i.username === Cuser && i.password === Cpassword
  );

  if (user) {
    req.session.username = Cuser;
    res.render("welcome", { username: req.session.username });
  } else {
    res.render("login", { err: "Invalid username or password" });
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.render("welcome");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
