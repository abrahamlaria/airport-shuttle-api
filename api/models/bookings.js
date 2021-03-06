const mongoose = require('mongoose');

const bookingSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    trip_details: {
        pickup_location: {type: String, required: true},
        dropoff_location: {type: String, required: true},
        pickup_date: {type: String, required: true},
        pickup_time: {type: String, required: true},
        flight_number: {type: String, required: true},
        passengers_count: {type: Number, required: true},
        suitcases_count: {type: Number, required: true},
        roundtrip: {type: Boolean},
        rt_pickup_location: {type: String},
        rt_dropoff_location: {type: String},
        rt_pickup_date: {type: String},
        rt_pickup_time: {type: String},       
        rt_flight_number: {type: String}
    },
    vehicle: {
        selected_vehicle: {type: String, required: true},
        price: {type: Number, required: true}
    },
    options: {
        baby_seats: {type: Number, required: true},
        booster_seats: {type: Number, required: true},
        special_luggage: {type: Boolean, required: true},
        pets: {type: Boolean, required: true}
    },
    contact_info: {
        name: {type: String, required: true},
        email: {
            type: String,
            required: true,
            match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
        },
        phone_number: {type: String, required: true},
        country: {type: String, required: true}      
    },   
    comments: {type: String, required: true},
    send_communications: {type: Boolean, required: true},
    agree_to_terms: {type: Boolean, required: true},
    payment_details: {
        payment_type: {type: String},
        payment_method: {type: String},
        discount_code: {type: String},
        deposit_amount: {type: Number},
        total_price: {type: Number},
        in_car_payment: {type: Number}
    },
    booking_date: {type: Date, required: true},
    update_date: {type: Date, required: true},
    booking_status: {
        received: {type: Boolean, required: true},
        scheduled: {type: Boolean, required: true},
        assigned: {type: Boolean, required: true},
        completed: {type: Boolean, required: true}
    },
    assigned_to: {type: Object, required: true}
});

module.exports = mongoose.model('Booking', bookingSchema);