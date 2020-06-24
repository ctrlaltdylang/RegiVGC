const mongoose = require('mongoose');
const moment = require('moment');
const Event = mongoose.model('Event');
const Team = mongoose.model('Team');

/*  
  Checks to see if the signed in user 
  created the event 
*/
const confirmCreator = (event, user) => {
  if (!event.createdBy.equals(user._id)) {
    throw Error('You do not create this event, you must have created an event to edit it.');
  }
};

// GET editEvent page
exports.addEvent = (req, res) => {
  res.render('editEvent', { title: 'Create Event' });
};

/*
  POST
  Creates event, redirects user to All events page
*/
exports.createEvent = async (req, res) => {
  req.body.createdBy = req.user._id;
  req.body.lastEditedBy = req.user._id;
  req.body.created = Date.now();
  req.body.public = req.body.public === 'on' ? true : false;
  const event = await new Event(req.body).save();
  req.flash('success', `Successfully Created <a href='/event/${event.slug}'>${event.name}</a> 🚀.`);
  res.redirect(`/events`);
};

/* 
  GET 
  All events that are public & start after yesterday (i.e start today)
  Renders all events returned, pagination
*/
exports.listEvents = async (req, res) => {
  const page = req.params.page || 1;
  const limit = 6;
  const skip = page * limit - limit;

  const totalEventsPromise = Event.find({
    public: true,
    startDate: { $gte: moment().subtract(1, 'days') },
  }).count();

  const eventsPromise = Event.find({
    public: true,
    startDate: { $gte: moment().subtract(1, 'days') },
  })
    .populate('createdBy')
    .skip(skip)
    .limit(limit)
    .sort({ created: 'desc' });

  const [count, events] = await Promise.all([totalEventsPromise, eventsPromise]);

  const pages = Math.ceil(count / limit);
  if (!events.length && skip) {
    res.redirect(`/events/page/${pages}`);
    return;
  }

  const paginationUrl = 'events';
  res.render('events', { title: 'Upcoming Events', events, page, pages, count, paginationUrl });
};

/* 
  GET 
  All events that are created by the signed in user
  Renders user's events, pagination
*/
exports.userEvents = async (req, res) => {
  const page = req.params.page || 1;
  const limit = 6;
  const skip = page * limit - limit;

  const totalEventsPromise = Event.find({ createdBy: req.params.id });

  const eventsPromise = Event.find({ createdBy: req.params.id })
    .populate('createdBy')
    .skip(skip)
    .limit(limit)
    .sort({ created: 'desc' });

  const [total, events] = await Promise.all([totalEventsPromise, eventsPromise]);

  const count = total.length;

  const pages = Math.ceil(count / limit);
  if (!events.length && skip) {
    res.redirect(`/events/user/${req.params.id}/page/${pages}`);
    return;
  }

  const paginationUrl = `events/user/${req.params.id}`;

  res.render('events', { title: 'My Events', events, page, pages, count, paginationUrl });
};

/*
  GET
  Gets single event by slug, 
  Populated createdBy to get the creator's username
  Checks to see if the signed in user created the event for View stuff
  Renders single event page
*/
exports.getEventBySlug = async (req, res, next) => {
  const event = await Event.findOne({ slug: req.params.slug }).populate('createdBy');
  if (!event) return next();
  const currentUserCreated = req.user ? event.createdBy.equals(req.user._id) : null;
  let registered;
  if (req.user) {
    const players = event.players.filter((player) => {
      return player.player_id.toString() == req.user._id.toString();
    });
    registered = players.length > 0 ? true : false;
  } else {
    registered = false;
  }
  res.render('event', { event, currentUserCreated, registered, title: event.name });
};

/*
  GET
  Gets single event by id, confirms signed in user created it
  Renders editEvent page
*/
exports.editEvent = async (req, res) => {
  const event = await Event.findOne({ _id: req.params.id });
  confirmCreator(event, req.user);
  res.render('editEvent', { title: `Edit ${event.name}`, event });
};

/*
  POST
  Sets location type to Point for MongoDB shenanigans
  Checkboxes are weird, so sets public to boolean instead of "on"
  Updates event with data in body
  Renders all Events page & flash
*/
exports.updateEvent = async (req, res) => {
  req.body.location.type = 'Point';
  req.body.public = req.body.public === 'on' ? true : false;
  req.body.lastEditedBy = req.user._id;
  const event = await Event.findOneAndUpdate({ _id: req.params.id }, req.body, {
    new: true,
    runValidators: true,
  }).exec();
  req.flash(
    'success',
    `Successfully updated <strong>${event.name}</strong>.
      <a href="/event/${event.slug}">View Event</a>`
  );
  res.redirect(`/events`);
};

// GET sign up for event page
exports.signup = async (req, res, next) => {
  const event = await Event.findOne({ slug: req.params.slug });
  const teams = await Team.find({ createdBy: req.user._id });
  if (!event) return next();
  const url = `/event/signup/${event._id}`;
  res.render('signup', { title: `Signup for ${event.name}`, event, teams, url });
};

exports.signupForEvent = async (req, res) => {
  const event = await Event.findOne({ _id: req.params.id });

  let newEvent = event;
  const player = {
    player_id: req.user._id,
    team_id: req.body.team,
    status: true,
  };
  if (!newEvent.players) {
    newEvent.players = [];
  }
  newEvent.players.push(player);
  const updatedEvent = await Event.findOneAndUpdate({ _id: req.params.id }, newEvent, {
    new: true,
    runValidators: true,
  }).exec();
  req.flash('success', `Successfully signed up for <strong>${updatedEvent.name}</strong>.`);
  res.redirect(`/events`);
};

// GET Lists Players & their POPIDs
exports.getPlayers = async (req, res) => {
  const event = await Event.findOne({ _id: req.params.id }).populate(
    'players.player_id players.team_id'
  );
  res.render('players', { title: `Players in ${event.name}`, event });
};

// GET Lists events the signed in user is registered for
exports.registeredEvents = async (req, res) => {
  const events = await Event.find({ 'players.player_id': req.params.user_id }).populate(
    'createdBy'
  );
  res.render('events', { title: 'Registered Events', events });
};

// GET unregister page
exports.unregister = async (req, res) => {
  const event = await Event.findOne({ _id: req.params.id });
  const player = event.players.filter((player) => {
    return player.player_id.toString() === req.user._id.toString();
  });
  const team = await Team.findOne({ _id: player[0].team_id });
  res.render('unregister', { title: `Unregister for ${event.name}`, event, team });
};

// POST Unregisters player from event
exports.unregisterPlayer = async (req, res) => {
  const event = await Event.findOne({ _id: req.params.id });
  const newEvent = event;
  newEvent.players.splice(
    newEvent.players.findIndex((item) => item.player_id.toString() === req.user._id.toString()),
    1
  );
  await Event.findOneAndUpdate({ _id: req.params.id }, newEvent, {
    new: true,
    runValidators: true,
  }).exec();
  req.flash('success', `Successfully unregistered for <strong>${event.name}</strong>.`);
  res.redirect(`/events`);
};

// GET sign up for event page
exports.editRegistration = async (req, res, next) => {
  const event = await Event.findOne({ _id: req.params.id });
  const teams = await Team.find({ createdBy: req.user._id });
  if (!event) return next();
  const url = `/event/registration/${event._id}/${req.user._id}`;
  res.render('signup', { title: `Register for ${event.name}`, event, teams, url });
};

exports.updateRegistration = async (req, res) => {
  const event = await Event.findOne({ _id: req.params.id });

  let newEvent = event;
  const player = {
    player_id: req.user._id,
    team_id: req.body.team,
    status: true,
  };

  newEvent.players.splice(
    newEvent.players.findIndex((item) => item.player_id.toString() === req.user._id.toString()),
    1
  );
  newEvent.players.push(player);
  const updatedEvent = await Event.findOneAndUpdate({ _id: req.params.id }, newEvent, {
    new: true,
    runValidators: true,
  }).exec();
  req.flash(
    'success',
    `Successfully updated registration for <strong>${updatedEvent.name}</strong>.`
  );
  res.redirect(`/events`);
};

// GET Delete Page
exports.deleteEvent = async (req, res) => {
  const event = await Event.findOne({ _id: req.params.id });
  res.render('deleteEvent', { title: `Delete ${event.name}`, event });
};

// POST Delete Event
exports.delete = async (req, res) => {
  await Event.deleteOne({ _id: req.params.id });
  console.log();
  req.flash('success', 'Deleted event successfully!');
  res.redirect(`/events`);
};

/*
  GET
  API based Routes (no associated View, uses axios)
  Searches for events that are within 100KM of location passed in, 
    are public, and start after yesterday
  Returns Events in json
*/
exports.nearbyEvents = async (req, res) => {
  const coordinates = [req.query.lng, req.query.lat].map(parseFloat);
  const eventQuery = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates,
        },
        $maxDistance: 100000,
      },
    },
    public: true,
    startDate: { $gte: moment().subtract(1, 'days') },
  };

  const events = await Event.find(eventQuery)
    .select('slug name description location createdBy')
    .populate('createdBy')
    .limit(10);
  res.json(events);
};

// GET map page
exports.mapPage = (req, res) => {
  res.render('map', { title: 'Map' });
};
