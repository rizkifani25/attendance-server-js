const mongoose = require("mongoose");

const studentSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    student_id: String,
    student_name: String,
    password: String,
    batch: String,
    major: String,
    additional_data: Array,
});

module.exports = mongoose.model("studentModel", studentSchema, "student");
