const express = require("express");
const router = express.Router();

const Student = require("../../controller/student");

router.post("/", Student.studentLogin);

module.exports = router;
