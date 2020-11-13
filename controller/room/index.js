const roomModel = require('../../models/room');
const sequenceModel = require('../../models/sequence');
const Time = require('../../models/time');

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

// roomRegister
exports.roomRegister = async (req, res) => {
    const { room_name, time1, time2, time3, time4, date } = req.body;

    let timeOne = new Time(time1.status, time1.enrolled, time1.subject, time1.lecturer);
    let timeTwo = new Time(time2.status, time2.enrolled, time2.subject, time2.lecturer);
    let timeThree = new Time(time3.status, time3.enrolled, time3.subject, time3.lecturer);
    let timeFour = new Time(time4.status, time4.enrolled, time4.subject, time4.lecturer);

    await roomModel.findOne({ room_name: room_name, date: date }, async (err, doc) => {
        if (doc != null) {
            let query = {
                room_name: room_name,
                date: date,
            };
            let updateRoom = {
                time1: timeOne,
                time2: timeTwo,
                time3: timeThree,
                time4: timeFour,
            };
            await roomModel.findOneAndUpdate(query, updateRoom, { new: true }, (err, doc) => {
                if (err) console.log(err);
                res.status(200).send({
                    responseCode: 200,
                    responseMessage: "Success update room information"
                });
            });
        } else {
            await getNextSequenceValue('roomId').then(async (nextValue) => {
                const newRoom = new roomModel({
                    _id: nextValue,
                    room_id: nextValue + '-' + room_name,
                    room_name: room_name,
                    time1: timeOne,
                    time2: timeTwo,
                    time3: timeThree,
                    time4: timeFour,
                    date: date
                });
                await newRoom.save((err, doc) => {
                    if (err) console.log(err);
                    res.status(200).send({
                        responseCode: 200,
                        responseMessage: "Success create new room section",
                        data: []
                    });
                });
            });
        }
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
        .find(query, { __v: 0, })
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