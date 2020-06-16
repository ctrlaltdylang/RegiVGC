const fs = require('fs');

// moment.js for handling time/dates easily
exports.moment = require('moment');

// Dump is used to view raw data in views
exports.dump = (obj) => JSON.stringify(obj, null, 2);

// Handling displaying static map
exports.staticMap = ([lng, lat]) =>
  `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=14&size=800x150&key=${process.env.MAP_KEY}&markers=${lat},${lng}&scale=2`;

// inserting an SVG
exports.icon = (name) => fs.readFileSync(`./public/images/icons/${name}.svg`);

// Some details about the site
exports.siteName = `RegiVGC`;

exports.menu = [
  { slug: '/events', title: 'Events', icon: 'events' },
  { slug: '/teams', title: 'Teams', icon: 'teams' },
  { slug: '/map', title: 'Nearby', icon: 'map' },
];
