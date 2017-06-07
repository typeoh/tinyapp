//express_server passes URL data to urls_index.ejs
"use strict";
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");

//Configuration
app.set("view engine", "ejs")

//Middlewares
app.use(bodyParser.urlencoded({extended: true}));

function generateRandomString(length, chars) {
let result = '';
    for (var i = 0; i < 6; i++) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}
//create a function that will delete the data of object urlDatabase


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
// routes




app.get("/urls/new", (req, res) => {
  res.render("urls_new");
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  var rString = generateRandomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
  urlDatabase[rString] = req.body.longURL;
  var newString = res.send("Your new tiny string is " + "http://localhost:8080/u/" + rString);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
});
//post to delete dinorsaurs

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});


// app.post('/dinosaurs', (req, res) => {
//   const dinoId = nextDinoId;
//   nextDinoId += 1;
//   dinosDB[dinoId] = {
//     id: dinoId,
//     species: req.body.species,
//     timeRange: req.body.timeRange
//   };
// app.post('/dinosaurs/:id', (req, res) => {
//   const dinosaur = dinosDB[req.params.id];
//   dinosaur.species = req.body.species;
//   dinosaur.timeRange = req.body.timeRange;
//   res.redirect('/dinosaurs/' + dinosaur.id);
// });
app.get("/", (req, res) => {
  res.redirect("/urls");
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
  console.log(templateVars);
  res.render("urls_show", templateVars);
});
app.post("/urls/:id", (req, res) => {
//this adds new URL to urlDatabase object
  urlDatabase[req.params.id] = req.body.longURL

  res.redirect("/urls/" + req.params.id);
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});