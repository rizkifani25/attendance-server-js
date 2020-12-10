const express = require("express");
const router = express.Router();

const Room = require("../../controller/room");

router.post("/", Room.roomHistory);

module.exports = router;
