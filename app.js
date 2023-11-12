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

app.get("/public/style1.css", (req, res) => {
  res.sendFile(__dirname + "/public/style1.css");
});
app.get("/public/style2.css", (req, res) => {
  res.sendFile(__dirname + "/public/style2.css");
});
app.get("/public/style3.css", (req, res) => {
  res.sendFile(__dirname + "/public/style3.css");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
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

app.post("/register", (req, res) => {
  const Cuser = req.body.username;
  const Cpassword = req.body.password;
  const CRepassword = req.body.repassword;

  if (Cpassword !== CRepassword) {
    return res.render("register", { err: "passwords dont match" });
  }

  const exists = users.find((i) => i.username === Cuser);
  if (exists) {
    return res.render("register", { err: "Username already exists" });
  }

  const newUser = {
    username: Cuser,
    password: Cpassword,
  };
  users.push(newUser);
  fs.writeFileSync("./db/users.json", JSON.stringify(users, null, 2), "utf8");
  res.redirect("/login");
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.render("welcome");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
