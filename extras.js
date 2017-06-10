// function randomString(length, chars) {
// var result = '';
//     for (var i = 0; i < 6; i++) result += chars[Math.floor(Math.random() * chars.length)];
//     return result;
// }
// var rString = randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
// console.log(rString);

// const usersDatabase = {
//   "RandomId1": {
//     id: "groot little",
//     email: "groot@groot.little.com",
//     password: "iamgroot"
//   },
//  "RandomId2": {
//     id: "rocket raccoon",
//     email: "rocket@rocket.raccoon.com",
//     password: "ferocious"
//   }
// }
// const id = usersDatabase.id;

// const email = "groot@groot.little.com"
// const password = "iamgroot"
// const req =

// function searchUsers(usersDatabase, key) {
//     for (var id in usersDatabase) {
//         if (id.body == req) {
//             console.log();
//         };
//     }
//     return "Not found";
// }
// console.log(searchUsers(usersDatabase));
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

var shortUrl = "123456"
//   let longUrl = urlDatabase[shortUrl].longURL
   Object.keys(urlDatabase).forEach((key) => {
      if(key === shortUrl) {
      console.log(key.longURL);
  }
   })
     console.log(urlDatabase[shortUr[longURL]])
