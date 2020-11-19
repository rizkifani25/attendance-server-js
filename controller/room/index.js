const roomModel = require('../../models/room');
const sequenceModel = require('../../models/sequence');
const studentModel = require('../../models/student');

const getNextSequenceValue = async (sequenceName) => {
    return new Promise((resolve, reject) => {
        sequenceModel.findOneAndUpdate(
            { '_id': sequenceName },
            { '$inc': { 'sequence_value': 1 } },
            { new: true },
            (err, doc) => {
                resolve(doc.sequence_value);
            }
        );
    });
};

const broadcastToStudent = async (listStudent, roomId) => {
    let arrayStudent = [];
    console.log(listStudent.length);
    for (let i = 0; i < listStudent.length; i++) {
        arrayStudent.push({ student_id: listStudent[i].student_id });
    }

    let room = {
        room_id: roomId,
        status: 1,
        attend_time: {},
        attend_out: {}
    };

    studentModel.find({ $or: arrayStudent }, (err, res) => {
        if (err) console.log(err);
        console.log(res);
    });

    studentModel.updateMany({ $or: arrayStudent }, { $addToSet: { history_room: room } }, (err, raw) => {
        if (err) console.log(err);
        console.log(raw);
    });
};

// roomRegister
exports.roomRegister = async (req, res) => {
    let { room_name, updated_time, date, time } = req.body;

    updated_time.enrolled = updated_time.enrolled == undefined ? [] : updated_time.enrolled;
    console.log(req.body);
    let updateRoomQuery;
    let updatedData = {
        status: updated_time.status,
        enrolled: updated_time.enrolled,
        lecturer: updated_time.lecturer,
        subject: updated_time.subject
    };

    let timeIdentifier2;

    if (time == 'time1') {
        updatedData['time'] = '07.30 - 09.30';
        updateRoomQuery = { "list_time.time1": updatedData };
        timeIdentifier2 = "time1";
    } else if (time == 'time2') {
        updatedData['time'] = '10.00 - 12.00';
        updateRoomQuery = { "list_time.time2": updatedData };
        timeIdentifier2 = "time2";
    } else if (time == 'time3') {
        updatedData['time'] = '12.30 - 14.30';
        updateRoomQuery = { "list_time.time3": updatedData };
        timeIdentifier2 = "time3";
    } else {
        updatedData['time'] = '15.00 - 17.00';
        updateRoomQuery = { "list_time.time4": updatedData };
        timeIdentifier2 = "time4";
    }

    let query = {
        room_name: room_name,
        date: date,
    };


    await roomModel.findOneAndUpdate(query, { $set: updateRoomQuery }, { new: true }, async (err, doc) => {
        if (err) console.log(err);
        broadcastToStudent(updatedData.enrolled, doc.room_id);
        res.status(200).send({
            responseCode: 200,
            responseMessage: "Success update room information",
            data: []
        });
    });
};

// roomList
exports.roomList = async (req, res) => {
    const { room_name, date } = req.query;

    let query = {
        room_name: room_name,
        date: date
    };

    await roomModel
        .findOne(query, { __v: 0, }, async (err, doc) => {
            if (err) console.log(err);
            if (doc != null) {
                res.status(200).send({
                    responseCode: 200,
                    responseMessage: "Success",
                    data: doc
                });
            } else {
                await getNextSequenceValue('roomId').then(async (nextValue) => {
                    const detailTime1 = {
                        time: '07.30 - 09.30',
                        status: false,
                        enrolled: [],
                        lecturer: '',
                        subject: ''
                    };
                    const detailTime2 = {
                        time: '10.00 - 12.00',
                        status: false,
                        enrolled: [],
                        lecturer: '',
                        subject: ''
                    };
                    const detailTime3 = {
                        time: '12.30 - 14.30',
                        status: false,
                        enrolled: [],
                        lecturer: '',
                        subject: ''
                    };
                    const detailTime4 = {
                        time: '15.00 - 17.00',
                        status: false,
                        enrolled: [],
                        lecturer: '',
                        subject: ''
                    };
                    const newRoom = new roomModel({
                        _id: nextValue,
                        room_id: nextValue + '-' + room_name,
                        room_name: room_name,
                        date: date,
                        list_time: {
                            time1: detailTime1,
                            time2: detailTime2,
                            time3: detailTime3,
                            time4: detailTime4
                        }
                    });

                    await newRoom.save(async (err, doc) => {
                        if (err) console.log(err);
                        res.status(200).send({
                            responseCode: 200,
                            responseMessage: "Success",
                            data: doc
                        });
                    });
                });
            }
        });
};