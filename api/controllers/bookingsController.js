const Booking = require('../models/bookings');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');

//Get all products
exports.bookins_get_all = (req, res, next) => {
    Booking
        .find()
        .select('_id trip_details vehicle options contact_info comments payment_details booking_d' +
                'ate update_date booking_status assigned_to')
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
                            rt_pickup_location: reservation.trip_details.rt_pickup_location,
                            rt_pickup_location: reservation.trip_details.rt_dropoff_location,
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
                        booking_date: reservation.booking_date,
                        update_date: reservation.update_date,
                        booking_status: {
                            received: reservation.booking_status.received,
                            scheduled: reservation.booking_status.scheduled,
                            assigned: reservation.booking_status.assigned,
                            completed: reservation.booking_status.completed
                        },
                        assigned_to: reservation.assigned_to,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/bookings/' + reservation._id
                        }
                    }
                })
            };
            res
                .status(200)
                .json(response);
        })
        .catch(err => {
            console.log(err);
            res
                .status(500)
                .json({error: err});
        });
}

//Get a single order by ID
exports.bookings_get_booking = (req, res, next) => {
    const id = req.params.bookingId;
    Booking
        .findById(id)
        .select('_id trip_details vehicle options contact_info comments payment_details booking_d' +
                'ate update_date booking_status assigned_to')
        .exec()
        .then(reservation => {
            if (reservation) {
                res
                    .status(200)
                    .json({
                        booking: reservation,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/bookings/'
                        }
                    });
            } else {
                res
                    .status(404)
                    .json({message: 'No valid entry found for provided ID.'});
            }
        })
        .catch(err => {
            console.log(err);
            res
                .status(500)
                .json({error: err});
        });
}

//Create a new booking
exports.bookings_create_booking = (req, res, next) => {

    // If the type of selected payment is Deposit calculate the 25% of the total
    // price
    const deposit_amount = price => req.body.payment_details.payment_type === "Deposit"
        ? Number((price * 25) / 100)
        : 0;

    // Rest the price minus the deposit and the remaining amount should be paid in
    // the vehicle.
    const in_car_payment = price => {
        const deposit = deposit_amount(price);
        return deposit > 0
            ? Number(price - deposit)
            : 0;
    }

    //If it is roundtrip then the return pickup location = arrival dropoff location
    const rt_pickup_location = roundtrip => roundtrip
        ? req.body.trip_details.dropoff_location
        : "";

    //If it is roundtrip then the return dropoff location = arrival pickup location
    const rt_dropoff_location = roundtrip => roundtrip
        ? req.body.trip_details.pickup_location
        : "";

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
            rt_pickup_location: rt_pickup_location(req.body.trip_details.roundtrip),
            rt_dropoff_location: rt_dropoff_location(req.body.trip_details.roundtrip),
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
        },
        booking_date: new Date().toISOString(),
        update_date: new Date().toISOString(),
        booking_status: {
            received: true,
            scheduled: false,
            assigned: false,
            completed: false
        },
        assigned_to: {
            name: "",
            lastname: "",
            phone_number: "",
            vehicle_type: "",
            vehicle_maker: "",
            vehicle_model: "",
            plate: ""
        }
    });
    booking
        .save()
        .then(result => {
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
                            rt_pickup_location: result.trip_details.rt_pickup_location,
                            rt_dropoff_location: result.trip_details.rt_dropoff_location,
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
                        booking_date: result.booking_date,
                        update_date: result.update_date,
                        booking_status: {
                            received: result.booking_status.received,
                            scheduled: result.booking_status.scheduled,
                            assigned: result.booking_status.assigned,
                            completed: result.booking_status.completed
                        },
                        assigned_to: result.assigned_to,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/bookings/' + result._id
                        }
                    }
                });
            //Send email confirmation to the admin
            BookingConfirmation(result);
        })
        .catch(err => {
            console.log(err);
            res
                .status(500)
                .json({error: err});
        });
}

//Update a product
exports.bookings_update_booking = (req, res, next) => {
    const id = req.params.bookingId;
    const updateOps = {};

    for (const ops of req.body) {
        console.log(JSON.stringify(ops));
        //Update trip details
        updateOps[ops.propPickup_Location] = ops.pickup_locationValue;
        updateOps[ops.propDropoff_Location] = ops.dropoff_locationValue;
        updateOps[ops.propPickup_Date] = ops.pickup_dateValue;
        updateOps[ops.propDropoff_Date] = ops.dropoff_dateValue;
        updateOps[ops.propPickup_Time] = ops.pickup_timeValue;
        updateOps[ops.propFlight_Number] = ops.flight_numberValue;
        updateOps[ops.propPassengers_Count] = ops.passengers_countValue;
        updateOps[ops.propSuitcases_Count] = ops.suitcases_count;
        updateOps[ops.propRoundtrip] = ops.roundtrip;
        updateOps[ops.propRt_Pickup_Location] = ops.rt_pickup_locationValue;
        updateOps[ops.propRt_Dropoff_Location] = ops.rt_dropoff_locationValue;
        updateOps[ops.propRt_Pickup_Date] = ops.rt_pickup_dateValue;
        updateOps[ops.propRt_Dropoff_Date] = ops.rt_dropoff_dateValue;
        updateOps[ops.propRt_Pickup_Time] = ops.rt_pickup_timeValue;
        updateOps[ops.propRt_Flight_Number] = ops.rt_flight_numberValue;
        //Update vehicle details
        updateOps[ops.propSelected_Vehicle] = ops.selected_vehicle;
        updateOps[ops.propPrice] = ops.price;
        //Update options
        updateOps[ops.propBaby_Seats] = ops.baby_seatsValue;
        updateOps[ops.propBooster_Seats] = ops.booster_seatsValue;
        updateOps[ops.propSpecial_Luggage] = ops.special_luggageValue;
        updateOps[ops.propPets] = ops.pets;
        //Update contact info
        updateOps[ops.propName] = ops.nameValue;
        updateOps[ops.propEmail] = ops.emailValue;
        updateOps[ops.propPhone_Number] = ops.phone_numberValue;
        updateOps[ops.propCountry] = ops.country;
        //Update comments
        updateOps[ops.propComments] = ops.commentsValue;
        //Update date
        updateOps[ops.propUpdate_Date] = new Date().toISOString();
        //Update booking status
        updateOps[ops.propReceived] = ops.receivedValue;
        updateOps[ops.propScheduled] = ops.scheduledValue;
        updateOps[ops.propAssigned] = ops.assignedValue;
        updateOps[ops.propCompleted] = ops.completedValue;
        //Update assigned to
        updateOps[ops.propAssignedTo] = ops.assignedToValue;
    }
    // updateOps is an object that will have the updated value/values for name and
    // price.
    Booking.update({
        _id: id
    }, {$set: updateOps})
        .exec()
        .then(result => {
            console.log(result);
            res
                .status(200)
                .json({
                    message: 'Booking updated',
                    request: {
                        type: 'GET',
                        url: 'http://localhost:3000/bookings/' + id
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
    Booking
        .findByIdAndRemove({_id: id})
        .exec()
        .then(result => {
            console.log(result);
            res
                .status(200)
                .json({
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
            res
                .status(500)
                .json({error: err});
        });
}

//Send booking confirmation to the admin
function BookingConfirmation(result) {
    let roundtrip = "";
    if (result.trip_details.roundtrip) {
        roundtrip = `
        <h3>Roundtrip</h3>
        <ul> 
        <li>Is Roundtrip: ${result.trip_details.roundtrip}</li>                  
            <li>Pickup location: ${result.trip_details.rt_pickup_location}</li>
            <li>Dropoff location: ${result.trip_details.rt_dropoff_location}</li>
            <li>Pickup Date: ${result.trip_details.rt_pickup_date}</li>
            <li>Pickup Time: ${result.trip_details.rt_pickup_time}</li> 
            <li>Flight number: ${result.trip_details.rt_flight_number}</li>                      
        </ul>
    `;
    }

    let payment = "";
    if (result.payment_details.payment_type === 'Full') {
        payment = `
        <h3>Payment details</h3>
        <ul> 
            <li>Payment type: ${result.payment_details.payment_type}</li>
            <li>Payment method: ${result.payment_details.payment_method}</li>
            <li>Discount code: ${result.payment_details.discount_code}</li>
            <li>Total price: ${result.payment_details.total_price}</li>                      
        </ul>
    `;
    }
    else if (result.payment_details.payment_type === 'Deposit') {
        payment = `
        <h3>Payment details</h3>
        <ul> 
            <li>Payment type: ${result.payment_details.payment_type}</li>
            <li>Payment method: ${result.payment_details.payment_method}</li>
            <li>Discount code: ${result.payment_details.discount_code}</li>
            <li>Total price: ${result.payment_details.total_price}</li>
            <li>Deposit amount: ${result.payment_details.deposit_amount}</li>
            <li>In car payment: ${result.payment_details.in_car_payment}</li>                   
        </ul>
    `;
    }

    const output = `
        <p>You have a new booking from the website</p>
        <h3>Contact Details</h3>
        <ul>
            <li>Name: ${result.contact_info.name}</li>
            <li>Email: ${result.contact_info.email}</li>
            <li>Phone: ${result.contact_info.phone_number}</li>
            <li>Country: ${result.contact_info.country}</li>
        </ul>
        <h3>Trip details</h3>
        <ul>
            <li>Pickup location: ${result.trip_details.pickup_location}</li>
            <li>Dropoff location: ${result.trip_details.dropoff_location}</li>
            <li>Pickup date: ${result.trip_details.pickup_date}</li>
            <li>Pickup time: ${result.trip_details.pickup_time}</li>
            <li>Flight number: ${result.trip_details.flight_number}</li>
            <li>Passengers count: ${result.trip_details.passengers_count}</li>
            <li>Suitcases count: ${result.trip_details.suitcases_count}</li> 
        </ul>
        ` + roundtrip + `
        <h3>Vehicle</h3>
        <ul>                   
            <li>Selected vehicle: ${result.vehicle.selected_vehicle}</li>
        </ul>
        <h3>Options</h3>
        <ul>
            <li>Baby seats: ${result.options.baby_seats}</li>
            <li>Booster seats: ${result.options.booster_seats}</li>
            <li>Special luggage: ${result.options.special_luggage}</li>
            <li>Pets: ${result.options.pets}</li>
            <li>Comments: ${result.comments}</li>
        </ul>
        ` + payment + `

    `;
    //Send email
    SendMail(output);
};

function SendMail(output) {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        //host: 'smtp.google.com', port: 587,
        service: 'gmail',
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'admin@comfortransfer.com', // Should be an environment variable
            pass: 'Remember-2507' // Should be an environment variable
        },
        tls: { //Remove before going live
            rejectUnauthorized: false
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Web Submission" <admin@comfortransfer.com>', // sender address
        to: 'admin@comfortransfer.com, a_laria@yahoo.com', // list of receivers
        subject: 'New booking ✔', // Subject line
        text: '', // plain text body
        html: output // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        //Do something after the email is sent. Redirect or re render the form.
    });

    //console.log(output + " This is the result object");
}