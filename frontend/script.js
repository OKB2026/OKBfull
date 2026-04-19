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
async function showResult() {
  const container = document.getElementById("quiz");

  container.innerHTML = `
    <h2>Finished!</h2>
    <p>Your score: ${score} / ${questions.length}</p>
    <button onclick="restartQuiz()">Restart</button>
  `;

  localStorage.setItem("lastScore", score);

  const { data } = await supabaseClient.auth.getUser();

  let name = "Anonymous";

  if (data.user) {
    name = data.user.email; // auto use email
  } else {
    name = (prompt("Enter your name:") || "").trim() || "Anonymous";
  }

  saveScore(name, score);
  loadLeaderboard();
}

  
  // ✅ create Supabase client (correct way)
const supabaseClient = supabase.createClient(
  "https://jhrrnseoixdyxyhknsyk.supabase.co",
  "sb_publishable_qQ5lJfA2poQ6vo0q9YrQ5Q_o6PK3Kes"
);



// ✅ load leaderboard
async function loadLeaderboard() {
  const { data, error } = await supabaseClient
    .from("scores")
    .select("*")
    .order("score", { ascending: false })
    .limit(5);

  if (error) return console.error(error);

  const list = document.getElementById("leaderboard");
  if (!list) return;

  list.innerHTML = "";

  data.forEach(item => {
    const li = document.createElement("li");
    li.innerText = `${item.name}: ${item.score}`;
    list.appendChild(li);
  });
}
// SIGN UP
async function signUp() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await supabaseClient.auth.signUp({
    email,
    password,
  });

  if (error) alert(error.message);
  else alert("Check your email to confirm!");
}

// LOGIN
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) alert(error.message);
  else {
    alert("Logged in!");
    checkUser();
  }
}

// LOGOUT
async function logout() {
  await supabaseClient.auth.signOut();
  checkUser();
}
async function checkUser() {
  const { data } = await supabaseClient.auth.getUser();

  const status = document.getElementById("userStatus");

  if (data.user) {
    status.innerText = "Logged in as: " + data.user.email;
  } else {
    status.innerText = "Not logged in";
  }
}
checkUser();
// ✅ save score
async function saveScore(name, score) {
  const { data: userData } = await supabaseClient.auth.getUser();

  if (!userData.user) {
    alert("Please login first!");
    return;
  }

  const { error } = await supabaseClient
    .from("scores")
    .insert([
      {
        name,
        score,
        user_id: userData.user.id,
      },
    ]);

  if (error) console.error(error);
}

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
loadLeaderboard();