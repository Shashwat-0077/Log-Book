const mongoose = require("mongoose");

let person = mongoose.Schema({
    name: {
        type: String,
        unique: true,
    },
    payTotal: Number,
    takeTotal: Number,

    pays: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item",
        },
    ],

    takes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item",
        },
    ],
});

let Person = mongoose.model("Person", person);

module.exports = Person;
