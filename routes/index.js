var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var logout = require('express-passport-logout');

// mongoose.connect('mongodb://localhost/CCCC');
mongoose.connect(process.env.MONGOLAB_URI);


var userSchema = new mongoose.Schema({
  userName: String,
  email: {type : String},
  image: String,
  events: [{
    theater : String,
    address: String,
    city: String,
    st: String,
    zipCode: String,
    castName: {type: String, default : 'Show Information'},
    contactNumber: String,
    contactEmail: String,
    rating: String,
    day: String,
    // occurrence: String,
    time: String,
    price: String,
    otherinfo: String,
    imageUrl: {type: String, default : 'http://www.vgmpf.com/Wiki/images/thumb/c/c4/Rocky_Horror_Show_-_ZXS_-_UK.jpg/250px-Rocky_Horror_Show_-_ZXS_-_UK.jpg'},
    viewUrl: {type: String, default : 'images/sexy.jpg'},
    comments: [{}]
  }],
  favorite: [{}]
});

var User = mongoose.model('User', userSchema);

router.get('/', function (req, res, next) {
  if (req.user){
    User.findOne({email: req.user.emails[0].value }, function(error, user){
      if (error) {
        console.log('error');
      }
      if (!user) {
        var entry = new User({
          userName: req.user.displayName,
          email: req.user.emails[0].value,
          image: req.user.photos[0].value,
        });
        entry.save();
      }
      res.render('index');
    });
  }
  res.render('index');
});

router.get('/get_current_user', function (req, res){
  User.findOne({email: req.user.emails[0].value}, function(error, currentUser){
    if (error) {
      console.log(error);
    }
    console.log(currentUser);
    res.json(currentUser);
  });
});

router.get('/events_listings', function(req, res){
  User.find().exec(function(error,data){
    console.log(data);
    res.json(data);
  });
});

router.post('/add_show', function(req, res, next) {
  User.findOne({email: req.user.emails[0].value}, function(error, user){
    if (error) {
      console.log(error);
    }
    user.events.push(req.body);
    user.save();
    console.log('saved entry', user);
    res.json(user);
  });
});

router.patch('/edit_show/:userId/:showId', function(req, res){
  console.log(req.body);
 console.log(req.params.userId, req.params.showId);
 User.update({'email': req.params.userId, 'events._id': req.params.showId},{$set : {'events.$' : req.body}}, function(error, data) {
   if (error) {
     console.log('error', error);
   }
   console.log('data',data);
   res.json(data);
 });
});

router.delete('/delete_show/:userId/:showId', function(req, res) {
  User.update({email : req.params.userId}, { $pull : {events: {_id: req.params.showId}}}, function(error, data){
    if (error) {
      console.log(error);
    }
    console.log(data);
  });
});

router.patch('/favorite_show', function(req, res){
  console.log(req.body);

  User.findOne({ email: req.body.myOffer.myEmail }, function(err, user){
    if (err) {
      console.log(err);
    }
    if (!user) {
      res.status(404);
    }
    user.favorite.push(req.body.myOffer);
    user.save();
    console.log('theUser', user);
  });

  User.findOne({ email: req.body.theirOffer.myShow.email}, function(err, user){
    if (err) {
      console.log(err);
    }
    if (!user) {
      res.status(404);
    }
    user.favorite.push(req.body.theirOffer);
    user.save();
  });
  res.send('good');
});

module.exports = router;
