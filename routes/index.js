const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/eventsController');
const teamsController = require('../controllers/teamsController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { catchErrors } = require('../handlers/errorHandlers');

router.get('/', (req, res) => {
  res.render('index', { title: 'Home' });
});

router.get('/privacy', (req, res) => {
  res.render('privacy', { title: 'Privacy Policy' });
});

router.get('/terms', (req, res) => {
  res.render('terms', { title: 'Terms of Service' });
});

/* Event Routes */

// All Events
router.get('/events', catchErrors(eventsController.listEvents));
router.get('/events/page/:page', catchErrors(eventsController.listEvents));

// Events By User
router.get('/events/user/:id', catchErrors(eventsController.userEvents));
router.get('/events/user/:id/page/:page', catchErrors(eventsController.userEvents));

// Event by Slug (single events)
router.get('/event/:slug', catchErrors(eventsController.getEventBySlug));
router.get('/event/:id/edit', catchErrors(eventsController.editEvent));

// Players for Event
router.get('/event/:id/players', catchErrors(eventsController.getPlayers));

// Signup For Event
router.get('/event/:slug/signup', catchErrors(eventsController.signup));
router.post('/event/signup/:id', catchErrors(eventsController.signupForEvent));

// Unregister for Event
router.get('/event/unregister/:id/:player', catchErrors(eventsController.unregister));
router.post('/event/unregister/:id/:player', catchErrors(eventsController.unregisterPlayer));

// Edit registration for Event
router.get('/event/registration/:id/:player/', catchErrors(eventsController.editRegistration));
router.post('/event/registration/:id/:player/', catchErrors(eventsController.updateRegistration));

// See Registered Events
router.get('/events/registrations/:user_id', catchErrors(eventsController.registeredEvents));

// Adding/Editing Events
router.get('/events/add', eventsController.addEvent);
router.post('/events/add', catchErrors(eventsController.createEvent));
router.post('/events/add/:id', catchErrors(eventsController.updateEvent));

// Deleting Events
router.get('/event/:id/delete', eventsController.deleteEvent);
router.post('/event/:id/delete', catchErrors(eventsController.delete));

// Nearby/Google Maps Routes
router.get('/nearby', eventsController.mapPage);
router.get('/api/events/near', catchErrors(eventsController.nearbyEvents));

/* Teams Routes */

// All Teams
router.get('/teams', teamsController.listTeams);
router.get('/teams/page/:page', catchErrors(teamsController.listTeams));

// Adding/Editing Teams
router.get('/teams/add', teamsController.addTeam);
router.post('/teams/add', catchErrors(teamsController.createTeam));
router.post('/teams/add/:id', catchErrors(teamsController.updateTeam));

// Team by Slug (single team)
router.get('/team/:slug', catchErrors(teamsController.getTeamBySlug));
router.get('/team/:id/edit', catchErrors(teamsController.editTeam));

// Teams By User
router.get('/teams/user/:id', catchErrors(teamsController.userTeams));
router.get('/teams/user/:id/page/:page', catchErrors(teamsController.userTeams));

// Delete Team
router.get('/team/:id/delete', catchErrors(teamsController.deleteTeam));
router.post('/team/:id/delete', catchErrors(teamsController.delete));

// Account Routes
router.get('/account', authController.isLoggedIn, userController.account);
router.post('/account', catchErrors(userController.updateAccount));
router.post('/account/forgot', catchErrors(authController.forgot));
router.get('/account/reset/:token', catchErrors(authController.reset));
router.post(
  '/account/reset/:token',
  authController.confirmedPasswords,
  catchErrors(authController.update)
);

/* Auth Routes */

// Login/Logout Routes
router.get('/login', userController.loginForm);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// Register Routes
router.get('/register', userController.registerForm);
router.post(
  '/register',
  userController.validateRegister,
  catchErrors(userController.register),
  authController.login
);

module.exports = router;
