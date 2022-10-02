const mongoose = require("mongoose");
const express = require("express");
const methodOverride = require("method-override");
const morgan = require("morgan");
const ejsMate = require("ejs-mate");
const favicon = require("serve-favicon");
const path = require("path");

const User = require("./models/user");
const Person = require("./models/person");
const Item = require("./models/item");
const detectError = require("./utils/detectError");

const USER_ID = "6339a327eb2d4e47efc9d67f";

mongoose
    .connect("mongodb://localhost:27017/logBook")
    .then(() => {
        console.log("DB is connected");
    })
    .catch((err) => {
        console.log("ERROR : ", err);
    });

const app = express();

app.engine("ejs", ejsMate);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "templates"));

app.use(express.static(path.join(__dirname, "static")));

app.use(favicon(path.join(__dirname, "static/images/favicon.ico")));

app.use(morgan("dev"));

app.use(methodOverride("_method"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get(
    "/",
    detectError(async (req, res, next) => {
        const user = await User.findById(USER_ID).populate("people");

        const people = user.people;

        let names = people.map((person) => person.name);

        let totalPay = 0;
        let totalTake = 0;

        for (let person of people) {
            totalPay += person.payTotal;
            totalTake += person.takeTotal;
        }

        res.render("home", {
            credTotal: totalPay,
            debtTotal: totalTake,
            names: names,
        });
    })
);

app.get(
    "/person",
    detectError(async (req, res, next) => {
        let name = req.query.name;

        let person;
        try {
            person = await User.aggregate([
                {
                    $match: {
                        _id: mongoose.Types.ObjectId(USER_ID),
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
                    $project: {
                        person: {
                            $first: {
                                $filter: {
                                    input: "$people",
                                    cond: { $eq: ["$$this.name", name] },
                                },
                            },
                        },
                    },
                },
                {
                    $replaceRoot: {
                        newRoot: "$person",
                    },
                },
                {
                    $lookup: {
                        from: "items",
                        localField: "pays",
                        foreignField: "_id",
                        as: "pays",
                    },
                },
                {
                    $lookup: {
                        from: "items",
                        localField: "takes",
                        foreignField: "_id",
                        as: "takes",
                    },
                },
                {
                    $unwind: "$pays",
                },
                {
                    $sort: {
                        "pays.price": 1,
                    },
                },
                {
                    $group: {
                        _id: "$_id",
                        name: {
                            $first: "$name",
                        },
                        takes: {
                            $first: "$takes",
                        },
                        payTotal: {
                            $first: "$payTotal",
                        },
                        takeTotal: {
                            $first: "$takeTotal",
                        },
                        pays: {
                            $push: "$pays",
                        },
                    },
                },
                {
                    $unwind: "$takes",
                },
                {
                    $sort: {
                        "takes.price": 1,
                    },
                },
                {
                    $group: {
                        _id: "$_id",
                        name: {
                            $first: "$name",
                        },
                        pays: {
                            $first: "$pays",
                        },
                        payTotal: {
                            $first: "$payTotal",
                        },
                        takeTotal: {
                            $first: "$takeTotal",
                        },
                        takes: {
                            $push: "$takes",
                        },
                    },
                },
            ]);
        } catch (err) {
            if (err.name === "MongoServerError") {
                let user = await User.findById(USER_ID, {
                    people: 1,
                }).populate("people");

                let names = user.people.map((person) => person.name);

                return res.render("allNames", { names, names });
            } else {
                next(err);
            }
        }

        res.render("personInfo", {
            person: person[0],
        });
    })
);

app.get(
    "/pays",
    detectError(async (req, res, next) => {
        const people = await User.aggregate([
            {
                $match: { _id: mongoose.Types.ObjectId(USER_ID) },
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
                $project: {
                    people: {
                        $filter: {
                            input: "$people",
                            cond: { $ne: ["$$this.payTotal", 0] },
                        },
                    },
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
                $lookup: {
                    from: "items",
                    localField: "pays",
                    foreignField: "_id",
                    as: "pays",
                },
            },
            {
                $unwind: "$pays",
            },
            {
                $sort: {
                    "pays.price": -1,
                },
            },
            {
                $group: {
                    _id: "$_id",
                    name: {
                        $first: "$name",
                    },
                    pays: {
                        $push: "$pays",
                    },
                    total: {
                        $first: "$payTotal",
                    },
                },
            },
            {
                $sort: { total: -1 },
            },
        ]);

        res.render("details", { people: people, title: "Pay" });
    })
);

app.get(
    "/takes",
    detectError(async (req, res, next) => {
        const people = await User.aggregate([
            {
                $match: { _id: mongoose.Types.ObjectId(USER_ID) },
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
                $project: {
                    people: {
                        $filter: {
                            input: "$people",
                            cond: { $ne: ["$$this.takeTotal", 0] },
                        },
                    },
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
                $lookup: {
                    from: "items",
                    localField: "takes",
                    foreignField: "_id",
                    as: "takes",
                },
            },
            {
                $unwind: "$takes",
            },
            {
                $sort: {
                    "takes.price": -1,
                },
            },
            {
                $group: {
                    _id: "$_id",
                    name: {
                        $first: "$name",
                    },
                    takes: {
                        $push: "$takes",
                    },
                    total: {
                        $first: "$takeTotal",
                    },
                },
            },
            {
                $sort: { total: -1 },
            },
        ]);

        res.render("details", { people: people, title: "Takes" });
    })
);

app.post(
    "/:path/edit/:personId/:itemId",
    detectError(async (req, res, next) => {
        let { path, personId, itemId } = req.params;
        let { name, price } = req.body;

        let item = await Item.findById(itemId);

        item.name = name;
        item.price = price;
        item.save();

        let person;
        if (path == "pays") {
            person = await Creditor.findById(personId).populate("items");
        } else if (path == "takes") {
            person = await Debtor.findById(personId).populate("items");
        }

        person.total = 0;
        for (let item of person.items) {
            person.total += item.price;
        }
        person.save();

        res.redirect(`/${path}`);
    })
);

app.post(
    "/person/:path/edit/:personId/:itemId",
    detectError(async (req, res, next) => {
        let { path, personId, itemId } = req.params;
        let { name, price } = req.body;

        let item = await Item.findById(itemId);

        item.name = name;
        item.price = price;
        item.save();

        let person;
        if (path == "pays") {
            person = await Creditor.findById(personId).populate("items");
        } else if (path == "takes") {
            console.log(personId);
            person = await Debtor.findById(personId).populate("items");
        }

        console.log(path, person);

        person.total = 0;
        for (let item of person.items) {
            person.total += item.price;
        }
        person.save();

        res.redirect(`/person?name=${person.name}`);
    })
);
app.all("*", (req, res, next) => {
    res.render("404");
});

app.listen(80, () => {
    console.log("Meet you at 80");
});
