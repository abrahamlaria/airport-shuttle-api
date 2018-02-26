const express = require('express');
const router = express.Router();

const UserController = require('../controllers/userController');

//Create a new user
router.post('/signup', UserController.user_signup_user);

//Create a new driver
router.post('/driver-signup', UserController.user_signup_user);

//Login users
router.post('/login', UserController.user_login_user);

//Delete a specific user by ID
router.delete('/:userId', UserController.user_delete_user);

module.exports = router;