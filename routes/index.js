const express = require('express');
const router = express.Router();
const eventsController = require('../controllers/eventsController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { catchErrors } = require('../handlers/errorHandlers');

router.get('/', (req, res) => {
  res.render('index', { title: 'Home' });
});

router.get('/events', catchErrors(eventsController.listEvents));
router.get('/event/:slug', catchErrors(eventsController.getEventBySlug));
router.get('/events/add', eventsController.addEvent);
router.post('/events/add', eventsController.createEvent);

router.get('/login', userController.loginForm);
router.post('/login', authController.login);

router.get('/logout', authController.logout);

router.get('/register', userController.registerForm);
router.post(
  '/register',
  userController.validateRegister,
  catchErrors(userController.register),
  authController.login
);

router.get('/account', authController.isLoggedIn, userController.account);
router.post('/account', catchErrors(userController.updateAccount));
router.post('/account/forgot', catchErrors(authController.forgot));
router.get('/account/reset/:token', catchErrors(authController.reset));
router.post(
  '/account/reset/:token',
  authController.confirmedPasswords,
  catchErrors(authController.update)
);

module.exports = router;
