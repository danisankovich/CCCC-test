var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require("passport");
var session = require("express-session");
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var routes = require('./routes/index');
// var users = require('./routes/users');
var auth = require("./routes/auth");

var app = express();

passport.use(new GoogleStrategy({
  clientID: '337996401264-2hi1id5vbf86j8b01dfs4dukc80a15u4.apps.googleusercontent.com',
  clientSecret: 'mO4DJXYXPjm_ZnNViGf-gClo',
  callbackURL: 'http://localhost:3000/auth/google/callback'
  },
  // callbackURL: 'https://CCCC.herokuapp.com/auth/google/callback'},
  function(req, accessToken, refreshToken, profile, done) {
    done(null, profile);
  }
));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({secret:"codinghouse", resave: true, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done){
  done(null, user)
});

passport.deserializeUser(function(user, done){
  done(null, user)
});
app.use('/', routes);
// app.use('/users', users);
app.use("/auth", auth);


app.get('/logout', logout);
function logout(req, res){
  if (req.isAuthenticated()){
    req.logout();
  }
    res.redirect('/');
}


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
