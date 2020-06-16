const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');

passport.use(User.createStrategy());

module.exports = function (passport) {
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());
};
