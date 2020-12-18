const mongoose = require("mongoose");

const lecturerSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    lecturer_email: String,
    lecturer_name: String,
    password: String,
    history_room: Array,
});

module.exports = mongoose.model("lecturerModel", lecturerSchema, "lecturer");
