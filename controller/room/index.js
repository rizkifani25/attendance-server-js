const lecturerModel = require("../../models/lecturer");
const roomModel = require("../../models/room");
const sequenceModel = require("../../models/sequence");
const studentModel = require("../../models/student");
const { logger, info } = require("../../service/logger");

const getNextSequenceValue = async (sequenceName) => {
  return new Promise((resolve, reject) => {
    sequenceModel.findOneAndUpdate(
      { _id: sequenceName },
      { $inc: { sequence_value: 1 } },
      { new: true },
      (err, doc) => {
        resolve(doc.sequence_value);
      }
    );
  });
};

const broadcastToStudent = async (listStudent, roomId) => {
  let arrayStudent = [];

  if (listStudent.length > 0) {
    logger("Execute broadcastToStudent");
    for (let i = 0; i < listStudent.length; i++) {
      arrayStudent.push({ student_id: listStudent[i].student.student_id });
    }

    let room = {
      room_id: roomId,
    };

    studentModel.find({ $or: arrayStudent }, (err, res) => {
      if (err) logger(err);
      logger(res);
    });

    studentModel.updateMany(
      { $or: arrayStudent },
      { $addToSet: { history_room: room } },
      (err, raw) => {
        if (err) logger(err);
        logger(raw);
      }
    );
  } else {
    logger("Not execute broadcastToStudent");
  }
};

const broadcastToLecturer = async (lecturer, roomId) => {
  if (lecturer) {
    logger("Execute broadcastToLecturer");

    let query = {
      lecturer_email: lecturer.lecturer_email,
    };

    let room = {
      room_id: roomId,
    };

    lecturerModel.updateMany(
      query,
      { $addToSet: { history_room: room } },
      (err, raw) => {
        if (err) logger(err);
        info("Total Data Modified = " + raw["nModified"]);
      }
    );
  } else {
    logger("Not execute broadcastToLecturer");
  }
};

// roomRegister
exports.roomRegister = async (req, res) => {
  let { room_name, updated_time, date, time } = req.body;
  updated_time.enrolled =
    updated_time.enrolled == undefined ? [] : updated_time.enrolled;

  let updateRoomQuery;
  let updatedData = {
    status: updated_time.status,
    enrolled: updated_time.enrolled,
    lecturer: updated_time.lecturer,
    subject: updated_time.subject,
  };

  let splitDate = date.split("-");
  if (time == "time1") {
    updatedData["time"] = "07.30 - 09.30";
    updatedData["punch_in"] = new Date(
      splitDate[0],
      splitDate[1] - 1,
      splitDate[2],
      7,
      30,
      00,
      00
    );
    updatedData["punch_out"] = new Date(
      splitDate[0],
      splitDate[1] - 1,
      splitDate[2],
      9,
      30,
      00,
      00
    );
    updateRoomQuery = { "list_time.time1": updatedData };
  } else if (time == "time2") {
    updatedData["time"] = "10.00 - 12.00";
    updatedData["punch_in"] = new Date(
      splitDate[0],
      splitDate[1] - 1,
      splitDate[2],
      10,
      0,
      00,
      00
    );
    updatedData["punch_out"] = new Date(
      splitDate[0],
      splitDate[1] - 1,
      splitDate[2],
      12,
      0,
      00,
      00
    );
    updateRoomQuery = { "list_time.time2": updatedData };
  } else if (time == "time3") {
    updatedData["time"] = "12.30 - 14.30";
    updatedData["punch_in"] = new Date(
      splitDate[0],
      splitDate[1] - 1,
      splitDate[2],
      12,
      30,
      00,
      00
    );
    updatedData["punch_out"] = new Date(
      splitDate[0],
      splitDate[1] - 1,
      splitDate[2],
      14,
      30,
      00,
      00
    );
    updateRoomQuery = { "list_time.time3": updatedData };
  } else {
    updatedData["time"] = "15.00 - 17.00";
    updatedData["punch_in"] = new Date(
      splitDate[0],
      splitDate[1] - 1,
      splitDate[2],
      15,
      0,
      00,
      00
    );
    updatedData["punch_out"] = new Date(
      splitDate[0],
      splitDate[1] - 1,
      splitDate[2],
      17,
      00,
      00,
      00
    );
    updateRoomQuery = { "list_time.time4": updatedData };
  }

  let query = {
    room_name: room_name,
    date: date,
  };

  await roomModel.findOneAndUpdate(
    query,
    { $set: updateRoomQuery },
    { new: true },
    async (err, doc) => {
      if (err) console.log(err);
      broadcastToStudent(updatedData.enrolled, doc.room_id);
      broadcastToLecturer(updatedData.lecturer, doc.room_id);
      res.status(200).send({
        responseCode: 200,
        responseMessage: "Success update room information",
        data: [],
      });
    }
  );
};

// roomList
exports.roomList = async (req, res) => {
  const { room_name, date } = req.query;
  let splitDate = date.split("-");

  let query = {
    room_name: room_name,
    date: date,
  };

  await roomModel.findOne(query, { __v: 0 }, async (err, doc) => {
    if (err) logger(err);
    if (doc != null) {
      res.status(200).send({
        responseCode: 200,
        responseMessage: "Success",
        data: doc,
      });
    } else {
      await getNextSequenceValue("roomId").then(async (nextValue) => {
        const lecturer = new lecturerModel({
          lecturer_email: "",
          password: "",
          lecturer_name: "",
          history_room: [],
        });

        const detailTime1 = {
          time: "07.30 - 09.30",
          punch_in: new Date(
            splitDate[0],
            splitDate[1] - 1,
            splitDate[2],
            7,
            30,
            00,
            00
          ),
          punch_out: new Date(
            splitDate[0],
            splitDate[1] - 1,
            splitDate[2],
            9,
            30,
            00,
            00
          ),
          status: {
            status: false,
            status_message: "Available",
            start_at: "",
            dismiss_at: new Date(
              splitDate[0],
              splitDate[1] - 1,
              splitDate[2],
              9,
              30,
              00,
              00
            ).toLocaleString(),
          },
          enrolled: [],
          lecturer: lecturer,
          subject: "",
        };
        const detailTime2 = {
          time: "10.00 - 12.00",
          punch_in: new Date(
            splitDate[0],
            splitDate[1] - 1,
            splitDate[2],
            10,
            0,
            00,
            00
          ),
          punch_out: new Date(
            splitDate[0],
            splitDate[1] - 1,
            splitDate[2],
            12,
            0,
            00,
            00
          ),
          status: {
            status: false,
            status_message: "Available",
            start_at: "",
            dismiss_at: new Date(
              splitDate[0],
              splitDate[1] - 1,
              splitDate[2],
              12,
              0,
              00,
              00
            ).toLocaleString(),
          },
          enrolled: [],
          lecturer: lecturer,
          subject: "",
        };
        const detailTime3 = {
          time: "12.30 - 14.30",
          punch_in: new Date(
            splitDate[0],
            splitDate[1] - 1,
            splitDate[2],
            12,
            30,
            00,
            00
          ),
          punch_out: new Date(
            splitDate[0],
            splitDate[1] - 1,
            splitDate[2],
            14,
            30,
            00,
            00
          ),
          status: {
            status: false,
            status_message: "Available",
            start_at: "",
            dismiss_at: new Date(
              splitDate[0],
              splitDate[1] - 1,
              splitDate[2],
              14,
              30,
              00,
              00
            ).toLocaleString(),
          },
          enrolled: [],
          lecturer: lecturer,
          subject: "",
        };
        const detailTime4 = {
          time: "15.00 - 17.00",
          punch_in: new Date(
            splitDate[0],
            splitDate[1] - 1,
            splitDate[2],
            15,
            0,
            00,
            00
          ),
          punch_out: new Date(
            splitDate[0],
            splitDate[1] - 1,
            splitDate[2],
            17,
            30,
            00,
            00
          ),
          status: {
            status: false,
            status_message: "Available",
            start_at: "",
            dismiss_at: new Date(
              splitDate[0],
              splitDate[1] - 1,
              splitDate[2],
              17,
              30,
              00,
              00
            ).toLocaleString(),
          },
          enrolled: [],
          lecturer: lecturer,
          subject: "",
        };
        const newRoom = new roomModel({
          _id: nextValue,
          room_id: nextValue + "-" + room_name,
          room_name: room_name,
          date: date,
          list_time: {
            time1: detailTime1,
            time2: detailTime2,
            time3: detailTime3,
            time4: detailTime4,
          },
        });

        await newRoom.save(async (err, doc) => {
          if (err) console.log(err);
          res.status(200).send({
            responseCode: 200,
            responseMessage: "Success",
            data: doc,
          });
        });
      });
    }
  });
};

// roomfind
exports.roomHistory = async (req, res) => {
  const { student_id, lecturer_email, date } = req.query;

  let orQuery;
  let andQuery;

  if (student_id) {
    orQuery = [
      { "list_time.time1.enrolled.student.student_id": student_id },
      { "list_time.time2.enrolled.student.student_id": student_id },
      { "list_time.time3.enrolled.student.student_id": student_id },
      { "list_time.time4.enrolled.student.student_id": student_id },
    ];
  }

  if (lecturer_email) {
    orQuery = [
      { "list_time.time1.lecturer.lecturer_email": lecturer_email },
      { "list_time.time2.lecturer.lecturer_email": lecturer_email },
      { "list_time.time3.lecturer.lecturer_email": lecturer_email },
      { "list_time.time4.lecturer.lecturer_email": lecturer_email },
    ];
  }

  await roomModel.find(
    date == ""
      ? { $or: orQuery }
      : { $and: [{ date: date }, { $or: orQuery }] },
    { __v: 0 },
    (err, doc) => {
      if (err) logger(err);
      res.status(200).send({
        responseCode: 200,
        responseMessage: "Success",
        data: doc != null ? doc : [],
      });
    }
  );
};
