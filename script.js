const homePage = document.querySelector(`.home-page`);
const gamePage = document.querySelector(`.game-page`);
const resultPage = document.querySelector(`.result-page`);

const options = document.querySelectorAll(`.option`);
const submitBtn = document.querySelector(`.submit-btn`);
const skipBtn = document.querySelector(`.skip-btn`);

const questionCount = document.querySelector(`.question-count`);
const questionDisplay = document.querySelector(`.question`);

const resultMsg = document.querySelector(`.result-msg`);
const accuracyDisplay = document.querySelector(`.accuracy`);
const timerDisplay = document.querySelector(`.time`);

let running = false;
let questionIndex = 0;
let score = 0;
let answered = 0;
let timeElapsed = 0;
let intervalId;

document.addEventListener(`DOMContentLoaded`, () => {
  homePage.classList.add(`active-page`);
});

async function startGame() {
  running = true;
  const difficulty = document.querySelector(`.difficulty-selector`).value;
  const rawData = await getData(difficulty);
  const { results: data } = rawData; //  data[i] = { question, correct_answer, incorrect_answers }
  updateGame(data);

  homePage.classList.remove(`active-page`);
  gamePage.classList.add(`active-page`);

  skipBtn.addEventListener(`click`, () => {
    nextQuestion(data);
  });

  submitBtn.addEventListener(`click`, () => {
    const selectedOption = Array.from(options).find((option) => option.classList.contains("selected"));
    if (!selectedOption) {
      console.error(`No options selected`);
      return;
    }
    if (selectedOption.innerHTML === data[questionIndex].correct_answer) {
      selectedOption.classList.add(`correct`);
      selectedOption.classList.remove(`incorrect`);
      score++;
      answered++;
    } else {
      selectedOption.classList.remove(`correct`);
      selectedOption.classList.add(`incorrect`);
      answered++;
    }
    nextQuestion(data);
  });
}

async function getData(difficulty) {
  const apiUrl = `https://opentdb.com/api.php?amount=10&category=9&difficulty=${difficulty}&type=multiple`;
  const response = await fetch(apiUrl);
  // prettier-ignore
  if (!response.ok)
    throw Error(`Could not fetch data`);
  return await response.json();
}

function updateGame(data) {
  if (questionIndex > 9) {
    let accuracy = 0;
    if (answered > 0) accuracy = Math.round((score / answered) * 100);
    resultMsg.innerHTML = `YOU SCORED ${score} OUT OF 10!`;
    accuracyDisplay.innerHTML = `Accuracy: ${accuracy}%`;
    timerDisplay.innerHTML = `Time Taken: ${Math.floor(timeElapsed / 60)} minutes ${timeElapsed % 60} seconds`;

    return;
  }
  questionDisplay.innerHTML = data[questionIndex].question;

  const answers = [data[questionIndex].correct_answer, ...data[questionIndex].incorrect_answers];
  const shuffledAnswers = shuffleArray(answers);

  options.forEach((option, index) => {
    option.innerHTML = shuffledAnswers[index];
  });

  questionCount.innerHTML = `Question: ${questionIndex + 1} of 10`;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

options.forEach((option) => {
  option.addEventListener(`click`, () => {
    options.forEach((option) => {
      option.classList.remove(`selected`);
    });
    option.classList.add(`selected`);
  });
});

function nextQuestion(data) {
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
    updateGame(data);
    options.forEach((option) => {
      option.classList.remove(`correct`, `incorrect`, `selected`);
      option.disabled = false;
    });
    submitBtn.disabled = false;
    skipBtn.disabled = false;
  }, 1000);
}

intervalId = setInterval(() => {
  if (!running) return;
  timeElapsed++;

  if (resultPage.classList.contains(`active-page`)) {
    clearInterval(intervalId);
  }
}, 1000);
