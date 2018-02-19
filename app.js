const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const bookingsRoutes = require('./api/routes/bookings');

mongoose.connect('mongodb://ComforTrans:' + process.env.MONGO_MLAB_PW + '@ds241578.mlab.com:41578/comfortransfer-db');
mongoose.Promise = global.Promise;

//Adds logs to the console
app.use(morgan('dev'));

//Makes the uploads folder public
app.use('/drivers-pictures', express.static('drivers-pictures'));

//Parses the body of the request to a readable format
app.use(bodyParser.urlencoded({
    extended: false
}));

//Extract json data and makes it readable
app.use(bodyParser.json());

//Adding headers to handle CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers', 
        'Origin, X-Requested-With, Accept, Authorization'
    );
    if (req.method === 'OPTIONS') {
        res.header(
            'Access-Control-Allow-', 
            'GET, POST, PUT, PATCH, DELETE'
        );
        return Response.status(200).json({});
    }
    next();
});

//Routes which should handle requests
app.use('/bookings', bookingsRoutes);