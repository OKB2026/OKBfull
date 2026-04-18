const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());

app.get("/api/questions", (req, res) => {
    const filePath = path.join(__dirname, "questions.json");
    const data = fs.readFileSync(filePath, "utf-8");
    res.json(JSON.parse(data));
});

app.get("/", (req, res) => {
    res.send("Server works!");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});