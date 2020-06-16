const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const slug = require('slugs');

const eventSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: 'Event must have a name!',
  },
  slug: String,
  startDate: {
    type: String,
    // required: 'Must specify when the event starts!',
  },
  startTime: {
    type: String,
    // required: 'Must specify when the event starts!'
  },
  endDate: {
    type: String,
    // required: 'Must specify when the event ends!',
  },
  endTime: {
    type: String,
    // required: 'Must specify when the event starts!'
  },
  description: {
    type: String,
    trim: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    // required: 'Events must be created by a User!',
  },
  lastEditedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    // required: 'Events must be edited by a User!',
  },
  location: {
    type: {
      type: String,
      default: 'Point',
    },
    coordinates: [
      {
        type: Number,
        // required: 'You must supply coordinates!',
      },
    ],
    address: {
      type: String,
      // required: 'You must supply an address!',
    },
  },
  players: [
    {
      player_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
      team_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'Team',
      },
      status: Boolean,
    },
  ],
});

eventSchema.index({
  name: 'text',
  host: 'text',
});

eventSchema.pre('save', async function (next) {
  if (!this.isModified('name')) {
    next(); // skip it
    return; // stop the function from running
  }
  this.slug = slug(this.name);
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const eventsWithSlug = await this.constructor.find({ slug: slugRegEx });
  if (eventsWithSlug.length) {
    this.slug = `${this.slug}-${eventsWithSlug.length + 1}`;
  }

  next();
});

module.exports = mongoose.model('Event', eventSchema);
