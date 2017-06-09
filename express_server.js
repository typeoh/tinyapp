//express_server passes URL data to urls_index.ejs
"use strict";
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "RandomId1",
  }, 
  "9sm5xK": {
    longURL: "http://www.google.com", 
    userID: "RandomId2",
  }
};
const usersDatabase = {
  "RandomId1": {
    id: "RandomId1",
    email: "groot@groot.little.com",
    password: "iamgroot"
  },
 "RandomId2": {
    id: "RandomId2",
    email: "rocket@rocket.raccoon.com",
    password: "ferocious"
  }
};
//Configuration
app.set("view engine", "ejs")
//Generates a random 6 character string
function generateRandomString() {
let result = '';
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const length = chars.length;
    for (var i = 0; i < 6; i++) result += chars[Math.floor(Math.random() * length)];
    return result;
}
function findUserByEmail(email){
   return Object.keys(usersDatabase).map((key) => usersDatabase[key]).find((user) => user.email === email)
};
//Middlewares
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use((req, res, next) => {
  res.locals.user = usersDatabase[req.cookies.userid]; //this is the key of the cookie
  next();
});

// Routes
//Home redirect to /urls
app.get("/", (req, res) => {
  if (res.locals.user) {
    res.redirect("/urls")
  }
  else {
  res.redirect("/login")
  }
});
//Hello world page
app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});
//renders urlDatabase into JSON object
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
//renders urls/new page
app.get("/urls/new", (req, res) => {
  if (res.locals.user) {
    res.render("urls_new");
    res.redirect("/urls");
  }
  else {
  res.redirect("/login")
  }
});
//generates a random string for your new short url
app.post("/urls", (req, res) => {
  const rString = generateRandomString();
  urlDatabase[rString] = req.body.longURL;
  var newString = res.send("Your new tiny string is " + "http://localhost:8080/u/" + rString);
});
//
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
});

//delete database urls
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  if (res.locals.user) {
    let templateVars = {
        urls: urlDatabase
      };
      res.render("urls_index", templateVars);
  }
  else {
  res.redirect("/login")
  }
  
});
app.get("/urls/:id", (req, res) => {
    let valueOf = urlDatabase[req.params.shortURL];
    let templateVars = {
      shortURL: req.params.id,
      longURL: valueOf.longURL
    } 
    if (!res.locals.user) {
    res.status(403).send("You are not logged in");
  } if (urlDatabase[shortURL].userID !== res.locals.user) {
  res.status(403).send("Swiper no swiping");
  } if (res.locals.user) {
  res.render("urls_show", templateVars);
  }
  else {
    res.redirect("/login");
  }
});
app.post("/urls/:id", (req, res) => {
//this adds new URL to urlDatabase object
  urlDatabase[req.params.id] = req.body.longURL
  res.redirect("/urls/" + req.params.id);
});
//login route that retains username cookie
app.get("/login", (req, res) => {
  res.render("urls_login");
});
//function that returns the name of the keys in usersDatabase then uses the names of those keys to search through each 
//object and return the value of the user.email
app.post("/login", (req, res) => {
let email = req.body.email;
let password = req.body.password;
let user = findUserByEmail(email);

if(!user) {
  res.status(403).send("Please Register");
  return;
}
if(user.password !== password) {
  res.status(403).send("Please Register");
  return;
} else {
  res.cookie("userid", user.id);
}
 res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("userid");
  res.redirect("/login");
});

//registration page
app.get("/register", (req, res) => {
  res.render("urls_register")
});

//post to registration page
//assigns a random six digit string
//returns an error message if no email or password is entered
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const { email, password } = req.body;
 

  usersDatabase[id] = {
    id,
    email,
    password
  }
if(email || password) {
  res.cookie("userid", id)
  res.redirect("/urls")

} else {
  res.status(400).send(`400 Error: bad bad not god -
  please enter email and password`)
  }
});
//end registration page

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});