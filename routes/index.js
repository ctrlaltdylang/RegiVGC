const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/eventsController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { catchErrors } = require('../handlers/errorHandlers');

router.get('/', (req, res) => {
  res.render('index', { title: 'Home' });
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
router.get('/event/:slug/signup', catchErrors(eventsController.signup));

// Adding/Editing Events
router.get('/events/add', eventsController.addEvent);
router.post('/events/add', catchErrors(eventsController.createEvent));
router.post('/events/add/:id', catchErrors(eventsController.updateEvent));

// Nearby/Google Maps Routes
router.get('/nearby', eventsController.mapPage);
router.get('/api/events/near', catchErrors(eventsController.nearbyEvents));

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
