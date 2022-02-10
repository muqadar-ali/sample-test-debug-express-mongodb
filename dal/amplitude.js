//Import the mongoose module
var mongoose = require('mongoose');

//Set up default mongoose connection
var mongoDB = '' // url

mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});

//Get the default connection
var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

//Define a schema
var Schema = mongoose.Schema;

var amplitudeSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    eventTime: {
        type: Date,
        required: true
    },
    eventType: String,
    loc: {
        type: {
            type: String,
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [<longitude>, <latitude>]
        }
    },
    deviceId: String,
    rideId: String
});

var Amplitude = mongoose.model('Amplitude', amplitudeSchema );

module.exports = Amplitude