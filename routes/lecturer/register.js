const express = require("express");
const router = express.Router();

const Lecturer = require("../../controller/lecturer");

router.post("/", Lecturer.lecturerRegister);

module.exports = router;
