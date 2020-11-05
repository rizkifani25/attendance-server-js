const mongoose = require("mongoose");
const adminModel = require("../../models/admin");
const bcrypt = require("bcryptjs");

// adminLogin
exports.adminLogin = async (req, res) => {
    const { username, password } = req.query;

    const query = {
        username: username
    };

    await adminModel
        .findOne(query, { __v: 0, _id: 0 })
        .exec()
        .then(async data => {
            const isValidPass = await bcrypt.compare(password, data.password);
            if (!isValidPass) {
                res.status(200).send({
                    responseCode: 400,
                    responseMessage: "Wrong password",
                });
            } else {
                res.status(200).send({
                    responseCode: 200,
                    responseMessage: "Success",
                    data: {
                        username: data.username
                    }
                });
            }
        }).catch(err => {
            console.log(err);
            res.status(400).send({
                responseCode: 400,
                responseMessage: "Invalid admin login"
            });
        });
};

// adminRegister
exports.adminRegister = async (req, res) => {
    const { username, password } = req.query;

    const query = {
        username: username,
    };

    await adminModel
        .findOne(query)
        .exec()
        .then(async data => {
            if (data) {
                res.status(200).send({
                    responseCode: 200,
                    responseMessage: "Username for admin already exist"
                });
            } else {
                // Hashing password
                const saltedKey = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, saltedKey);

                const newAdmin = new adminModel({
                    _id: new mongoose.Types.ObjectId(),
                    username: username,
                    password: hashedPassword
                });

                newAdmin
                    .save()
                    .then(data => {
                        res.status(200).send({
                            responseCode: 200,
                            responseMessage: "Success",
                        });
                    }).catch(err => {
                        console.log(err);
                        res.status(400).send({
                            responseCode: 200,
                            responseMessage: "Server failed. Can't save data",
                        });
                    });
            }
        }).catch(err => {
            console.log(err);
            res.status(400).send({
                responseCode: 400,
                responseMessage: "Failed",
            });
        });
};
