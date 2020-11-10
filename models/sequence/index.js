const mongoose = require('mongoose');

const sequenceSchema = mongoose.Schema({
    _id: String,
    sequence_value: Number
});

module.exports = mongoose.model('sequenceModel', sequenceSchema, 'sequence');
