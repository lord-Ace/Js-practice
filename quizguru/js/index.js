// ===========================
// CONSTANTS
// ===========================
const STORAGE_KEY = 'quizUser';
const LAST_FORM_INDEX = 2;
const LAST_QUESTION_INDEX = 19;
const BASE_PATH = './questions/';
const POINTS_PER_QUESTION = 5;
let answerdQuestions = 0
let questionsPassed = 0

// ===========================
// STATE MANAGEMENT
// ===========================
const gameState = {
  name: '',
  difficulty: '',
  duration: {
    minutes: 0,
    seconds: 0
  },
  questionPath: null,
  currentQuestionIndex: 0,
  points: 0,
  questions: null,
  answeredCurrentQuestion: false
};

const timerState = {
  minutes: 0,
  seconds: 0,
  intervalId: null,
  isRunning: false
};

// ===========================
// DOM ELEMENT CACHE
// ===========================
const elements = {
  forms: null,
  dialog: null,
  beginButton: null,
  timerDisplay: null,
  score: null,
  response: null,
  questionsDisplay: null,
  questionBox: null,
  questionContainer: null,
  optionsContainer: null,
  nextButton: null,
  quizEnd: null,
  retryQuiz: null,
  newQuiz: null
};

// ===========================
// INITIALIZATION
// ===========================
function init() {
  // Cache all DOM elements
  cacheElements();
  
  // Validate required elements exist
  if (!validateDOM()) {
    console.error('Required DOM elements not found');
    return;
  }
  
  // Load saved user data (don't clear storage!)
  loadUserData();
  
  // Setup event listeners
  setupFormHandlers();
  setupBeginButtonHandler();
  
  // Show initial form
  showInitialForm();
}

// Cache all DOM elements at startup
function cacheElements() {
  elements.forms = document.querySelectorAll('.data');
  elements.dialog = document.getElementById('dialog');
  elements.beginButton = document.getElementById('begin');
  elements.timerDisplay = document.getElementById('timer');
  elements.questionsDisplay = document.getElementById('stage');
  elements.questionContainer = document.getElementById('question');
  elements.questionBox = document.getElementById('question-box')
  elements.response = document.getElementById('response')
  elements.nextButton = document.getElementById('nextQuestion');
  elements.score = document.getElementById('score');
  elements.quizEnd = document.getElementById('quizEnd');
  elements.retryQuiz = document.getElementById('retry');
  elements.newQuiz = document.getElementById('newQuiz');
  
  // Note: optionsContainer will be queried fresh each time we need it
}

// Validate that all required DOM elements exist
function validateDOM() {
  const optionsCheck = document.querySelectorAll('.option');
  
  return (
    elements.forms?.length > 0 &&
    elements.dialog &&
    elements.beginButton &&
    elements.timerDisplay &&
    elements.questionsDisplay &&
    elements.questionContainer &&
    optionsCheck?.length > 0 &&
    elements.nextButton &&
    elements.score &&
    elements.quizEnd
  );
}

// Load user data from localStorage
function loadUserData() {
  try {
    const savedUser = localStorage.getItem(STORAGE_KEY);
    if (savedUser) {
      gameState.name = savedUser.trim();
    }
  } catch (error) {
    console.warn('localStorage not available:', error);
  }
}

// Determine and show the appropriate initial form
function showInitialForm() {
  // localStorage.clear()
  const startIndex = gameState.name ? 1 : 0;
  
  if (elements.forms[startIndex]) {
    elements.forms[startIndex].classList.add('active');
  }
}

// ===========================
// FORM HANDLING
// ===========================
function setupFormHandlers() {
  elements.forms.forEach((form, index) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      handleFormSubmission(form, index);
    });
  });
}

function handleFormSubmission(form, currentIndex) {
  // Remove active class from current form
  form.classList.remove('active');
  
  // Process form data
  processFormData(form);
  
  // Navigate to next step
  navigateToNextStep(currentIndex, LAST_FORM_INDEX);
}

function processFormData(form) {
  const formData = new FormData(form);
  
  formData.forEach((value, fieldName) => {
    const trimmedValue = String(value).trim();
    
    switch (fieldName) {
      case 'name':
        gameState.name = trimmedValue;
        saveUserToStorage(trimmedValue);
        break;
      
      case 'difficulty':
        gameState.difficulty = trimmedValue;
        gameState.questionPath = `${BASE_PATH}${trimmedValue}.json`;
        break;
      
      case 'minutes':
      case 'seconds':
        gameState.duration[fieldName] = parseInt(trimmedValue, 10) || 0;
        break;
    }
  });
}

function saveUserToStorage(userName) {
  try {
    localStorage.setItem(STORAGE_KEY, userName);
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
}

function navigateToNextStep(currentIndex, finalIndex) {
  const nextIndex = currentIndex + 1;
  
  if (nextIndex <= finalIndex) {
    // Show next form
    if (elements.forms[nextIndex]) {
      elements.forms[nextIndex].classList.add('active');
    }
  } else {
    // All forms completed - show dialog and load questions
    elements.questionContainer.textContent = 'loading Questions'
    showSummaryDialog();
  }
}

// ===========================
// DIALOG & QUESTION LOADING
// ===========================
async function showSummaryDialog() {
  updateDialogContent()
  // Load questions BEFORE showing dialog
  try {
    await loadQuestions(gameState.questionPath);
    
    // Show dialog after questions are loaded
    if (elements.dialog.showModal) {
      elements.dialog.showModal();
    } else {
      elements.dialog.setAttribute('open', '');
    }
  } catch (error) {
    alert(`Failed to load questions: ${error.message}`);
    console.error('Question loading error:', error);
  }
}

function updateDialogContent() {
  // Find or create elements to display the data
  const nameEl = elements.dialog.querySelector('[data-summary="name"]');
  const difficultyEl = elements.dialog.querySelector('[data-summary="difficulty"]');
  const durationEl = elements.dialog.querySelector('[data-summary="duration"]');
  
  if (nameEl) nameEl.textContent = gameState.name;
  if (difficultyEl) difficultyEl.textContent = gameState.difficulty;
  if (durationEl) {
    durationEl.textContent = `${gameState.duration.minutes}m ${gameState.duration.seconds}s`;
  }
}

async function loadQuestions(filePath) {
  if (!filePath) {
    throw new Error('No question file path specified');
  }
  
  try {
    const response = await fetch(filePath);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    gameState.questions = await response.json();
    
    // Validate questions structure
    if (!Array.isArray(gameState.questions) || gameState.questions.length === 0) {
      throw new Error('Invalid questions format');
    }
    
    console.log(`Loaded ${gameState.questions.length} questions`);
  } catch (error) {
    throw new Error(`Failed to load questions: ${error.message}`);
  }
}

// ===========================
// GAME START & TIMER
// ===========================
function setupBeginButtonHandler() {
  elements.beginButton.addEventListener('click', startGame);
}

function startGame() {
  // Close dialog
  elements.dialog.close();
  
  // Reset game state
  resetGameState();
  
  // Initialize timer from configuration
  timerState.minutes = gameState.duration.minutes;
  timerState.seconds = gameState.duration.seconds;
  
  // Show quiz interface
  elements.questionsDisplay.classList.add('active');
  
  // Display first question
  displayCurrentQuestion();
  
  // Start countdown
  startTimer();
  
  // Setup next button handler (only once)
  setupNextButtonHandler();
}

function resetGameState() {
  gameState.currentQuestionIndex = 0;
  gameState.points = 0;
  gameState.answeredCurrentQuestion = false;
  
  elements.score.textContent = `Points: 0`;
  elements.nextButton.textContent = 'Next Question';
}

function startTimer() {
  if (timerState.isRunning) return;
  
  timerState.isRunning = true;
  updateTimerDisplay();
  
  timerState.intervalId = setInterval(tick, 1000);
}

function stopTimer() {
  if (timerState.intervalId !== null) {
    clearInterval(timerState.intervalId);
    timerState.intervalId = null;
  }
  timerState.isRunning = false;
}

function tick() {
  timerState.seconds--;
  
  // Handle minute rollover
  if (timerState.seconds < 0) {
    timerState.seconds = 59;
    timerState.minutes--;
  }
  
  // Check if timer is complete
  if (timerState.minutes < 0) {
    stopTimer();
    handleTimerComplete();
    return;
  }
  
  // Update display
  updateTimerDisplay();
}

function updateTimerDisplay() {
  if (!elements.timerDisplay) return;
  
  const formattedMinutes = String(timerState.minutes).padStart(2, '0');
  const formattedSeconds = String(timerState.seconds).padStart(2, '0');
  
  elements.timerDisplay.textContent = `Time left: ${formattedMinutes}:${formattedSeconds}`;
}

function handleTimerComplete() {
  console.log('Quiz timer expired!');
  endQuiz();
}

// ===========================
// QUESTION DISPLAY (FIXED!)
// ===========================
function displayCurrentQuestion() {
  const currentIndex = gameState.currentQuestionIndex;
  const question = gameState.questions[currentIndex];
  
  // Reset answered state for new question
  gameState.answeredCurrentQuestion = false;
  
  // Display question text
  elements.questionContainer.textContent = 
    `${currentIndex + 1}. ${question.question}`;
  
  // Display options with FRESH DOM query
  displayOptions(question, currentIndex);
  
  // Update next button text
  updateNextButtonText();
}

function displayOptions(question, questionIndex) {
  // ✅ CRITICAL FIX: Query fresh NodeList each time
  const optionElements = document.querySelectorAll('.option');
  
  elements.response.classList.remove('correct', 'wrong');
  elements.questionBox.classList.remove('correct', 'wrong');
  optionElements.forEach((option, optionIndex) => {
    // Set option text
    option.textContent = question.options[optionIndex];
    
    // Remove any previous styling
    option.classList.remove('correct', 'wrong', 'disabled');
    
    // Store question and option index as data attributes
    option.dataset.questionIndex = questionIndex;
    option.dataset.optionIndex = optionIndex;
  });
  
  // Remove old event listeners and add new ones using event delegation
  // This is more efficient than adding individual listeners
  setupOptionClickHandlers();
}

// ✅ NEW: Event delegation pattern for options
let optionClickHandler = null;

function setupOptionClickHandlers() {
  // Remove existing handler if present
  if (optionClickHandler) {
    elements.questionsDisplay.removeEventListener('click', optionClickHandler);
  }
  
  // Create new handler with current question context
  optionClickHandler = (event) => {
    const option = event.target.closest('.option');
    
    if (!option) return;
    
    // Prevent multiple answers
    if (gameState.answeredCurrentQuestion) return;
    
    // Get indices from data attributes
    const questionIndex = parseInt(option.dataset.questionIndex);
    const optionIndex = parseInt(option.dataset.optionIndex);
    
    // Validate we're answering the current question
    if (questionIndex !== gameState.currentQuestionIndex) return;
    
    handleOptionClick(questionIndex, optionIndex);
  };
  
  // Add single delegated listener to parent
  elements.questionsDisplay.addEventListener('click', optionClickHandler);
}

function handleOptionClick(questionIndex, optionIndex) {
  // Prevent multiple answers
  if (gameState.answeredCurrentQuestion) return;
  
  gameState.answeredCurrentQuestion = true;
  
  // Validate answer
  validateAnswer(questionIndex, optionIndex, elements.response);
  
  // Disable all options visually
  const optionElements = document.querySelectorAll('.option');
  optionElements.forEach(option => {
    option.classList.add('disabled');
  });
}

function validateAnswer(questionIndex, optionIndex, feedback) {
  const question = gameState.questions[questionIndex];
  const isCorrect = optionIndex === question.correct;
  
  // Get fresh option elements
  const optionElements = document.querySelectorAll('.option');
  
  // Visual feedback on the clicked option
  optionElements[optionIndex].classList.add(
    isCorrect ? 'correct' : 'wrong'
  );
  feedback.classList.add(isCorrect ? 'correct' : 'wrong')
  elements.questionBox.classList.add(isCorrect ? 'correct' : 'wrong')
  feedback.textContent = isCorrect ? 'correct ✔️' : 'wrong ❌️'
  answerdQuestions++
  
  if (isCorrect) {
    gameState.points += POINTS_PER_QUESTION;
    elements.score.textContent = `Points: ${gameState.points}`;
    questionsPassed++
  } else {
    optionElements[question.correct].classList.add('correct');
  }
}

function setupNextButtonHandler() {
  // Remove any existing listener by cloning
  const newButton = elements.nextButton.cloneNode(true);
  elements.nextButton.parentNode.replaceChild(newButton, elements.nextButton);
  elements.nextButton = newButton;
  
  // Add single listener
  elements.nextButton.addEventListener('click', handleNextQuestion);
}

function handleNextQuestion() {
  gameState.currentQuestionIndex++;
  
  if (gameState.currentQuestionIndex <= LAST_QUESTION_INDEX) {
    displayCurrentQuestion();
  } else {
    endQuiz();
  }
}

function updateNextButtonText() {
  if (gameState.currentQuestionIndex === LAST_QUESTION_INDEX) {
    elements.nextButton.textContent = 'Finish Quiz';
  } else {
    elements.nextButton.textContent = 'Next Question';
  }
}

// QUIZ END
function endQuiz() {
  stopTimer();
  
  // Remove option click handler
  if (optionClickHandler) {
    elements.questionsDisplay.removeEventListener('click', optionClickHandler);
    optionClickHandler = null;
  }
  
  elements.questionsDisplay.classList.remove('active');
  elements.quizEnd.classList.add('active');
  
  // Display final score
  displayFinalScore();
}

function displayFinalScore() {
  const finalScoreElement = elements.quizEnd.querySelector('#finalScore');
  const numberAnswered = elements.quizEnd.querySelector('#answered');
  const numberPassed = elements.quizEnd.querySelector('#passed');
  const numberfailed = elements.quizEnd.querySelector('#failed');
  const analyses = elements.quizEnd.querySelector('#analysis');
  if (finalScoreElement) {
    let totalPossible = 0
    setInterval(pee, 100)
    function pee(){
    const percentage = Math.round((totalPossible / 100) * 100);
    finalScoreElement.textContent = `${totalPossible} (${percentage}%)`;
      if(totalPossible != gameState.points){
        totalPossible++
      }else{
        clearInterval()
      }
    }
    numberAnswered.textContent = `Number of Questions Answered: ${answerdQuestions}`
    numberPassed.textContent = `Number of Questions Passed: ${questionsPassed}`
    numberfailed.textContent = `Number of Questions Failed: ${(LAST_QUESTION_INDEX+1) - questionsPassed}`
    elements.newQuiz.addEventListener('click', ()=>{location.reload()})
    elements.retryQuiz.addEventListener('click', retake)
    analyses.textContent = analysis(gameState.points)
  }
}

function analysis(score){
  if (score <= 25){
    return 'Your Score is Very Low'
  }else if(score <= 49){
    return 'Your Made Below Average'
  }else if (score == 50){
    return 'You Hit The Mid-point Mark'
  }else if(score <= 99){
    return 'You Hit The Mid-point Mark'
  }else{
    return 'You Had a Perfect Score'
  }
}
function retake(){
  elements.quizEnd.classList.remove('active')
  showSummaryDialog();
}
// CLEANUP
function cleanup() {
  stopTimer();
  
  // Remove option click handler if exists
  if (optionClickHandler && elements.questionsDisplay) {
    elements.questionsDisplay.removeEventListener('click', optionClickHandler);
  }
}

// EVENT LISTENERS
document.addEventListener('DOMContentLoaded', init);
window.addEventListener('beforeunload', cleanup);