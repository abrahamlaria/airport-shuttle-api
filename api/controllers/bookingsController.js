const Booking = require('../models/bookings');
const mongoose = require('mongoose');

//Get all products
exports.bookins_get_all = (req, res, next) => {
    Booking.find()
        .select('_id trip_details vehicle options contact_info comments payment_details')
        .exec()
        .then(reservations => {
            const response = {
                count: reservations.length,
                bookings: reservations.map(reservation => {
                    return {                       
                        _id: reservation._id,
                        trip_details: {
                            pickup_location: reservation.trip_details.pickup_location,
                            dropoff_location: reservation.trip_details.dropoff_location,
                            pickup_date: reservation.trip_details.pickup_date,
                            pickup_time: reservation.trip_details.pickup_time,
                            flight_number: reservation.trip_details.flight_number,
                            passengers_count: reservation.trip_details.passengers_count,
                            suitcases_count: reservation.trip_details.suitcases_count,
                            roundtrip: reservation.trip_details.roundtrip,
                            rt_pickup_date: reservation.trip_details.rt_pickup_date,
                            rt_pickup_time: reservation.trip_details.rt_pickup_time,
                            rt_flight_number: reservation.trip_details.rt_flight_number
                        },
                        vehicle: {
                            selected_vehicle: reservation.vehicle.selected_vehicle,
                            price: reservation.vehicle.price
                        },
                        options: {
                            baby_seats: reservation.options.baby_seats,
                            booster_seats: reservation.options.booster_seats,
                            special_luggage: reservation.options.special_luggage,
                            pets: reservation.options.pets
                        },
                        contact_info: {
                            name: reservation.contact_info.name,
                            email: reservation.contact_info.email,
                            phone_number: reservation.contact_info.phone_number,
                            country: reservation.contact_info.country
                        },
                        comments: reservation.comments,
                        send_communications: reservation.send_communications,
                        agree_to_terms: reservation.agree_to_terms,
                        payment_details: {
                            payment_type: reservation.payment_details.payment_type,
                            payment_method: reservation.payment_details.payment_method,
                            discount_code: reservation.payment_details.discount_code,
                            deposit_amount: reservation.payment_details.deposit_amount,
                            total_price: reservation.payment_details.total_price,
                            in_car_payment: reservation.payment_details.in_car_payment
                        },
                        //-------
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/bookings/' + reservation._id
                        }
                    }
                })
            };
            res.status(200).json(response);          
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}

//Get a single order by ID
exports.bookings_get_booking = (req, res, next) => {
    const id = req.params.bookingId;
    Booking.findById(id)
        .select('_id trip_details vehicle options contact_info  comments payment_details')
        .exec()
        .then(reservation => {           
            if (reservation) {
                res.status(200).json({
                    booking: reservation,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/bookings/'
                    }
                });
            } else {
                res.status(404).json({
                    message: 'No valid entry found for provided ID.'
                });
            }           
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err});
        });
}

//Create a new booking
exports.bookings_create_booking = (req, res, next) => {

    //If the type of selected payment is Deposit calculate the 25% of the total price
    const deposit_amount = price => req.body.payment_details.payment_type === "Deposit" ? Number((price * 25) / 100) : 0;
    
    //Rest the price minus the deposit and the remaining amount should be paid in the vehicle.
    const in_car_payment = price => {
        const deposit = deposit_amount(price);
        return deposit > 0 ? Number(price - deposit) : 0;
    }

    const booking = new Booking({
        _id: new mongoose
            .Types
            .ObjectId(),
        trip_details: {
            pickup_location: req.body.trip_details.pickup_location,
            dropoff_location: req.body.trip_details.dropoff_location,
            pickup_date: req.body.trip_details.pickup_date,
            pickup_time: req.body.trip_details.pickup_time,
            flight_number: req.body.trip_details.flight_number,
            passengers_count: req.body.trip_details.passengers_count,
            suitcases_count: req.body.trip_details.suitcases_count,
            roundtrip: req.body.trip_details.roundtrip,
            rt_pickup_date: req.body.trip_details.rt_pickup_date,
            rt_pickup_time: req.body.trip_details.rt_pickup_time,
            rt_flight_number: req.body.trip_details.rt_flight_number
        },
        vehicle: {
            selected_vehicle: req.body.vehicle.selected_vehicle,
            price: req.body.vehicle.price
        },
        options: {
            baby_seats: req.body.options.baby_seats,
            booster_seats: req.body.options.booster_seats,
            special_luggage: req.body.options.special_luggage,
            pets: req.body.options.pets
        },
        contact_info: {
            name: req.body.contact_info.name,
            email: req.body.contact_info.email,
            phone_number: req.body.contact_info.phone_number,
            country: req.body.contact_info.country
        },
        comments: req.body.comments,
        send_communications: req.body.send_communications,
        agree_to_terms: req.body.agree_to_terms,
        payment_details: {
            payment_type: req.body.payment_details.payment_type,
            payment_method: req.body.payment_details.payment_method,
            discount_code: req.body.payment_details.discount_code,
            deposit_amount: deposit_amount(req.body.vehicle.price),
            total_price: req.body.payment_details.total_price,
            in_car_payment: in_car_payment(req.body.vehicle.price)
        }
    });
    booking
        .save()
        .then(result => {          
            console.log(result);
            res
                .status(201)
                .json({
                    message: 'Created booking successfully.',
                    booking: {
                        _id: result._id,
                        trip_details: {
                            pickup_location: result.trip_details.pickup_location,
                            dropoff_location: result.trip_details.dropoff_location,
                            pickup_date: result.trip_details.pickup_date,
                            pickup_time: result.trip_details.pickup_time,
                            flight_number: result.trip_details.flight_number,
                            passengers_count: result.trip_details.passengers_count,
                            suitcases_count: result.trip_details.suitcases_count,
                            roundtrip: result.trip_details.roundtrip,
                            rt_pickup_date: result.trip_details.rt_pickup_date,
                            rt_pickup_time: result.trip_details.rt_pickup_time,
                            rt_flight_number: result.trip_details.rt_flight_number
                        },
                        vehicle: {
                            selected_vehicle: result.vehicle.selected_vehicle,
                            price: result.vehicle.price
                        },
                        options: {
                            baby_seats: result.options.baby_seats,
                            booster_seats: result.options.booster_seats,
                            special_luggage: result.options.special_luggage,
                            pets: result.options.pets
                        },
                        contact_info: {
                            name: result.contact_info.name,
                            email: result.contact_info.email,
                            phone_number: result.contact_info.phone_number,
                            country: result.contact_info.country
                        },
                        comments: result.comments,
                        send_communications: result.send_communications,
                        agree_to_terms: result.agree_to_terms,
                        payment_details: {
                            payment_type: result.payment_details.payment_type,
                            payment_method: result.payment_details.payment_method,
                            discount_code: result.payment_details.discount_code,
                            deposit_amount: result.payment_details.deposit_amount,
                            total_price: result.payment_details.total_price,
                            in_car_payment: result.payment_details.in_car_payment
                        },
                        //---------
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/bookings/' + result._id
                        }
                    }
                });
        })
        .catch(err => {
            console.log(err);
            res
                .status(500)
                .json({error: err});
        });
}

//Delete a product by ID
exports.bookings_delete_booking = (req, res, next) => {
    const id = req.params.bookingId;
    Booking.findByIdAndRemove({
        _id: id
    })
        .exec()
        .then( result => {
            console.log(result);
            res.status(200).json({
                message: 'Product deleted',
                request: {
                    type: 'POST',
                    url: 'http://localhost:3000/products/',
                    body: {
                        name: 'String',
                        price: 'Number'
                    }
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
}
