const jwt = require('jsonwebtoken');
const User = require('../models/user');

//Verify that the token is valid and then export the function to be used as middleware to protect some routes that should be
//login protected.
module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1]; //Get the token from the header and remove the word Bearer and the space between Bearen and the token. 
        console.log(token);
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.userData = decoded;
        next();
    } catch(error) {
        return res.status(401).json({
            message: 'Authentication failed'
        });
    }    
};