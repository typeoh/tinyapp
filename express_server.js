//TODO create function that renders long Urls into short Urls
//
//Requirements
"use strict";
const express = require("express");
const app = express();
app.set("view engine", "ejs");
const PORT = process.env.PORT || 8080; // default port 8080
const cookieSession = require('cookie-session');

//Bcrypt
const bcrypt = require('bcrypt');

//Body Parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//Cookie Parser
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(cookieSession({
  name: "session",
  keys: ["thetiniestofsecrets"],
}));

//(Middleware)
//Locals
app.use((req, res, next) => {
  res.locals.user = usersDatabase[req.session.user_id]; //this is the key of the cookie
  //res.locals.user.id is returning undefined when registering because the cookie doesn't seem to be set? 
  next();
});

//(redirects to login if userid doesn't match cookie)
app.use('/urls', (req, res, next) => {
  if(!res.locals.user) {
    res.redirect("/login");
  } else {
    next();
  }
});
//Function that generates a random 6 character string
function generateRandomString() {
let result = '';
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const length = chars.length;
    for (var i = 0; i < 6; i++) result += chars[Math.floor(Math.random() * length)];
    return result;
}
// Database of URLS with two defaults
const urlDatabase = {
  "123456": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "RandomId1",
  }, 
  "654321": {
    longURL: "http://www.google.com", 
    userID: "RandomId2",
  }
};
//Database of users with two defaults 
const usersDatabase = {
  "RandomId1": {
    id: "RandomId1",
    email: "groot@groot.little.com",
    password: bcrypt.hashSync("iamgroot", 10)
  },
 "RandomId2": {
    id: "RandomId2",
    email: "rocket@rocket.raccoon.com",
    password: bcrypt.hashSync("ferocious", 10)
  }
};
//Function that searches through usersDatabase by email and retrieves
//User information for login email finds a match 
function findUserByEmail(email){
   return Object.keys(usersDatabase).map((key) => usersDatabase[key]).find((user) => user.email === email)
};

// Routes
//Get
//Home redirect to /urls
app.get("/", (req, res) => {
  if (res.locals.user) {
    res.redirect("/urls")
  }
  else {
  res.redirect("/login")
  }
});
//renders urlDatabase into JSON object
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
//render index if user is logged in and show only the urls belonging to user
app.get("/urls", (req, res) => {
  function urlsForUser(user) {
    const tailoredObject = {};
    Object.keys(urlDatabase).forEach((key) => {
      if(urlDatabase[key].userID === user.id) {
        tailoredObject[key] = urlDatabase[key];
      }
    });
    return tailoredObject;
  }
  if(res.locals.user !== undefined){
      let templateVars = 
       {
      urls: urlsForUser(res.locals.user)
      };
    
      res.render("urls_index", templateVars);
  }
  else {
    res.status(403).send("Please login.");
  }
  
});
//when shortURL link is clicked it redirects to longURL website
app.get("/u/:shortURL", (req, res) => {
  let shortUrl = req.params.shortURL;
  let longUrl = urlDatabase[shortUrl].longURL;
  res.redirect(longUrl);
});


//creates new URL and adds userid cookie to userid 
app.post("/urls", (req, res) => {
  const rString = generateRandomString();
  urlDatabase[rString] = {
    longURL: req.body.longURL, 
    userID: res.locals.user.id,
  };
  res.redirect("/urls/" + rString);
});
//urls new -> renders form for new url 
app.get("/urls/new", (req, res) => {
  if (res.locals.user) {
    res.render("urls_new");
    res.redirect("/urls");
  }
  else {
  res.redirect("/login")
  }
});
//routes referring to individual links

//route that shows users their new short url 
app.get('/urls/:id', (req, res) => {
  const templateVars = {
  shortURL: req.session.user_id,
  longURL: valueOf.longURL,
  oldURL: req.params.id,
  } 
  var urlObject = urlDatabase[req.params.id];

  if (res.locals.user) {
    return res.render("urls_show", templateVars);
  } else {
    return res.redirect("/login");
  }
});
app.post("/urls/:id", (req, res) => {
//this edits an existing URL
  const urlObject = urlDatabase[req.params.id];
  console.log("I am the url Object", urlDatabase[req.params.id]);
  if (urlObject.userID !== res.locals.user.id) {
      return res.status(403).send("Bad bad. That URL doesn't belong to you");
  } else {
  urlDatabase[req.params.id] = req.body.longURL
  console.log(urlDatabase[req.params.id]);
  res.redirect("/urls/" + req.params.id);
  }
});
//post that deletes a URL off databases
app.post("/urls/:id/delete", (req, res) => {
  const urlObject = urlDatabase[req.params.id];
  if (urlObject.userID !== res.locals.user.id) {
    return res.status(403).send("Bad bad. That URL doesn't belong to you");
  } else {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
  }
});
//login route that retains username cookie
app.get("/login", (req, res) => {
  res.render("urls_login");
});
//function that returns the name of the keys in usersDatabase then uses the names of those keys to search through each 
//object and return the value of the user.email
app.post("/login", (req, res) => {
  let email = req.body.email;
  let user = findUserByEmail(email);
  if(!user) {
    res.status(403).send("Please Register");
  } else if (!bcrypt.compareSync(req.body.password, user.password)) {
    console.log("pw didn't match");
    res.status(403).send("Please Register");
  } else {
    req.session.user_id = user.id;
    console.log("you done got logged in", req.session.user_id);
    console.log("i am ", user.id);
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
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
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send(`400 Error: bad bad not god -
    please enter email and password`)
    return;
  }
  
  const id = generateRandomString();
  const hashPass = bcrypt.hashSync(password, 10);
  req.session.user_id = res.locals.id; 
  usersDatabase[res.locals.id] = {
    id,
    email,
    hashPass
  }
  console.log(usersDatabase[res.locals.id]);
  //having difficulty setting the cookie with the new cookie sessions 
  
  res.redirect("/urls")
});
//end registration page

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// app.get("/urls/:id", (req, res) => {
//   templateVars.shortURL = req.params.id;
//   templateVars.longURL = urlDatabase[req.params.id].link;
//   res.render("urls_show", templateVars);
// });