const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();

app.set("view engine", "ejs");
const PORT = 3000;
const client = new MongoClient(process.env.MONGODB_URI);

async function startServer() {
    try {
        await client.connect();
        console.log("Connected to MongoDB Atlas!");
        const db = client.db("taskTracker");
        const tasksCollection = db.collection("tasks");
        console.log("Database:", db.databaseName);
        console.log("Collection:", tasksCollection.collectionName);
        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    } 
    catch (error) {
        console.error("Connection failed:", error);
    }
}

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/add", (req, res) => {
    res.render("add-task");
});

app.get("/", async (req, res) => {
    try {
        const db = client.db("taskTracker");
        const tasksCollection = db.collection("tasks");
        const tasks = await tasksCollection.find().toArray();
        res.render("index", { tasks });
    } 
    catch (error) {
        console.error(error);
        res.status(500).send("Error fetching tasks");
    }
});

app.post("/add", async (req, res) => {
    const db = client.db("taskTracker");
    const tasksCollection = db.collection("tasks");
    await tasksCollection.insertOne({
        title: req.body.title,
        description: req.body.description,
        date: req.body.date,
        time: req.body.time,
        status: req.body.status
    });
    res.redirect("/");
});

//GET /edit/:id route   ( Click Edit -> GET /edit/:id -> Find task using _id -> Show edit form -> Submit )
app.get("/edit/:id", async (req, res) => {
    const db = client.db("taskTracker");
    const tasksCollection = db.collection("tasks");
    const task = await tasksCollection.findOne({
        _id: new ObjectId(req.params.id)
    });
    res.render("edit-task", { task });
});

//the UPDATE route ( POST /edit/:id -> updateOne() -> MongoDB Atla -> Redirect / )
app.post("/edit/:id", async (req, res) => {
    const db = client.db("taskTracker");
    const tasksCollection = db.collection("tasks");
    await tasksCollection.updateOne(
        {
            _id: new ObjectId(req.params.id)
        },
        {
            $set: {
                title: req.body.title,
                description: req.body.description,
                date: req.body.date,
                time: req.body.time,
                status: req.body.status
            }
        }
    );
    res.redirect("/");
});

//DELETE route
app.post("/delete/:id", async (req, res) => {
    const db = client.db("taskTracker");
    const tasksCollection = db.collection("tasks");
    await tasksCollection.deleteOne({
        _id: new ObjectId(req.params.id)
    });
    res.redirect("/");
});
startServer();