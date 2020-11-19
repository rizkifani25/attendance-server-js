const mongoose = require("mongoose");
const studentModel = require("../../models/student");
const roomModel = require('../../models/room');
const bcrypt = require("bcryptjs");

const parsingTime = (time) => {
    let result;

    if (time == '07.30 - 09.30') result = 'time1';
    else if (time == '10.00 - 12.00') result = 'time2';
    else if (time == '12.30 - 14.30') result = 'time3';
    else if (time == '15.00 - 17.00') result = 'time4';
    else result = '';

    return result;
};

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
                responseMessage: "Invalid student id and password",
                data: []
            });
        });
};

// get student room history
exports.studentRoomHistory = async (req, res) => {
    const { student_id, date } = req.query;

    await roomModel.find({
        $and: [
            { date: date },
            {
                $or: [
                    { "list_time.time1.enrolled.student_id": student_id },
                    { "list_time.time2.enrolled.student_id": student_id },
                    { "list_time.time3.enrolled.student_id": student_id },
                    { "list_time.time4.enrolled.student_id": student_id }
                ]
            }
        ]
    }, { __v: 0 }, (err, doc) => {
        if (err) console.log(err);
        res.status(200).send({
            responseCode: 200,
            responseMessage: "Success",
            data: doc
        });
    });
};

// studentRegister
exports.studentRegister = async (req, res) => {
    const { student_id, student_name, password, batch, major } = req.query;

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
                    additional_data: [
                        { status: "ungraduated" }
                    ],
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

// studentAttend
exports.studentAttend = async (req, res) => {
    const { room_id, time, student_id, attend_time, out_time } = req.body;
    const maxDistance = 10.00;
    let query;
    let update;

    selector = parsingTime(time);

    let keyQuery = 'list_time.' + selector + '.enrolled.student_id';
    let keyStatus = 'list_time.' + selector + '.enrolled.$.status';
    let keyAttend = 'list_time.' + selector + '.enrolled.$.attend_time';
    let keyOut = 'list_time.' + selector + '.enrolled.$.out_time';


    query = {
        [keyQuery]: student_id,
        room_id: room_id
    };

    roomModel.findOne(query, { __v: 0, _id: 0 }, (err, doc) => {
        let rangeTime = doc['list_time'][selector]['time'].split(' - ');
        let startTime = parseFloat(rangeTime[0]);
        let endTime = parseFloat(rangeTime[1]);
        let updatedStatus;

        console.log('===================DOC FOUND START==========================');
        console.log('start time :: ' + startTime);
        console.log('end time :: ' + endTime);

        if (attend_time != null) {
            let time = parseFloat(attend_time['time']);
            let distance = parseFloat(attend_time['distance']);
            console.log('attend time :: ' + time + ' distance :: ' + distance);
            distance > maxDistance ? console.log('attend :: not in range') : console.log('attend :: in range');
            time <= startTime ? console.log('attend :: on time') : console.log('attend :: late');
            if (distance <= maxDistance && time <= startTime || time >= startTime + 10) {
                updatedStatus = 0;
            } else {
                updatedStatus = 2;
            }

        } else if (out_time != null) {
            let time = parseFloat(out_time['time']);
            let distance = parseFloat(out_time['distance']);
            console.log('out time :: ' + time + ' distance :: ' + distance);
            distance > maxDistance ? console.log('out :: not in range') : console.log('out :: in range');
            time >= endTime ? console.log('out :: on time') : console.log('out :: not in time');
        }

        console.log('===================DOC FOUND END==========================');

        if (attend_time != null) update = { [keyAttend]: attend_time, [keyStatus]: updatedStatus };
        if (out_time != null) update = { [keyOut]: out_time };

        console.log(update);
        roomModel.findOneAndUpdate(query, { $set: update }, { new: true }, (err, doc, next) => {
            if (err) console.log(err);
            // console.log(doc);
            res.status(200).send({
                responseCode: 200,
                responseMessage: 'success',
                data: doc
            });
        });
    });
};