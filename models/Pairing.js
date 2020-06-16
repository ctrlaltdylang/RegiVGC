const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const pairingSchema = new Schema({
  event: {
    type: mongoose.Schema.ObjectId,
    ref: 'Event',
    required: 'Pairings must belong to an event',
  },
  roundNumber: Number,
  isCurrent: Boolean,
  table: String,
  player1: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'Pairings must have at least one player',
  },
  player2: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  matchWinner: [
    {
      matchNumber: Number,
      winner: String,
    },
  ],
});

module.exports = mongoose.model('Pairing', pairingSchema);
