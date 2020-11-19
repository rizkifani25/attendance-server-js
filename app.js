const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const endpoint = require('./service/endpoint');
const cors = require('cors');

// Admin
const adminLoginRouter = require('./routes/admin/login');
const adminRegisterRouter = require('./routes/admin/register');
const studentRegisterRouter = require('./routes/student/register');
const studentListRouter = require('./routes/student/list');
const studentDeleteDataRouter = require('./routes/student/delete');
const roomRegisterRouter = require('./routes/room/register');
const roomListRouter = require('./routes/room/list');

// Student
const studentLoginRouter = require('./routes/student/login');
const studentUpdateDataRouter = require('./routes/student/update');
const studentRoomHistoryRouter = require('./routes/student/history');
const studentAttendRouter = require('./routes/student/attend');

const app = express();

app.use(
    cors({
        origin: '*'
    })
);

mongoose
    .connect(
        'mongodb://localhost:27017/attendance',
        {
            useUnifiedTopology: true,
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false,
        }
    )
    .then(console.log('DB connected'))
    .catch(err => console.log(err));

app.use(logger('dev'));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Admin
app.use(endpoint.ADMIN_LOGIN, adminLoginRouter);
app.use(endpoint.ADMIN_REGISTER, adminRegisterRouter);
app.use(endpoint.STUDENT_REGISTER, studentRegisterRouter);
app.use(endpoint.STUDENT_LIST, studentListRouter);
app.use(endpoint.STUDENT_DELETE, studentDeleteDataRouter);
app.use(endpoint.ROOM_REGISTER, roomRegisterRouter);
app.use(endpoint.ROOM_DETAIL, roomListRouter);

// Student
app.use(endpoint.STUDENT_LOGIN, studentLoginRouter);
app.use(endpoint.STUDENT_UPDATE_DATA, studentUpdateDataRouter);
app.use(endpoint.STUDENT_ROOM_HISTORY, studentRoomHistoryRouter);
app.use(endpoint.STUDENT_ATTEND, studentAttendRouter);

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
    res.json({});
});

module.exports = app;
