const express = require('express');
const router = express.Router();

const ProfileController = require('../controllers/userController');

//Get all profiles profile
router.post('/', UserController.user_get_all); //Only an admin

//Create a new user profile
router.post('/user-profile', UserController.user_create_user_profile); //Only an authenticated user

//Create a new driver profile
router.post('/driver-profile', UserController.user_create_driver_profile); //Only an authenticated driver

//Delete a specific user by ID
//router.delete('/:userId', UserController.user_delete_user);

//Update a booking by ID.
router.patch('/:profileId', UserController.user_update_profile); //Only the authenticated person who the profile belongs to.
module.exports = router;