//express_server passes URL data to urls_index.ejs
"use strict";
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");

function generateRandomString(length, chars) {
let result = '';
    for (var i = 0; i < 6; i++) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.set("view engine", "ejs")

app.use(bodyParser.urlencoded({extended: true}));

app.get("/urls/new", (req, res) => {

  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  var rString = generateRandomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
  urlDatabase[rString] = req.body.longURL;
  var newString = res.send("Your new tiny string is " + "http://localhost:8080/u/" + rString);
});

app.get("/u/:shortURL", (req, res) => {
  var shortURL = req.params.shortURL;
  var longURL = urlDatabase[shortURL];

  res.redirect(longURL);

});
app.get("/", (req, res) => {
  res.end("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
app.get("/urls/:id", (req, res) => {
  let valueOf = urlDatabase[req.params.id];
  let templateVars = {shortURL: req.params.id, longURL: valueOf};
  res.render("urls_show", templateVars);
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});