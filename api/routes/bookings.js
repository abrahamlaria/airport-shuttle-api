const express = require('express');
const router = express.Router();

//Import BookingsController.js
const BookingsController = require('../controllers/bookingsController');

//Get all products
router.get('/', BookingsController.bookins_get_all);

//Create a new booking
router.post('/', BookingsController.bookings_create_booking);

module.exports = router;