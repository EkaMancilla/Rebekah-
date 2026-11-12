const MAX_QUESTIONS = 10;

const storageKey = "mathQuestHistory";
const studentNameInput = document.getElementById("studentName");
const startButton = document.getElementById("startButton");
const beginQuizButton = document.getElementById("beginQuiz");
const restartQuizButton = document.getElementById("restartQuiz");
const questionCounter = document.getElementById("questionCounter");
const topicBadge = document.getElementById("topicBadge");
const questionText = document.getElementById("questionText");
const answerInput = document.getElementById("answerInput");
const submitAnswerButton = document.getElementById("submitAnswer");
const feedback = document.getElementById("feedback");
const quizShell = document.getElementById("quizShell");
const welcomeCard = document.getElementById("welcomeCard");
const scoreBars = document.getElementById("scoreBars");
const historyList = document.getElementById("historyList");
const overallScorePill = document.getElementById("overallScorePill");
const certificateSection = document.getElementById("certificateSection");
const certificateName = document.getElementById("certificateName");
const certificateScore = document.getElementById("certificateScore");
const certificateMessage = document.getElementById("certificateMessage");
const certificateStamp = document.getElementById("certificateStamp");
const confettiLayer = document.getElementById("confettiLayer");
const bestScoreStat = document.getElementById("bestScoreStat");
const averageStat = document.getElementById("averageStat");
const attemptsStat = document.getElementById("attemptsStat");
const downloadCertButton = document.getElementById("downloadCert");

let questions = [];
let currentQuestionIndex = 0;
let correctCount = 0;
let studentName = "Student";

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    month: "short",
    day: "numeric",
  });
}

function getHistory() {
  const saved = localStorage.getItem(storageKey);
  return saved ? JSON.parse(saved) : [];
}

function saveHistory(items) {
  localStorage.setItem(storageKey, JSON.stringify(items));
}

function updateDashboard() {
  const history = getHistory();
  const bestScore = history.length
    ? Math.max(...history.map((item) => item.score))
    : 0;
  const average = history.length
    ? Math.round(
        history.reduce((sum, item) => sum + item.percentage, 0) / history.length
      )
    : 0;

  bestScoreStat.textContent = `${bestScore}/10`;
  averageStat.textContent = `${average}%`;
  attemptsStat.textContent = String(history.length);
  overallScorePill.textContent = `${bestScore}/10`;

  renderHistoryPanel(history);
}

function renderHistoryPanel(history) {
  scoreBars.innerHTML = "";
  historyList.innerHTML = "";

  if (!history.length) {
    scoreBars.innerHTML = '<div class="score-empty">No scores yet. Start your first quiz!</div>';
    historyList.innerHTML = '<p class="empty-history">Your score history will show here.</p>';
    return;
  }

  const maxValue = Math.max(...history.map((item) => item.score), 1);

  history.slice(-6).forEach((entry) => {
    const wrap = document.createElement("div");
    wrap.className = "score-bar-wrap";

    const bar = document.createElement("div");
    bar.className = "score-bar";
    bar.style.height = `${(entry.score / maxValue) * 100}%`;

    const value = document.createElement("div");
    value.className = "score-bar-value";
    value.textContent = `${entry.score}/10`;

    const date = document.createElement("div");
    date.className = "score-bar-date";
    date.textContent = formatDate(entry.date);

    wrap.appendChild(value);
    wrap.appendChild(bar);
    wrap.appendChild(date);
    scoreBars.appendChild(wrap);
  });

  history
    .slice()
    .reverse()
    .forEach((entry) => {
      const item = document.createElement("div");
      item.className = "history-item";
      item.innerHTML = `
        <div>
          <strong>${entry.score}/10</strong>
          <span>${entry.percentage}% correct</span>
        </div>
        <span>${formatDate(entry.date)}</span>
      `;
      historyList.appendChild(item);
    });
}

function createQuestion() {
  const questionTemplates = [
    {
      type: "Addition",
      build: () => {
        const a = randomInt(15, 80);
        const b = randomInt(12, 70);
        return {
          text: `Solve: ${a} + ${b} = ?`,
          answer: a + b,
          correction: `Nice work! ${a} + ${b} = ${a + b}.`,
        };
      },
    },
    {
      type: "Subtraction",
      build: () => {
        const a = randomInt(40, 150);
        const b = randomInt(10, 80);
        const greater = Math.max(a, b);
        const smaller = Math.min(a, b);
        return {
          text: `Solve: ${greater} - ${smaller} = ?`,
          answer: greater - smaller,
          correction: `Almost there! ${greater} - ${smaller} = ${greater - smaller}.`,
        };
      },
    },
    {
      type: "Multiplication",
      build: () => {
        const a = randomInt(4, 12);
        const b = randomInt(3, 15);
        return {
          text: `Solve: ${a} × ${b} = ?`,
          answer: a * b,
          correction: `Remember: multiply the numbers together. ${a} × ${b} = ${a * b}.`,
        };
      },
    },
    {
      type: "Division",
      build: () => {
        const divisor = randomInt(2, 12);
        const quotient = randomInt(3, 12);
        const dividend = divisor * quotient;
        return {
          text: `Solve: ${dividend} ÷ ${divisor} = ?`,
          answer: quotient,
          correction: `You are close! ${dividend} ÷ ${divisor} = ${quotient}.`,
        };
      },
    },
    {
      type: "Square Root",
      build: () => {
        const root = randomInt(2, 16);
        const square = root * root;
        return {
          text: `Find the square root of ${square}.`,
          answer: root,
          correction: `Square root means “what number multiplied by itself gives ${square}?” It is ${root}.`,
        };
      },
    },
    {
      type: "Percent",
      build: () => {
        const percent = randomInt(10, 80);
        const number = randomInt(10, 200);
        return {
          text: `What is ${percent}% of ${number}?`,
          answer: Math.round((percent / 100) * number),
          correction: `To find a percentage, divide by 100 and multiply. ${percent}% of ${number} is ${Math.round((percent / 100) * number)}.`,
        };
      },
    },
    {
      type: "Conversion",
      build: () => {
        const value = randomInt(1, 9);
        const unit = [
          { label: "metres", target: 1000, current: 1, convert: (n) => n * 1000 },
          { label: "centimetres", target: 100, current: 1, convert: (n) => n * 100 },
          { label: "minutes", target: 60, current: 1, convert: (n) => n * 60 },
          { label: "kilograms", target: 1000, current: 1, convert: (n) => n * 1000 },
        ][randomInt(0, 3)];
        const from = value;
        const answer = unit.convert(from);
        return {
          text: `Convert ${from} ${unit.label} to the smaller unit.`,
          answer,
          correction: `Good thinking! ${from} ${unit.label} equals ${answer} in the smaller unit.`,
        };
      },
    },
    {
      type: "Ratio",
      build: () => {
        const a = randomInt(2, 12);
        const b = randomInt(2, 12);
        return {
          text: `If the ratio of boys to girls is ${a}:${b} and there are ${a * 2} boys, how many girls are there?`,
          answer: b * 2,
          correction: `Keep the ratio balanced. If boys are ${a} and girls are ${b}, then with ${a * 2} boys, there are ${b * 2} girls.`,
        };
      },
    },
    {
      type: "Fractions",
      build: () => {
        const numerator = randomInt(1, 9);
        const denominator = randomInt(2, 10);
        const whole = randomInt(2, 8);
        return {
          text: `What is ${numerator}/${denominator} of ${whole}?`,
          answer: Math.round((numerator / denominator) * whole),
          correction: `A fraction of a number means multiply. ${numerator}/${denominator} of ${whole} is ${Math.round((numerator / denominator) * whole)}.`,
        };
      },
    },
    {
      type: "Word Problem",
      build: () => {
        const price = randomInt(40, 180);
        const discount = randomInt(10, 30);
        const finalPrice = price - (price * discount) / 100;
        return {
          text: `A book costs KSh ${price}. It is discounted by ${discount}%. What is the new price?`,
          answer: Math.round(finalPrice),
          correction: `Use the discount amount first: ${discount}% of ${price} is ${Math.round((price * discount) / 100)}. New price: ${Math.round(finalPrice)}.`,
        };
      },
    },
  ];

  const template = questionTemplates[randomInt(0, questionTemplates.length - 1)];
  return template.build();
}

function setupQuestions() {
  questions = Array.from({ length: MAX_QUESTIONS }, () => {
    const q = createQuestion();
    return {
      type: q.type || "Math",
      text: q.text,
      answer: q.answer,
      correction: q.correction,
    };
  });
}

function showQuestion() {
  const currentQuestion = questions[currentQuestionIndex];
  questionCounter.textContent = `Question ${currentQuestionIndex + 1}`;
  topicBadge.textContent = currentQuestion.type;
  questionText.textContent = currentQuestion.text;
  answerInput.value = "";
  answerInput.focus();
  feedback.textContent = "";
  feedback.className = "feedback";
}

function submitAnswer() {
  if (!questions.length) return;

  const currentQuestion = questions[currentQuestionIndex];
  const userAnswer = Number(answerInput.value);

  if (answerInput.value.trim() === "" || Number.isNaN(userAnswer)) {
    feedback.textContent = "Please type an answer before checking.";
    feedback.className = "feedback bad";
    return;
  }

  if (userAnswer === currentQuestion.answer) {
    correctCount += 1;
    feedback.textContent = "Correct! Great job. Keep going!";
    feedback.className = "feedback good";
  } else {
    feedback.textContent = `Not quite. ${currentQuestion.correction}`;
    feedback.className = "feedback bad";
  }

  submitAnswerButton.disabled = true;
  answerInput.disabled = true;

  setTimeout(() => {
    currentQuestionIndex += 1;
    if (currentQuestionIndex < MAX_QUESTIONS) {
      showQuestion();
      submitAnswerButton.disabled = false;
      answerInput.disabled = false;
      return;
    }

    finishQuiz();
  }, 1200);
}

function finishQuiz() {
  const score = correctCount;
  const percentage = Math.round((score / MAX_QUESTIONS) * 100);
  const history = getHistory();

  const entry = {
    score,
    percentage,
    date: new Date().toISOString(),
  };

  history.push(entry);
  saveHistory(history);
  updateDashboard();

  const name = studentNameInput.value.trim() || "Student";
  certificateName.textContent = name;
  certificateScore.textContent = `${score}/${MAX_QUESTIONS}`;

  if (percentage >= 80) {
    certificateMessage.textContent = "Congratulations! You scored above 80% and showed excellent determination.";
    certificateStamp.textContent = "Excellent";
    certificateStamp.style.background = "linear-gradient(135deg, #dfffe9, #e5ffc8)";
    triggerConfetti();
  } else {
    certificateMessage.textContent = "You are learning and growing every day. Take a breath, try again, and keep going!";
    certificateStamp.textContent = "Keep Going";
    certificateStamp.style.background = "linear-gradient(135deg, #fff2be, #fde7b8)";
  }

  quizShell.classList.add("hidden");
  welcomeCard.classList.add("hidden");
  certificateSection.classList.remove("hidden");
  document.getElementById("certificate").scrollIntoView({ behavior: "smooth" });
}

function triggerConfetti() {
  const colors = ["#7bb8ff", "#d8f0ff", "#ffd6e5", "#ffecb2", "#9deede", "#a9b8ff"];

  for (let i = 0; i < 140; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.setProperty("--drift", `${(Math.random() - 0.5) * 220}px`);
    piece.style.animationDuration = `${3 + Math.random() * 2.8}s`;
    piece.style.transform = `rotate(${Math.random() * 200}deg)`;
    confettiLayer.appendChild(piece);

    setTimeout(() => {
      piece.remove();
    }, 5000);
  }
}

function beginQuiz() {
  studentName = studentNameInput.value.trim() || "Student";
  currentQuestionIndex = 0;
  correctCount = 0;
  setupQuestions();
  showQuestion();
  welcomeCard.classList.add("hidden");
  quizShell.classList.remove("hidden");
  submitAnswerButton.disabled = false;
  answerInput.disabled = false;
  answerInput.focus();
}

function restartQuiz() {
  certificateSection.classList.add("hidden");
  welcomeCard.classList.remove("hidden");
  answerInput.value = "";
  feedback.textContent = "";
  feedback.className = "feedback";
  questionCounter.textContent = "Question 1";
  topicBadge.textContent = "Addition";
  questionText.textContent = "Question text";
}

startButton.addEventListener("click", () => {
  document.getElementById("practice").scrollIntoView({ behavior: "smooth" });
  beginQuiz();
});

beginQuizButton.addEventListener("click", beginQuiz);
submitAnswerButton.addEventListener("click", submitAnswer);
answerInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    submitAnswer();
  }
});
restartQuizButton.addEventListener("click", restartQuiz);

downloadCertButton.addEventListener("click", () => {
  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <html>
      <head>
        <title>Certificate</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: #eef7ff;
            padding: 40px;
            color: #14345d;
          }
          .cert {
            max-width: 800px;
            margin: 0 auto;
            border: 3px solid #8cbfff;
            border-radius: 18px;
            background: white;
            padding: 32px;
            text-align: center;
          }
          h1 { font-size: 2.3rem; }
          h2 { font-size: 2.0rem; }
          .stamp { display: inline-block; margin-top: 10px; padding: 8px 18px; border-radius: 999px; background: #dfffe9; }
        </style>
      </head>
      <body>
        <div class="cert">
          <h1>Certificate of Completion</h1>
          <p>This certifies that</p>
          <h2>${studentNameInput.value || "Student"}</h2>
          <p>completed a 10-question math practice quiz with</p>
          <h2>${correctCount || 0}/10</h2>
          <div class="stamp">${(correctCount / MAX_QUESTIONS) * 100 >= 80 ? "Excellent" : "Keep Going"}</div>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
});

updateDashboard();
