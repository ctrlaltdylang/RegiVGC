require('dotenv').config({ path: __dirname + '/../variables.env' });

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE);
mongoose.Promise = global.Promise;

const Event = require('../models/Event');
const Pairing = require('../models/Pairing');
const Placement = require('../models/Placement');
const Team = require('../models/Team');
const User = require('../models/User');

async function deleteData() {
  console.log('😢😢 Goodbye Data...');
  await Event.remove();
  await Pairing.remove();
  await Placement.remove();
  await Team.remove();
  await User.remove();
  console.log('Testing Data Deleted.');
  process.exit();
}

deleteData();
