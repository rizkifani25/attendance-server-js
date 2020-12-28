const mongoose = require('mongoose');
const studentModel = require('../../models/student');
const sequenceModel = require('../../models/sequence');
const roomModel = require('../../models/room');
const bcrypt = require('bcryptjs');
const { logger } = require('../../service/logger');
const { default: Axios } = require('axios');

const parsingTime = (time) => {
    let result;

    if (time == '07.30 - 09.30') result = 'time1';
    else if (time == '10.00 - 12.00') result = 'time2';
    else if (time == '12.30 - 14.30') result = 'time3';
    else if (time == '15.00 - 17.00') result = 'time4';
    else result = '';

    return result;
};

const getUrlFREngine = () => {
    return new Promise((resolve, reject) => {
        sequenceModel.findOne(
            { '_id': 'urlAPI' },
            (err, doc) => {
                if (err) logger(err);
                resolve(doc.value);
            }
        );
    });
};

const filterStudent = (query, array) => {
    let student = [];
    for (let i = 0; i < array.length; i++) {
        if (array[i].student_id.includes(query)) {
            student.push(array[i]);
        }
    }
    return student;
};

// studentList
exports.studentList = async (req, res) => {
    const { student_id } = req.query;

    await studentModel
        .find({}, { __v: 0, _id: 0 }, (err, doc) => {
            if (err) console.log(err);
            let finalResult = filterStudent(student_id, doc);
            res.status(200).send({
                responseCode: 200,
                responseMessage: 'Success',
                data: student_id ? finalResult : doc
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
                    responseMessage: 'Wrong password',
                    data: []
                });
            } else {
                res.status(200).send({
                    responseCode: 200,
                    responseMessage: 'Login success',
                    data: data
                });
            }
        }).catch(err => {
            logger(err);
            res.status(200).send({
                responseCode: 400,
                responseMessage: 'Invalid student id and password',
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
                    { 'list_time.time1.enrolled.student_id': student_id },
                    { 'list_time.time2.enrolled.student_id': student_id },
                    { 'list_time.time3.enrolled.student_id': student_id },
                    { 'list_time.time4.enrolled.student_id': student_id }
                ]
            }
        ]
    }, { __v: 0 }, (err, doc) => {
        if (err) logger(err);
        res.status(200).send({
            responseCode: 200,
            responseMessage: 'Success',
            data: doc ? doc : []
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
                    responseMessage: 'Student id already exist',
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
                    base_image: '',
                    additional_data: [
                        { status: 'ungraduated' }
                    ],
                });

                newStudent
                    .save()
                    .then(data => {
                        res.status(200).send({
                            responseCode: 200,
                            responseMessage: 'Success',
                            data: []
                        });
                    }).catch(err => {
                        console.log(err);
                        res.status(400).send({
                            responseCode: 400,
                            responseMessage: 'Server failed. Can\'t save data',
                            data: []
                        });
                    });
            }
        }).catch(err => {
            console.log(err);
            res.status(400).send({
                responseCode: 400,
                responseMessage: 'Failed',
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
    let base_image = requestBody.base_image;
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
    if (base_image) update.base_image = base_image;
    if (additional_data) update.additional_data = additional_data;

    console.log(update);

    await studentModel
        .findOneAndUpdate(query, { $set: update }, (err, doc, response) => {
            if (err) logger(err);
            console.log(doc);
            res.status(200).send({
                responseCode: 200,
                responseMessage: 'Data updated',
                data: []
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
                    responseMessage: 'Delete success',
                    data: []
                });
            } else {
                res.status(200).send({
                    responseCode: 400,
                    responseMessage: 'Delete failed',
                    data: []
                });
            }
        }).catch(err => {
            console.log(err);
            res.status(400).send({
                responseCode: 400,
                responseMessage: 'Invalid student id',
                data: []
            });
        });
};

// studentAttend
exports.studentAttend = async (req, res) => {
    const { room_id, time, student_id, attend_time, out_time, permission } = req.body;
    const maxDistance = 10.00;
    let query;
    let update;

    let selector = parsingTime(time);

    let keyQuery = 'list_time.' + selector + '.enrolled.student.student_id';
    let keyStatus = 'list_time.' + selector + '.enrolled.$.status';
    let keyAttend = 'list_time.' + selector + '.enrolled.$.attend_time';
    let keyOut = 'list_time.' + selector + '.enrolled.$.out_time';
    let keyPermission = 'list_time.' + selector + '.enrolled.$.permission';

    query = {
        [keyQuery]: student_id,
        room_id: room_id
    };

    res.status(200).send({
        responseCode: 200,
        responseMessage: 'success',
        data: []
    });

    let urlFaceValidator = await getUrlFREngine();
    console.log(query);
    try {
        roomModel.findOne(query, { __v: 0, _id: 0 }, async (err, doc) => {
            let updatedStatus = {};

            console.log('===================DOC FOUND START==========================');

            // validate by distance
            if (attend_time != null) {
                let distance = parseFloat(attend_time['distance']);
                distance <= maxDistance ? updatedStatus['by_distance'] = 'valid' : updatedStatus['by_distance'] = 'not valid';
            } else if (out_time != null) {
                let distance = parseFloat(out_time['distance']);
                distance <= maxDistance ? updatedStatus['by_distance'] = 'valid' : updatedStatus['by_distance'] = 'not valid';
            }

            // validate by photo
            let requestData = {
                room_id: room_id,
                student_id: student_id,
            };

            if (attend_time != null) {
                console.log(attend_time['image']);
                requestData['is_out'] = false;
                await Axios.post(urlFaceValidator, requestData).then(response => {
                    console.log(response.data);
                    let responseBody = response.data;
                    updatedStatus['by_photo'] = responseBody['data']['result'] + ' - ' + responseBody['data']['face_distance'];
                }).catch(error => {
                    logger(error);
                    updatedStatus['by_photo'] = 'something weird happen, can\'t validate using face';
                });
            } else if (out_time != null) {
                console.log(out_time['image']);
                requestData['is_out'] = true;
                await Axios.post(urlFaceValidator, requestData).then(response => {
                    console.log(response.data);
                    let responseBody = response.data;
                    updatedStatus['by_photo'] = responseBody['data']['result'] + ' - ' + responseBody['data']['face_distance'];
                }).catch(error => {
                    logger(error);
                    updatedStatus['by_photo'] = 'something weird happen, can\'t validate using face';
                });
            }
            console.log(updatedStatus);
            console.log('===================DOC FOUND END==========================');

            if (attend_time != null) update = { [keyAttend]: attend_time, [keyStatus]: updatedStatus };
            if (out_time != null) update = { [keyOut]: out_time };
            if (permission != null) update = { [keyPermission]: permission };

            console.log(update);
            roomModel.findOneAndUpdate(query, { $set: update }, { new: true }, (err, doc, next) => {
                if (err) logger(err);
                console.log(doc);
            });
        });
    } catch (error) {
        logger(error);
    }
};