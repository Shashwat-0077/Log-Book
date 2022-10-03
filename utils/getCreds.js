const User = require("../models/user");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

async function getCreds(USER_ID) {
    let creds = await User.aggregate([
        {
            $match: {
                _id: ObjectId(USER_ID),
            },
        },
        {
            $lookup: {
                from: "people",
                localField: "people",
                foreignField: "_id",
                as: "people",
            },
        },
        {
            $unwind: "$people",
        },
        {
            $replaceRoot: {
                newRoot: "$people",
            },
        },
        {
            $project: {
                name: "$name",
                _id: {
                    $toString: "$_id",
                },
            },
        },
    ]);

    return creds;
}

module.exports = getCreds;
