const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/questions", (req, res) => {
    const filePath = path.join(__dirname, "questions.json");
    const data = fs.readFileSync(filePath, "utf-8");
    res.json(JSON.parse(data));
});
app.post("/api/score", (req, res) => {
    const { name, score } = req.body;

    let data = [];

    const leaderboardPath = path.join(__dirname, "leaderboard.json");

    if (fs.existsSync(leaderboardPath)) {
        data = JSON.parse(fs.readFileSync(leaderboardPath));
    }

    data.push({ name, score });

    data.sort((a, b) => b.score - a.score);

    fs.writeFileSync(leaderboardPath, JSON.stringify(data, null, 2));

    res.json({ message: "Score saved" });
});
app.get("/api/leaderboard", (req, res) => {
    const leaderboardPath = path.join(__dirname, "leaderboard.json");

    if (!fs.existsSync(leaderboardPath)) {
        return res.json([]);
    }

    const data = JSON.parse(fs.readFileSync(leaderboardPath));
    res.json(data);
});
app.get("/", (req, res) => {
    res.send("Server works!");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});