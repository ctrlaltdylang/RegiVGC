const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const placementSchema = new Schema({
  event: {
    type: mongoose.Schema.ObjectId,
    ref: 'Event',
    required: 'Placement must belong to an event',
  },
  player: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  standing: Number,
  dropped: Boolean,
});

module.exports = mongoose.model('Placement', placementSchema);
