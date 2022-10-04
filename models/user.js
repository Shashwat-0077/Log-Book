const mongoose = require("mongoose");
const passLocalMongo = require("passport-local-mongoose");

const user = new mongoose.Schema({
    firstName: String,
    lastName: String,
    people: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Person",
        },
    ],
});

user.plugin(passLocalMongo);

const User = mongoose.model("User", user);

module.exports = User;
