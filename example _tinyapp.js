// Essential requirements
var express = require("express");
var app = express();
app.set("view engine", "ejs");
var PORT = process.env.PORT || 8080;
var cookieSession = require('cookie-session');

// For encrypting passwords:
const bcrypt = require('bcrypt');


// Bodyparser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
  extended: false
}));

// Express middleware that parses cookies
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));


// Function to be used by endpoints to generate user Ids
function generateRandomString() {
    let checkString = "0123456789abcdefghijklmnopqrstuvwxyz";
    let returnString = [];
    for (let i = 0; i < 6; i++) {
      let index = Math.floor(Math.random() * 36);
      returnString = `${returnString}${checkString[index]}`;
    }
    return returnString;
};

// Database of URLs, initialized with two defaults
var urlDatabase = {
  "b2xVn2": {link: "http://www.lighthouselabs.ca", userId: "admin"},
  "9sm5xK": {link: "http://www.google.com", userId: "admin"}
};

// Database of users:
var users = { // object format below:
 // "guest": {id: "guest", email: "", password: ""}
};

// The object usually used to deliver info to the front end:
var templateVars = {
      urls: urlDatabase,
      userId: "",
      email: "",
      password: "",
      shortURL: "",
      longURL: ""
    };


// ----- //


/* GET functions */

// Page that displays all shortened URLs currently on the server:
app.get("/", (req, res) => {
  if (req.session.userId){
    templateVars.userId = req.session.userId;
    templateVars.email = users[req.session.userId].email;
  } else {
    templateVars.userId = "";
    templateVars.email = "";
  }
  res.render("urls_index", templateVars);
});

// Page that displays all shortened URLs added / edited by the currently logged in user:
app.get("/urls/user", (req, res) => {
  templateVars.userId = req.session.userId;
  templateVars.email = users[req.session.userId].email;
  res.render("urls_user", templateVars);
});

// Page for a user to create a new URL:
app.get("/urls/new", (req, res) => {
  res.render("urls_new", templateVars);
});

// Page to view a specific URL's information:
app.get("/urls/:id", (req, res) => {
  templateVars.shortURL = req.params.id;
  templateVars.longURL = urlDatabase[req.params.id].link;
  res.render("urls_show", templateVars);
});


// Page for a logged in user to update a specific URL they own:
app.get("/urls/:id/edit", (req, res) => {
  if (urlDatabase[req.params.id].userId === req.session.userId) {
    templateVars.shortURL = req.params.id;
    templateVars.longURL = urlDatabase[req.params.id].link;
    res.render("urls_update", templateVars);
  }
});

// Loads user registration page:
app.get("/register", (req, res) => {
  res.render("registration");
});

// Loads "pure" login page:
app.get("/login", (req, res) => {
  res.render("login");
});


// ----- //


/* POST functions... and one helper function. */

// Creates a new shortURL
app.post("/urls/create", (req, res) => {
  let theUrl = req.body.longURL;
  if (!(theUrl.slice(0,6) == "http://" || theUrl.slice(0,7) == "https://")) {
    theUrl = `http://${theUrl}`;
  }
  urlDatabase[generateRandomString()] = {link: theUrl, userId: req.session.userId};
  res.redirect("/");
});

// Deletes a URL and refreshes the user's links page
app.post("/urls/:id/delete", (req, res) => {
  if (urlDatabase[req.params.id].userId === req.session.userId) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls/user");
  }
});

// Updates a user's ShortURL
app.post("/urls/:id/update", (req, res) => {
  let updatedUrl = req.body.longURL;
  if (!(updatedUrl.slice(0,7) == "http://" || updatedUrl.slice(0,8) == "https://")) {
    updatedUrl = `http://${updatedUrl}`;
  }
  if (urlDatabase[req.params.id].userId === req.session.userId) {
    urlDatabase[req.params.id].link = updatedUrl;
    res.redirect("/");
  }
});


// 400 error formatting helper function. Faaaairly DRY...
const sendFormattedError = function(message, retryToRegister, res) {
  let htmlMessageBit = `<html><body><p>${message}</p>`

  let retryToRegButtons = `<div><a href=\"/register\">Retry Registration</a></div>
                          <div><a href=\"/login\">Login</a></div></body></html>`;

  let retryToLogButtons = `<div><a href=\"/login\">Retry Logging In</a></div>
                          <div><a href=\"/register\">Register</a></div></body></html>`;

  if (retryToRegister) {
    res.status(400).send(`${htmlMessageBit} ${retryToRegButtons}`);
  } else {
    res.status(400).send(`${htmlMessageBit} ${retryToLogButtons}`);
  }
};

// Registers a new user
app.post("/register", (req, res) => {
  let newUserID = generateRandomString();

  if (!req.body.email || !req.body.password) {
    sendFormattedError("400! Fill in all the blanks please :)", true, res);
  }
  else {
    var alreadyRegistered;      // wanted to not use this but couldn't figure out how :(
    for (entry in users) {
      if (req.body.email === users[entry].email) {
        sendFormattedError("400! This email address is already registered.", true, res);
        alreadyRegistered = true;
      }
    }
    if (!alreadyRegistered) {   // wanted to not use this but couldn't figure out how :(
      const password = req.body.password;
      const hashed_password = bcrypt.hashSync(password, 10);
      users[newUserID] = {
        userId: newUserID,
        email: req.body.email,
        password: hashed_password
      };

      req.session.userId = newUserID;
      res.redirect('/');
    }
  }
});


// Logs a user in
app.post("/login", (req, res) => {
  if (req.body.register) {
    res.redirect('/register');
  } else {

    if (!req.body.email || !req.body.password) {
      sendFormattedError("400! Fill in all the blanks please :)", false, res);
    } else {

      var userId;
      for (entry in users) {
        if (req.body.email === users[entry].email) {
          userId = entry;
        }
      }
      if (!userId) {
        sendFormattedError("400! Email not found.", false, res);
      } else {

        var user = users[userId];
        if (!bcrypt.compareSync(req.body.password, user.password)) {
          sendFormattedError("Incorrect password, please try again.", false, res);
        } else {
          req.session.userId = user.userId;
          res.redirect('/');
        }
      }
    }
  }
});

// Logs a user out
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/');
});


// listening function, pings the port number.
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
