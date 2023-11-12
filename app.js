const express = require("express");
const session = require("express-session");
const fs = require("fs");
const app = express();
const bodyParser = require("body-parser");

function generateUniqueArticleId() {
  const existingIds = articles.map((i) => i.id);
  const largestId = existingIds.length > 0 ? Math.max(...existingIds) : 0;
  const newId = largestId + 1;
  return newId;
}

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
const articles = JSON.parse(fs.readFileSync("./db/articles.json", "utf8"));

app.get("/", (req, res) => {
  res.render("welcome", { articles, users, username: req.session.username });
});

app.get("/public/:cssFile", (req, res) => {
  const cssFile = req.params.cssFile;
  const filePath = `${__dirname}/public/${cssFile}`;

  res.sendFile(filePath);
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
    res.render("welcome", { articles, users, username: req.session.username });
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
  res.render("welcome", { articles, users });
});

app.get("/edit/:id", (req, res) => {
  const articleId = parseInt(req.params.id);
  const article = articles.find((i) => i.id === articleId);

  if (article && article.username === req.session.username) {
    res.render("edit", { article });
  }
});

app.post("/update/:id", (req, res) => {
  const articleId = parseInt(req.params.id);
  const article = articles.find((i) => i.id === articleId);

  if (article && article.username === req.session.username) {
    article.data = req.body.data;

    fs.writeFileSync(
      "./db/articles.json",
      JSON.stringify(articles, null, 2),
      "utf8"
    );
  }

  res.redirect("/");
});

app.post("/delete/:id", (req, res) => {
  const articleId = parseInt(req.params.id);
  const articleIndex = articles.findIndex((i) => i.id === articleId);

  if (
    articleIndex !== -1 &&
    articles[articleIndex].username === req.session.username
  ) {
    articles.splice(articleIndex, 1);
    fs.writeFileSync(
      "./db/articles.json",
      JSON.stringify(articles, null, 2),
      "utf8"
    );
  }

  res.redirect("/");
});

app.get("/addArticle", (req, res) => {
  res.render("addArticle", { username: req.session.username });
});

app.post("/addArticle", (req, res) => {
  if (!req.session.username) {
    return res.redirect("/login");
  }

  const articleData = req.body.data;
  if (!articleData) {
    return res.render("addArticle", { error: "Please provide article data" });
  }

  const newArticle = {
    id: generateUniqueArticleId(),
    data: articleData,
    username: req.session.username,
  };

  articles.push(newArticle);
  fs.writeFileSync(
    "./db/articles.json",
    JSON.stringify(articles, null, 2),
    "utf8"
  );

  res.redirect("/");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
