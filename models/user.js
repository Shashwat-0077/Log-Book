const mongoose = require("mongoose");

const user = new mongoose.Schema({});

const User = mongoose.model("user", user);

module.exports = User;
