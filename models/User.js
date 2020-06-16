const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');

mongoose.Promise = global.Promise;

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validte: [validator.isEmail, 'Invalid email address!'],
    required: 'Please supply an email address',
  },
  username: {
    type: String,
    required: 'Please supply a username',
    trim: true,
  },
  firstName: {
    type: String,
    required: 'Please supply a first name',
    trim: true,
  },
  lastName: {
    type: String,
    required: 'Please supply a last name',
    trim: true,
  },
  popid: String,
  switchProfileName: String,
  birthday: String,
  created: {
    type: Date,
    default: Date.now,
  },
  edited: {
    type: Date,
    default: Date.now,
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  teams: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Team',
    },
  ],
  placements: [{ type: mongoose.Schema.ObjectId, ref: 'Placement' }],
});

userSchema.plugin(passportLocalMongoose, { usernameField: 'email' });
userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model('User', userSchema);
