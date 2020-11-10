const express = require("express");
const router = express.Router();

const Room = require("../../controller/room");

router.post("/", Room.roomRegister);

module.exports = router;
