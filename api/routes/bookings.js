const express = require('express');
const router = express.Router();

//Import BookingsController.js
const BookingsController = require('../controllers/bookingsController');

//Get all products
router.get('/', BookingsController.bookins_get_all);

//Create a new booking
router.post('/', BookingsController.bookings_create_booking);

//Get a single product by ID
router.get('/:bookingId', BookingsController.bookings_get_booking);

//Delete a booking by ID
router.delete('/:bookingId', BookingsController.bookings_delete_booking);

//Update a booking by ID
router.patch('/:bookingId', BookingsController.bookings_update_booking);

module.exports = router;