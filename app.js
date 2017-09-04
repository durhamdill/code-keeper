const fs = require('fs');
const express = require('express');
const mustacheExpress = require('mustache-express');
const path = require('path');
const session = require('express-session');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const bodyParser = require('body-parser');

const app = express();

const User = require("./models/users");
// const User = models.User;
const port = 3000;

const mongoURL = ('mongodb://localhost:27017/codekeeper');
mongoose.connect(mongoURL, {useMongoClient: true});
// var collection = db.collection('users');

app.engine('mustache', mustacheExpress());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'mustache');

app.use(bodyParser.urlencoded({extended: true}));
app.use('/files', express.static(path.join(__dirname, 'public')))
// what does this do, particularly path.join __dirname?

app.get('/register', function(req, res){
    res.render('register');
  });

app.post('/register', function (req, res) {
  console.log(req.body);
  User.create(req.body)
  .then(function (user) {
  res.send('User now registered');
    })
  });


module.exports = app;

app.listen(port, function () {
  console.log('Successfully started code keeper...')
});
