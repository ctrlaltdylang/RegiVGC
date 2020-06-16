const mongoose = require('mongoose');
const Event = mongoose.model('Event');

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
  const events = await Event.find().populate('createdBy');
  res.render('events', { events, title: 'Upcoming Events' });
};

exports.getEventBySlug = async (req, res, next) => {
  const event = await Event.findOne({ slug: req.params.slug }).populate('createdBy');
  if (!event) return next();
  res.render('event', { event, title: event.name });
};
