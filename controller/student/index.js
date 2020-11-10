const mongoose = require("mongoose");
const studentModel = require("../../models/student");
const bcrypt = require("bcryptjs");

// studentList
exports.studentList = async (req, res) => {
    const { student_id } = req.query;
    let query = {};
    student_id ? query = { student_id: student_id } : query = {};

    await studentModel
        .find(query, { __v: 0, _id: 0, password: 0 })
        .exec()
        .then(data => {
            res.status(200).send({
                responseCode: 200,
                responseMessage: "Success",
                data: data
            });
        }).catch(err => {
            console.log(err);
            res.status(400).send({
                responseCode: 400,
                responseMessage: "Listing failed",
                data: []
            });
        });
};

// studentLogin
exports.studentLogin = async (req, res) => {
    const { student_id, password } = req.query;

    const query = {
        student_id: student_id
    };

    await studentModel
        .findOne(query, { __V: 0, _id: 0 })
        .exec()
        .then(async data => {
            const isValidPass = await bcrypt.compare(password, data.password);
            if (!isValidPass) {
                res.status(200).send({
                    responseCode: 400,
                    responseMessage: "Wrong password",
                    data: []
                });
            } else {
                res.status(200).send({
                    responseCode: 200,
                    responseMessage: "Login success",
                    data: []
                });
            }
        }).catch(err => {
            console.log(err);
            res.status(400).send({
                responseCode: 400,
                responseMessage: "Invalid student id and password",
                data: []
            });
        });
};

// studentRegister
exports.studentRegister = async (req, res) => {
    let requestBody = req.body;
    const student_id = requestBody.student_id;
    const student_name = requestBody.student_name;
    const password = requestBody.password;
    const batch = requestBody.batch;
    const major = requestBody.major;
    let additional_data = requestBody.additional_data;

    const query = {
        student_id: student_id,
    };

    await studentModel
        .findOne(query)
        .exec()
        .then(async data => {
            if (data) {
                res.status(200).send({
                    responseCode: 400,
                    responseMessage: "Student id already exist",
                    data: []
                });
            } else {
                // Hashing password
                const saltedKey = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, saltedKey);

                const newStudent = new studentModel({
                    _id: new mongoose.Types.ObjectId(),
                    student_id: student_id,
                    student_name: student_name,
                    password: hashedPassword,
                    batch: batch,
                    major: major,
                    additional_data: additional_data,
                });

                newStudent
                    .save()
                    .then(data => {
                        res.status(200).send({
                            responseCode: 200,
                            responseMessage: "Success",
                            data: []
                        });
                    }).catch(err => {
                        console.log(err);
                        res.status(400).send({
                            responseCode: 400,
                            responseMessage: "Server failed. Can't save data",
                            data: []
                        });
                    });
            }
        }).catch(err => {
            console.log(err);
            res.status(400).send({
                responseCode: 400,
                responseMessage: "Failed",
                data: []
            });
        });
};

// studentUpdateData
exports.studentUpdateData = async (req, res) => {
    let requestBody = req.body;
    const student_id = requestBody.student_id;
    let student_name = requestBody.student_name;
    let password = requestBody.password;
    let batch = requestBody.batch;
    let major = requestBody.major;
    let additional_data = requestBody.additional_data;

    const query = {
        student_id: student_id
    };
    let update = {};

    if (student_name) update.student_name = student_name;
    if (password) {
        // Hashing password
        const saltedKey = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, saltedKey);
        update.password = hashedPassword;
    }
    if (batch) update.batch = batch;
    if (major) update.major = major;
    if (additional_data) update.additional_data = additional_data;

    await studentModel
        .findOneAndUpdate(query, { $set: update })
        .then(data => {
            res.status(200).send({
                responseCode: 200,
                responseMessage: "Data updated",
                data: []
            })
                .catch(err => {
                    res.status(400).send({
                        responseCode: 400,
                        responseMessage: "Data failed to update",
                        data: []
                    });
                });
        });
};

// studentDelete
exports.studentDeleteData = async (req, res) => {
    const { student_id } = req.query;

    const query = {
        student_id: student_id
    };

    await studentModel
        .deleteOne(query)
        .then(async data => {
            if (data.deletedCount == 1) {
                res.status(200).send({
                    responseCode: 200,
                    responseMessage: "Delete success",
                    data: []
                });
            } else {
                res.status(200).send({
                    responseCode: 400,
                    responseMessage: "Delete failed",
                    data: []
                });
            }
        }).catch(err => {
            console.log(err);
            res.status(400).send({
                responseCode: 400,
                responseMessage: "Invalid student id",
                data: []
            });
        });
};