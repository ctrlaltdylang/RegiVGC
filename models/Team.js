const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const slug = require('slugs');

const teamSchema = new Schema({
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'Teams must be owned by a user!',
  },
  name: {
    type: String,
    trim: true,
    required: 'Team must have a name!',
  },
  slug: String,
  public: {
    type: Boolean,
    default: false,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  lastEdited: {
    type: Date,
    default: Date.now,
  },
  pokemon: [
    {
      species: {
        type: String,
        required: 'Must have a species!',
      },
      nickname: String,
      gigantimax: {
        type: Boolean,
        default: false,
      },
      level: {
        type: Number,
        required: 'Must have a level!',
      },
      ability: {
        type: String,
        required: 'Must have an ability!',
      },
      heldItem: String,
      moves: [String],
      hp: {
        type: Number,
        required: 'Must have an HP stat!',
      },
      attack: {
        type: Number,
        required: 'Must have an attack stat!',
      },
      defense: {
        type: Number,
        required: 'Must have a defense stat!',
      },
      spAtk: {
        type: Number,
        required: 'Must have a special attack stat!',
      },
      spDef: {
        type: Number,
        required: 'Must have a special defense stat!',
      },
      speed: {
        type: Number,
        required: 'Must have a speed stat!',
      },
    },
  ],
});

teamSchema.pre('save', async function (next) {
  if (!this.isModified('name')) {
    next(); // skip it
    return; // stop the function from running
  }
  this.slug = slug(this.name);
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  const teamsWithSlug = await this.constructor.find({ slug: slugRegEx });
  if (teamsWithSlug.length) {
    this.slug = `${this.slug}-${teamsWithSlug.length + 1}`;
  }

  next();
});

module.exports = mongoose.model('Team', teamSchema);
