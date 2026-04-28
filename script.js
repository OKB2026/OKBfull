console.log("TOP");
console.log("SCRIPT LOADED");

// ======================
// SUPABASE
// ======================
const supabaseClient = supabase.createClient(
  "https://jhrrnseoixdyxyhknsyk.supabase.co",
  "sb_publishable_qQ5lJfA2poQ6vo0q9YrQ5Q_o6PK3Kes"
);

// ======================
// VARIABLES
// ======================
let questions = [];
let pool = [];
let index = 0;
let score = 0;
let answered = false;
let wrongQuestions = JSON.parse(localStorage.getItem("wrongQuestions")) || [];

let userAnswers = [];
let timer;
let time = 0;
let isExamMode = false;

// ======================
// LOAD QUESTIONS
// ======================
fetch("https://okbfull.onrender.com/api/questions")
  .then(res => res.json())
  .then(data => {
    questions = data;
    buildTopics();
  });

// ======================
// MODES
// ======================
function startStudy() {
  isExamMode = false;
  pool = [...questions].sort(() => Math.random() - 0.5);
  startGame();
}

function startExam() {
  isExamMode = true;
  pool = [...questions].sort(() => Math.random() - 0.5).slice(0, 40);
  startTimer();
  startGame();
}

function startPractice() {
  if (wrongQuestions.length === 0) {
    alert("No mistakes yet 👍");
    return;
  }

  pool = questions.filter(q => wrongQuestions.includes(String(q.id)));
  startGame();
}

function startGame() {
  document.getElementById("menuPage").style.display = "none";
  document.getElementById("quizPage").style.display = "block";

  index = 0;
  score = 0;
  answered = false;
  userAnswers = new Array(pool.length).fill(null);

  render();
}
console.log("BEFORE goHome");
function goHome() {
  document.getElementById("menuPage").style.display = "block";
  document.getElementById("quizPage").style.display = "none";

  index = 0;
  score = 0;
  answered = false;
}
console.log("AFTER goHome");
// ======================
// RENDER
// ======================
function render() {
  const q = pool[index];
  if (!q) return finish();

  document.getElementById("question").innerText = q.question;

  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";

  q.options.forEach((opt, i) => {
    const label = document.createElement("label");
    label.className = "option";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = i;

    input.onchange = () => {
      let checked = [...document.querySelectorAll("#options input:checked")]
        .map(e => parseInt(e.value));

      userAnswers[index] = checked;
    };

    label.appendChild(input);
    label.appendChild(document.createTextNode(" " + opt));
    optionsDiv.appendChild(label);
  });

  updateHeader();
}

// ======================
// ANSWER
// ======================
function submitAnswer() {
  if (answered) return;

  const q = pool[index];

  const checked = [...document.querySelectorAll("#options input:checked")]
    .map(e => parseInt(e.value))
    .sort();

  const correct = [...q.answer].sort();

  if (JSON.stringify(checked) === JSON.stringify(correct)) {
    score++;
    alert("Correct!");
  } else {
    alert("Wrong!");

    if (!wrongQuestions.includes(String(q.id))) {
      wrongQuestions.push(String(q.id));
      localStorage.setItem("wrongQuestions", JSON.stringify(wrongQuestions));
    }
  }

  answered = true;
  updateHeader();
}

// ======================
// NAVIGATION
// ======================
function nextQuestion() {
  if (!answered) return alert("Answer first!");

  answered = false;
  index++;

  if (index < pool.length) render();
  else finish();
}

function prevQuestion() {
  if (index > 0) {
    index--;
    answered = false;
    render();
  }
}

// ======================
// HEADER
// ======================
function updateHeader() {
  document.getElementById("progress").innerText =
    (index + 1) + " / " + pool.length;

  document.getElementById("score").innerText =
    "Score: " + score;
}

// ======================
// FINISH
// ======================
async function finish() {
  stopTimer();

  document.getElementById("result").innerHTML  = `
    <h2>Finished!</h2>
    <p>${score} / ${pool.length}</p>
    <button onclick="location.reload()">Restart</button>
  `;

  const { data } = await supabaseClient.auth.getUser();

  let name = data.user ? data.user.email : prompt("Enter name") || "Anonymous";

  await saveScore(name, score);
  loadLeaderboard();
}

// ======================
// TIMER
// ======================
function startTimer() {
  time = 0;
  timer = setInterval(() => {
    time++;
    document.getElementById("timer").innerText =
      Math.floor(time / 60) + ":" + (time % 60).toString().padStart(2, "0");
  }, 1000);
}

function stopTimer() {
  clearInterval(timer);
  document.getElementById("timer").innerText = "";
}

// ======================
// AUTH
// ======================
async function signUp() {
  const email = emailInput();
  const password = passwordInput();

  const { error } = await supabaseClient.auth.signUp({ email, password });

  if (error) alert(error.message);
  else alert("Check email!");
}

async function login() {
  const email = emailInput();
  const password = passwordInput();

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

  if (error) alert(error.message);
  else {
    alert("Logged in!");
    checkUser();
  }
}

async function logout() {
  await supabaseClient.auth.signOut();
  checkUser();
}

async function checkUser() {
  const { data } = await supabaseClient.auth.getUser();
  document.getElementById("userStatus").innerText =
    data.user ? "Logged in as: " + data.user.email : "Not logged in";
}

checkUser();

// ======================
// HELPERS
// ======================
function emailInput() {
  return document.getElementById("email").value;
}

function passwordInput() {
  return document.getElementById("password").value;
}

// ======================
// LEADERBOARD
// ======================
async function loadLeaderboard() {
  const { data } = await supabaseClient
    .from("scores")
    .select("*")
    .order("score", { ascending: false })
    .limit(5);

  const list = document.getElementById("leaderboard");
  if (!list) return;

  list.innerHTML = "";
  data.forEach(item => {
    const li = document.createElement("li");
    li.innerText = `${item.name}: ${item.score}`;
    list.appendChild(li);
  });
}

loadLeaderboard();

// ======================
// TOPICS
// ======================
function buildTopics() {
  const topicsDiv = document.getElementById("topics");
  topicsDiv.innerHTML = "";

  ["CBS","HBS","MAIL","CARGO","SUPPLY","PERSONS"].forEach(topic => {
    const btn = document.createElement("button");
    btn.innerText = topic;
    btn.onclick = () => loadTopic(topic);
    topicsDiv.appendChild(btn);
  });
}

function loadTopic(topic) {
  pool = questions.filter(q => (q.topic || "").includes(topic));
  startGame();
}

// ======================
// RESET MISTAKES
// ======================
function resetMistakes() {
  localStorage.removeItem("wrongQuestions");
  wrongQuestions = [];
  alert("Cleared 👍");
}
window.goHome = goHome;
console.log("SCRIPT END");
console.log("goHome:", typeof window.goHome);