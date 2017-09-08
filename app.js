// DO/FIX:
// - link to filter by language on indidual snippet pages is not working

const fs = require('fs');
const express = require('express');
const mustacheExpress = require('mustache-express');
const path = require('path');
const session = require('express-session');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const flash = require('express-flash-messages');

const app = express();

// const User = require("./models/users");
const userModel = require("./models/users");
const User = userModel.User;
const snipModel = require("./models/snippets");
const Snip = snipModel.Snip;
const port = 3000;

const mongoURL = ('mongodb://localhost:27017/codekeeper');
mongoose.connect(mongoURL, {useMongoClient: true});
// var collection = db.collection('users');

app.engine('mustache', mustacheExpress());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'mustache');

app.use(bodyParser.urlencoded({extended: true}));
// app.use('/files', express.static(path.join(__dirname, 'public')))
app.use(express.static('./public'));
// what does this do, particularly path.join __dirname?

passport.use(new LocalStrategy(
    function(username, password, done) {
        User.authenticate(username, password, function(err, user) {
            if (err) {
                return done(err)
            }
            if (user) {
                return done(null, user)
            } else {
                return done(null, false, {
                    message: "There is no user with that username and password."
                })
            }
        })
    }));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(function (req, res, next) {
  res.locals.user = req.user;
  next();
});

app.get('/profile/:snippet', function(req, res){
  let snippet = req.params.snippet.toString();
  Snip.find({_id: snippet}).then(function (snip) {
    res.render('snippet', {snip: snip})
})
})

app.get('/all/filter/:language', function (req, res) {
    let language = req.params.language;
    Snip.find({public: "true", language: language}).then(function (snip) {
      res.render("index", {snip: snip, language:language})
  })
})

app.get('/profile/filter/:language', function (req, res) {
    let language = req.params.language;
    Snip.find({username: res.locals.user.username, language: language}).then(function (snip) {
      res.render("profile", {snip: snip, language:language, username: res.locals.user.username})
  })
})

app.get('/add', function(req, res){
  res.render('add-snippet');
});

app.post('/add', function(req, res){
  Snip.create({
    username: res.locals.user.username,
    title: req.body.title,
    language: req.body.language,
    snippet: req.body.snippet,
    notes: req.body.notes,
    tags: req.body.tags.replace(/\s/g, '').split(","),
    public: req.body.public
  })
  .then(function (snip) {
    res.redirect('/profile');
  })
});

app.post('/profile/search', function(req, res){
  let tag = req.body.tag;
  Snip.find({ tags: { $in: [tag] }}).then(function (snip){
    res.render("profile", {snip: snip, tag: tag});
    // console.log(tag);
  })
})

app.post('/all/search', function(req, res){
  let tag = req.body.tag;
  Snip.find({ public: "true", tags: { $in: [tag] }}).then(function (snip){
    res.render("index", {snip: snip, tag: tag});
    // console.log(tag);
  })
})

app.get('/profile', function(req, res){
    // let javascript = Snip.find({username: res.locals.user.username, language: "Javascript"});
    Snip.find({username: res.locals.user.username}).then(function (snip) {
    res.render('profile', {snip: snip, username:res.locals.user.username});
  })
})

app.get('/register', function(req, res){
    Snip.find().sort( { created: -1 } ).limit(5).then(function (snip) {
      res.render('register', {snip:snip});
    })
  });

app.post('/register', function (req, res) {
  // console.log(req.body);
  User.create(req.body)
  .then(function (user) {
  res.redirect('/login');
    })
  });

  app.get('/login', function(req, res) {
      res.render("login", {
          messages: res.locals.getMessages()
      });
  });

  app.post('/login', passport.authenticate('local', {
      successRedirect: '/profile',
      failureRedirect: '/login',
      failureFlash: true
  }));

  app.get('/', function(req, res) {
    Snip.find({public: "true"}).then(function (snip) {
      res.render('index', {snip: snip});
    })
  })

module.exports = app;

app.listen(port, function () {
  console.log('Successfully started code keeper...')
});
