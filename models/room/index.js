const mongoose = require('mongoose');

const roomSchema = mongoose.Schema({
    _id: Number,
    room_id: String,
    room_name: String,
    time1: Object,
    time2: Object,
    time3: Object,
    time4: Object,
    date: String,
});

module.exports = mongoose.model('roomModel', roomSchema, 'room');
