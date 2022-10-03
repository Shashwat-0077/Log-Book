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
const getCreds = require("./utils/getCreds");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const passLocal = require("passport-local");

const USER_ID = "633b08589cf2295bd24f304c";

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

const session_option = {
    secret: "thisWasSupposedToBeaSecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 3,
        maxAge: 1000 * 60 * 60 * 24 * 3,
    },
};
app.use(session(session_option));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new passLocal(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
});

app.get(
    "/",
    detectError(async (req, res, next) => {
        const user = await User.findById(USER_ID).populate("people");

        const people = user.people;

        const creds = await getCreds(USER_ID);

        let totalPay = 0;
        let totalTake = 0;

        for (let person of people) {
            totalPay += person.payTotal;
            totalTake += person.takeTotal;
        }

        res.render("home", {
            totalPay: totalPay,
            totalTake: totalTake,
            creds: creds,
        });
    })
);

app.get(
    "/person/:personId",
    detectError(async (req, res, next) => {
        let personId = req.params.personId;

        if (!mongoose.Types.ObjectId.isValid(personId)) {
            let creds = await getCreds(USER_ID);
            return res.render("allNames", { creds: creds });
        }

        let people = await User.aggregate([
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
                $unwind: "$people",
            },
            {
                $replaceRoot: {
                    newRoot: "$people",
                },
            },
            {
                $match: {
                    _id: mongoose.Types.ObjectId(personId),
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
                $unwind: {
                    path: "$pays",
                    preserveNullAndEmptyArrays: true,
                },
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
                    pays: {
                        $push: "$pays",
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
                },
            },
            {
                $unwind: {
                    path: "$takes",
                    preserveNullAndEmptyArrays: true,
                },
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
                    takes: {
                        $push: "$takes",
                    },
                    payTotal: {
                        $first: "$payTotal",
                    },
                    takeTotal: {
                        $first: "$takeTotal",
                    },
                },
            },
        ]);

        if (!people[0]) {
            let creds = await getCreds(USER_ID);
            return res.render("allNames", { creds: creds });
        }

        res.render("personInfo", {
            person: people[0],
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

app.all("*", (req, res, next) => {
    res.render("404");
});

app.listen(80, () => {
    console.log("Meet you at 80");
});
