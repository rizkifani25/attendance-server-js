const mongoose = require("mongoose");

const adminSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username: String,
    password: String,
});

module.exports = mongoose.model("adminModel", adminSchema, "admin");
