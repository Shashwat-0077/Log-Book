const mongoose = require("mongoose");

const debtor = new mongoose.Schema({
    name: String,
    total: Number,
    items: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item",
        },
    ],
});

const Debtor = mongoose.model("Debtor", debtor);

module.exports = Debtor;
