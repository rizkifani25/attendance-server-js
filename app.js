const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const log = require('morgan');
const { logger } = require('./service/logger');
const mongoose = require('mongoose');
const endpoint = require('./service/endpoint');
const cors = require('cors');

const router = express.Router();
const timeModel = require('./models/time');
const studentModel = require('./models/student');

// Admin
const lecturerRegisterRouter = require('./routes/lecturer/register');
const lecturerListRouter = require('./routes/lecturer/list');
const lecturerDeleteDataRouter = require('./routes/lecturer/delete');

const studentRegisterRouter = require('./routes/student/register');
const studentListRouter = require('./routes/student/list');
const studentDeleteDataRouter = require('./routes/student/delete');

const roomRegisterRouter = require('./routes/room/register');
const roomListRouter = require('./routes/room/list');

// Lecturer
const lecturerLoginRouter = require('./routes/lecturer/login');
const lecturerUpdateDataRouter = require('./routes/lecturer/update');

// Student
const studentLoginRouter = require('./routes/student/login');
const studentUpdateDataRouter = require('./routes/student/update');
const studentRoomHistoryRouter = require('./routes/student/history');
const studentAttendRouter = require('./routes/student/attend');

// Room
const roomHistoryRouter = require('./routes/room/history');

const app = express();

app.use(
    cors({
        origin: '*'
    })
);

require("dotenv").config();

mongoose
    .connect(
        process.env.ATTENDACE_DB_MONGO,
        {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
        }
    )
    .then(console.log('DB connected'))
    .catch(err => logger(error));

app.use(log('dev'));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Admin
app.use(endpoint.LECTURER_REGISTER, lecturerRegisterRouter);
app.use(endpoint.LECTURER_LIST, lecturerListRouter);
app.use(endpoint.LECTURER_DELETE, lecturerDeleteDataRouter);

app.use(endpoint.STUDENT_REGISTER, studentRegisterRouter);
app.use(endpoint.STUDENT_LIST, studentListRouter);
app.use(endpoint.STUDENT_DELETE, studentDeleteDataRouter);

app.use(endpoint.ROOM_REGISTER, roomRegisterRouter);
app.use(endpoint.ROOM_DETAIL, roomListRouter);

// Lecturer
app.use(endpoint.LECTURER_LOGIN, lecturerLoginRouter);
app.use(endpoint.LECTURER_UPDATE_DATA, lecturerUpdateDataRouter);

// Student
app.use(endpoint.STUDENT_LOGIN, studentLoginRouter);
app.use(endpoint.STUDENT_UPDATE_DATA, studentUpdateDataRouter);
app.use(endpoint.STUDENT_ROOM_HISTORY, studentRoomHistoryRouter);
app.use(endpoint.STUDENT_ATTEND, studentAttendRouter);

// Room
app.use(endpoint.ROOM_HISTORY, roomHistoryRouter);

// TEST
app.use('/test', async (req, res, next) => {
    let student = new studentModel({
        _id: new mongoose.Types.ObjectId(),
        student_id: '001201700038',
        student_name: 'Rizki Fani',
        password: 'fani25',
        batch: '2017',
        major: 'IT',
        history_room: [
            { roomId: '44-B101' },
            { roomId: '45-B101' },
            { roomId: '46-B101' }
        ],
    });

    let response = new timeModel();
    response.status = true;
    response.subject = 'CGA';
    response.lecturer = 'Fani';
    response.enrolled = [
        student
    ];

    res.status(200).send(response);
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.json({
        message: '404 Not found'
    });
});

module.exports = app;
