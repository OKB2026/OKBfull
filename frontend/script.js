let questions = [];
let currentQuestion = 0;
let score = 0;
function finishQuiz() {
  localStorage.setItem("lastScore", score);
}

// Load JSON
fetch("questions.json")
  .then(res => res.json())
  .then(data => {
    questions = data;
    showQuestion();
  })
  .catch(err => console.error("Error loading JSON:", err));

// Show question
function showQuestion() {
  const q = questions[currentQuestion];

  const container = document.getElementById("quiz");

  container.innerHTML = `
    <h2>Question ${currentQuestion + 1}</h2>
    <p>${q.question}</p>
    <div id="answers">
      ${q.options
        .map(
          (opt, index) =>
            `<button onclick="selectAnswer(${index})">${opt}</button>`
        )
        .join("")}
    </div>
  `;
}

// Handle answer click
function selectAnswer(index) {
  const q = questions[currentQuestion];

  // Check if selected index is correct
  if (q.answer.includes(index)) {
    score++;
  }

  currentQuestion++;

  if (currentQuestion < questions.length) {
    showQuestion();
  } else {
    showResult();
  }
}

// Show final result
function showResult() {
  const container = document.getElementById("quiz");

  container.innerHTML = `
    <h2>Finished!</h2>
    <p>Your score: ${score} / ${questions.length}</p>
    <button onclick="restartQuiz()">Restart</button>
  `;
}
const name = prompt("Enter your name:");

fetch("https://okbfull.onrender.com/api/score", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ name, score })
});
fetch("https://okbfull.onrender.com/api/leaderboard")
  .then(res => res.json())
  .then(data => {
    const list = document.getElementById("leaderboard");

    data.slice(0, 5).forEach(item => {
      const li = document.createElement("li");
      li.innerText = `${item.name}: ${item.score}`;
      list.appendChild(li);
    });
  });
// Restart quiz
function restartQuiz() {
  currentQuestion = 0;
  score = 0;
  showQuestion();
}
const saved = localStorage.getItem("lastScore");
if (saved) {
  document.getElementById("score").innerText = "Last score: " + saved;
}
