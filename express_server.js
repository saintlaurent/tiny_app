var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');




app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

//urlDatabase structure changed to include userId as a property of each url object
//so that logged in users can see only their own urls
var urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userId: ""},
  "9sm5xK": {longURL: "http://www.google.com", userId: ""}
};

function generateRandomString() {
   var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

function urlsForUser(userId) {

    let urlsBelongingToUser = [];

    for (let url in urlDatabase){

        if(urlDatabase[url].userId === userId) {
            urlsBelongingToUser[url] = urlDatabase[url];
        }
    }

    return urlsBelongingToUser;
}


app.get("/", (req, res) => {
  res.send("Hello!");

});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  // if(req.cookies["username"]) {
    let urlsBelongingToUser = urlsForUser(req.cookies["username"]);
    console.log("TEMPLATE VARS ", urlsBelongingToUser);
      let templateVars = {
          urls: urlsBelongingToUser,
          username: req.cookies["username"],
      };

      res.render("urls_index", templateVars);
  // }
  // else {
  //   res.send("Please login first!");
  // }

});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  }
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  let longURL = req.body.longURL;// debug statement to see POST parameters
  let shortURL = generateRandomString();
  // urlDatabase[shortURL] = longURL;\
    urlDatabase[shortURL] = {longURL: longURL, userId: req.cookies["username"]};
  console.log("URL DATABASE: ", urlDatabase);
  res.redirect(`http://localhost:8080/urls/${shortURL}`);         // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:id/delete", (req, res) => {
  console.log("Delete id:", req.params.id);
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
})

app.post("/urls/:id/update", (req, res) => {
  console.log(req.body);
  delete urlDatabase[req.params.id];
  let longURL = req.body.input;
  let shortURL = generateRandomString();
  // urlDatabase[shortURL] = longURL;
    urlDatabase[shortURL] = {longURL: longURL, userId: req.cookies["username"]};
  res.redirect(`http://localhost:8080/urls/${shortURL}`)
});

app.post("/login", (req, res) => {
let username = req.body.username;
    res.cookie("username", username);
    res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls")
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});