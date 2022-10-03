const mongoose = require("mongoose");

const user = new mongoose.Schema({
    firstName: String,
    LastName: String,
    people: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Person",
        },
    ],
});

const User = mongoose.model("User", user);

module.exports = User;
