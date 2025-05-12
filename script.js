// * Pages
const homePage = document.querySelector(`.home-page`);
const gamePage = document.querySelector(`.game-page`);
const resultPage = document.querySelector(`.result-page`);

// * Interactable Elements
const options = document.querySelectorAll(`.option`);
const submitBtn = document.querySelector(`.submit-btn`);
const skipBtn = document.querySelector(`.skip-btn`);

// * Info Displays
const questionCount = document.querySelector(`.question-count`);
const questionDisplay = document.querySelector(`.question`);

// * Result Displays
const resultMsg = document.querySelector(`.result-msg`);
const accuracyDisplay = document.querySelector(`.accuracy`);
const timerDisplay = document.querySelector(`.timer`);
const resultTime = document.querySelector(`.time`);

// * Game Variables
let running = false;
let questionIndex = 9;
let score = 0;
let answered = 0;
let timeElapsed = 0;
let timerID;

let quizData = [];

document.addEventListener(`DOMContentLoaded`, () => {
  homePage.classList.add(`active-page`);

  options.forEach((option) => {
    option.addEventListener(`click`, () => {
      options.forEach((option) => {
        option.classList.remove(`selected`);
      });
      option.classList.add(`selected`);
    });
  });

  skipBtn.addEventListener(`click`, () => {
    nextQuestion();
  });

  submitBtn.addEventListener(`click`, () => {
    const selectedOption = Array.from(options).find((option) => option.classList.contains("selected"));
    if (!selectedOption) {
      console.error(`No options selected`);
      return;
    }
    if (selectedOption.innerHTML === quizData[questionIndex].correct_answer) {
      selectedOption.classList.add(`correct`);
      selectedOption.classList.remove(`incorrect`);
      score++;
      answered++;
    } else {
      selectedOption.classList.remove(`correct`);
      selectedOption.classList.add(`incorrect`);
      answered++;
    }
    nextQuestion();
  });
});

timerID = setInterval(() => {
  if (!running) return;
  timeElapsed++;
  timerDisplay.innerHTML = `${getTime()[0]}:${getTime()[1].padStart(2, "0")}`;

  if (resultPage.classList.contains(`active-page`)) {
    clearInterval(timerID);
    running = false;
    return;
  }
}, 1000);

async function startGame() {
  try {
    running = true;
    const difficulty = document.querySelector(`.difficulty-selector`).value;
    const rawData = await getData(difficulty);
    const { results: data } = rawData; //  data[i] = { question, correct_answer, incorrect_answers }
    quizData = data;
    updateGame();

    homePage.classList.remove(`active-page`);
    gamePage.classList.add(`active-page`);
  } catch (error) {
    console.error(`Failed to start game`, error);
    displayErrorMessage("Failed to load quiz data. Please try again later.");
  }
}

async function getData(difficulty) {
  const apiUrl = `https://opentdb.com/api.php?amount=10&category=9&difficulty=${difficulty}&type=multiple`;
  const response = await fetch(apiUrl);
  // prettier-ignore
  if (!response.ok)
    throw Error(`Could not fetch data`);
  return await response.json();
}

function updateGame() {
  // * result page updates
  if (questionIndex > 9) {
    let accuracy = 0;
    if (answered > 0) accuracy = Math.round((score / answered) * 100);
    resultMsg.innerHTML = `YOU SCORED ${score} OUT OF 10!`;
    accuracyDisplay.innerHTML = `Accuracy: ${accuracy}%`;
    resultTime.innerHTML = `Time Taken: ${getTime()[0]} minutes ${getTime()[1]} seconds`;
    return;
  }

  // * game page updates
  questionCount.innerHTML = `Question: ${questionIndex + 1} of 10`;
  questionDisplay.innerHTML = quizData[questionIndex].question;

  const answers = [quizData[questionIndex].correct_answer, ...quizData[questionIndex].incorrect_answers];
  const shuffledAnswers = shuffleArray(answers);

  options.forEach((option, index) => {
    option.innerHTML = shuffledAnswers[index];
  });
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function nextQuestion() {
  if (questionIndex === 9) {
    setTimeout(() => {
      gamePage.classList.remove(`active-page`);
      resultPage.classList.add(`active-page`);
    }, 1000);
  }

  options.forEach((option) => {
    option.disabled = true;
    submitBtn.disabled = true;
    skipBtn.disabled = true;
  });

  setTimeout(() => {
    questionIndex++;
    updateGame(quizData);
    options.forEach((option) => {
      option.classList.remove(`correct`, `incorrect`, `selected`);
      option.disabled = false;
    });
    submitBtn.disabled = false;
    skipBtn.disabled = false;
  }, 1000);
}

function getTime() {
  const seconds = Math.floor(timeElapsed % 60).toString();
  const minutes = Math.floor(timeElapsed / 60).toString();

  return [minutes, seconds];
}

document.querySelector(`.reset-btn`).addEventListener(`click`, () => {
  questionIndex = 0;
  score = 0;
  answered = 0;
  timeElapsed = 0;
  running = false;
  clearInterval(timerID);

  gamePage.classList.remove(`active-page`);
  resultPage.classList.remove(`active-page`);
  homePage.classList.add(`active-page`);
});
