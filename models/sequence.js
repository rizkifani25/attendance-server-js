const mongoose = require('mongoose');

const sequenceSchema = mongoose.Schema({
    _id: String,
    sequence_value: Number,
    value: String
});

module.exports = mongoose.model('sequenceModel', sequenceSchema, 'sequence');
