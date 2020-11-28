const express = require("express");
const router = express.Router();

const Lecturer = require("../../controller/lecturer");

router.post("/", Lecturer.lecturerDeleteData);

module.exports = router;
