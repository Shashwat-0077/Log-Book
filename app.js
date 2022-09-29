const mongoose = require("mongoose");
const express = require("express");
const methodOverride = require("method-override");
const morgan = require("morgan");
const ejsMate = require("ejs-mate");
const path = require("path");

const Debtor = require("./models/debtor");
const Creditor = require("./models/creditor");
const Item = require("./models/item");

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

app.use(morgan("dev"));

app.use(methodOverride("_method"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", async (req, res, next) => {
    const creds = await Creditor.find({}, { total: 1, name: 1 });
    const debts = await Debtor.find({}, { total: 1, name: 1 });
    let credTotal = 0;
    let debtTotal = 0;
    let names = [];

    for (let cred of creds) {
        names.push(cred.name);
        credTotal += cred.total;
    }
    for (let debt of debts) {
        names.push(debt.name);
        debtTotal += debt.total;
    }

    names = names.filter((name, index) => names.indexOf(name) === index);

    res.render("home", {
        credTotal: credTotal,
        debtTotal: debtTotal,
        names: names,
    });
});

app.get("/person", async (req, res, next) => {
    let name = req.query.name;

    const pay = await Creditor.find({ name: name }).populate({
        path: "items",
        options: {
            sort: { price: "asc" },
        },
    });

    const take = await Debtor.find({ name: name }).populate({
        path: "items",
        options: {
            sort: { price: "asc" },
        },
    });

    res.render("personInfo", { pay: pay[0], take: take[0], name: name });
});

app.get("/pays", async (req, res, next) => {
    const creditors = await Creditor.find()
        .populate({
            path: "items",
            options: {
                sort: { price: "asc" },
            },
        })
        .sort({ total: "desc" });

    res.render("details", { people: creditors, title: "Pay" });
});

app.get("/takes", async (req, res, next) => {
    const debtors = await Debtor.find()
        .populate({
            path: "items",
            options: {
                sort: { price: "asc" },
            },
        })
        .sort({ total: "desc" });

    res.render("details", { people: debtors, title: "Take" });
});

app.listen(8080, () => {
    console.log("Meet you at 5050");
});
