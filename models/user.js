const mongoose = require("mongoose");

const user = new mongoose.Schema({
    username: String,
    people: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Person",
        },
    ],
});

const User = mongoose.model("User", user);

module.exports = User;
