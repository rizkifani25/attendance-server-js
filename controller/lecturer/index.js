const mongoose = require("mongoose");
const lecturerModel = require("../../models/lecturer");
const roomModel = require('../../models/room');
const bcrypt = require("bcryptjs");

// lecturerList
exports.lecturerList = async (req, res) => {
    const { lecturer_name } = req.query;
    let query = {};
    let regex = '/' + lecturer_name + '/i.test(this.lecturer_name)';
    lecturer_name ? lecturer_name == '' ? query = {} : query = { $where: regex } : query = {};

    console.log(query);
    await lecturerModel
        .find(query, { __v: 0, _id: 0, password: 0 }, (err, doc) => {
            if (err) console.log(err);
            console.log(doc);
            res.status(200).send({
                responseCode: 200,
                responseMessage: "Success",
                data: doc
            });
        });
};

// lecturerLogin
exports.lecturerLogin = async (req, res) => {
    const { lecturer_email, password } = req.query;

    const query = {
        lecturer_email: lecturer_email
    };

    await lecturerModel
        .findOne(query, { __v: 0, _id: 0 })
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
                await
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
                responseMessage: "Invalid lecturer name and password",
                data: []
            });
        });
};

// lecturerRegister
exports.lecturerRegister = async (req, res) => {
    const { lecturer_email, lecturer_name, password } = req.query;

    const query = {
        lecturer_email: lecturer_email,
    };

    await lecturerModel
        .findOne(query)
        .exec()
        .then(async data => {
            if (data) {
                res.status(200).send({
                    responseCode: 400,
                    responseMessage: "Email already exist",
                    data: []
                });
            } else {
                // Hashing password
                const saltedKey = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, saltedKey);

                const newLecturer = new lecturerModel({
                    _id: new mongoose.Types.ObjectId(),
                    lecturer_email: lecturer_email,
                    lecturer_name: lecturer_name,
                    password: hashedPassword,
                    history_room: [],
                });

                newLecturer
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

// lecturerUpdateData
exports.lecturerUpdateData = async (req, res) => {
    let requestBody = req.body;
    const lecturer_email = requestBody.lecturer_email;
    let lecturer_name = requestBody.lecturer_name;
    let password = requestBody.password;

    const query = {
        lecturer_email: lecturer_email
    };
    let update = {};

    if (lecturer_name) update.lecturer_name = lecturer_name;
    if (password) {
        // Hashing password
        const saltedKey = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, saltedKey);
        update.password = hashedPassword;
    }

    await lecturerModel
        .findOneAndUpdate(query, { $set: update }, (err, doc) => {
            if (err) console.log(err);
            console.log(doc);
            res.status(200).send({
                responseCode: 200,
                responseMessage: "Data updated",
                data: []
            });
        });
};

// lecturerDelete
exports.lecturerDeleteData = async (req, res) => {
    const { lecturer_email } = req.query;

    const query = {
        lecturer_email: lecturer_email
    };

    await lecturerModel
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
                responseMessage: "Invalid lecturer email",
                data: []
            });
        });
};