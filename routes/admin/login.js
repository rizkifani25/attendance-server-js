const express = require("express");
const router = express.Router();

const Admin = require("../../controller/admin");

router.post("/", Admin.adminLogin);

module.exports = router;
