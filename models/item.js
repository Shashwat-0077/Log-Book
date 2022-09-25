const mongoose = require("mongoose");

const item = new mongoose.Schema({
    name: String,
    price: Number,
});

const Item = mongoose.model("Item", item);

module.exports = Item;
