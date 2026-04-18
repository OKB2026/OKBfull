let questions = [];
let currentQuestion = 0;
let score = 0;

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

// Restart quiz
function restartQuiz() {
  currentQuestion = 0;
  score = 0;
  showQuestion();
}