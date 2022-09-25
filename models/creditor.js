const mongoose = require("mongoose");

const creditor = new mongoose.Schema({
    name: String,
    total: Number,
    items: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item",
        },
    ],
});

const Creditor = mongoose.model("Creditor", creditor);

module.exports = Creditor;
