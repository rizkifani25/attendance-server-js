const express = require("express");
const router = express.Router();

const Room = require("../../controller/room");

router.post("/", Room.roomList);

module.exports = router;
