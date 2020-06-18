const mongoose = require('mongoose');
const Event = mongoose.model('Event');

const confirmCreator = (event, user) => {
  if (!event.createdBy.equals(user._id)) {
    throw Error('You do not own this store, you must own a store to edit it.');
  }
};

exports.addEvent = (req, res) => {
  res.render('editEvent', { title: 'Create Event' });
};

exports.createEvent = async (req, res) => {
  req.body.createdBy = req.user._id;
  req.body.lastEditedBy = req.user._id;
  req.body.created = Date.now();
  const event = await new Event(req.body).save();
  req.flash('success', `Successfully Created <a href='/event/${event.slug}'>${event.name}</a> 🚀.`);
  res.redirect(`/events`);
};

exports.listEvents = async (req, res) => {
  const events = await Event.find({ public: true }).populate('createdBy');
  res.render('events', { events, title: 'Upcoming Events' });
};

exports.userEvents = async (req, res) => {
  const events = await Event.find({ createdBy: req.params.id }).populate('createdBy');
  res.render('events', { events, title: 'My Events' });
};

exports.getEventBySlug = async (req, res, next) => {
  const event = await Event.findOne({ slug: req.params.slug }).populate('createdBy');
  if (!event) return next();
  const currentUserCreated = event.createdBy.equals(req.user._id);
  res.render('event', { event, currentUserCreated, title: event.name });
};

exports.editEvent = async (req, res) => {
  const event = await Event.findOne({ _id: req.params.id });
  confirmCreator(event, req.user);
  res.render('editEvent', { title: `Edit ${event.name}`, event });
};

exports.updateEvent = async (req, res) => {
  req.body.location.type = 'Point';
  req.body.public = req.body.public === 'on' ? true : false;
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
