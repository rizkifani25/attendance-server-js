const mongoose = require('mongoose');

const roomSchema = mongoose.Schema({
    _id: Number,
    room_id: String,
    room_name: String,
    date: String,
    list_time: Object,
});

module.exports = mongoose.model('roomModel', roomSchema, 'room');
