const express = require("express");
const router = express.Router();

const Lecturer = require("../../controller/lecturer");

router.post("/", Lecturer.lecturerUpdateData);

module.exports = router;
