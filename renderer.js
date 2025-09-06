let workDuration = 25 * 60;
let shortBreak = 5 * 60;
let longBreak = 15 * 60;
let pomoCycles = 4;
let tasks = [];

// uncomment for testing 
// let workDuration = 5;
// let shortBreak = 3
// let longBreak = 10;
// let pomoCycles = 4;

let timeLeft = workDuration;
let currentMode = "work";
let completedSessions = 0;

let timerRunning = false;
let intervalId = null;

/*** TIMER ***/

function startTimer() {
    const toggleButton = document.getElementById("toggleButton");
    timerRunning = true;
    toggleButton.textContent = "Pause";

    const endTime = Date.now() + timeLeft * 1000;

    intervalId = setInterval(() => {
        const now = Date.now();
        timeLeft = Math.round((endTime - now) / 1000);
        displayTimeLeft(timeLeft);

        if (timeLeft <= 0) {
            clearInterval(intervalId);
            timerRunning = false;
            document.title = "Time's up!";
            toggleButton.textContent = "Start";

            // Handle end-of-phase logic
            if (currentMode === "work") {
                completedSessions++;
                if (completedSessions % pomoCycles === 0) {
                    currentMode = "longBreak";
                    timeLeft = longBreak;
                    completedSessions = 0;
                } else {
                    currentMode = "shortBreak";
                    timeLeft = shortBreak;
                }
            } else {
                currentMode = "work";
                timeLeft = workDuration;
                updateRoundCounter();
            }

            updateModeLabel();
            alarmSound.play();

            if (currentMode === "work") {
                showCustomAlert("Time to focus! Click ok to start working.", startTimer);
            } else {
                showCustomAlert("Time for a break! Click ok to start!", startTimer);
            }
        }
    }, 1000);
}

function toggleTimer() {
    const toggleButton = document.getElementById("toggleButton");

    if (timerRunning) {
        clearInterval(intervalId);
        timerRunning = false;
        toggleButton.textContent = "Start";
    } else {
        startTimer();
    }
}

function startNextPhase() {
    startTimer();
}

// Reset function 
function resetTimer() {
    if (!confirm("Are you sure you want to reset the timer?")){
        return;
    }
    clearInterval(intervalId);
    timerRunning = false;
    timeLeft = currentMode === "work" ? workDuration
            : currentMode === "shortBreak" ? shortBreak
            : longBreak;
    
    displayTimeLeft(timeLeft);
    document.title = "Pomodoro timer";
    
    document.getElementById("toggleButton").textContent = "Start";
}

// Display time left function 
function displayTimeLeft(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formatted = `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    document.querySelector(".pomodoro__time").textContent = formatted;
    document.title = formatted;
}

function updateRoundCounter() {
    const roundDisplay = document.querySelector(".pomodoro__round");
    const currentRound = completedSessions % pomoCycles;
    roundDisplay.textContent = `Round ${currentRound + 1} of ${pomoCycles}`;
}

document.getElementById("toggleButton").addEventListener("click", toggleTimer);
document.getElementById("resetButton").addEventListener("click", resetTimer);
updateTaskDisplay();

/*** ALARM SOUND ***/
const alarmSound = new Audio('assets/tones/timer-done.mp3');

/*** SLIDERS ***/
let workMinutes = 25;
let breakMinutes = 5;

const toggleSettings = document.getElementById('toggle-settings');
const sliderContainer = document.getElementById('slider-container');
const workSlider = document.getElementById('work-slider');
const breakSlider = document.getElementById('break-slider');
const cycleSlider = document.getElementById('cycle-slider');
const workValue = document.getElementById('work-value');
const breakValue = document.getElementById('break-value');
const cycleValue = document.getElementById('cycle-value');
const saveButton = document.getElementById('save-settings');
const timerDisplay = document.querySelector('.pomodoro__time');

workSlider.addEventListener('input', () =>{
    workValue.textContent = workSlider.value;
});

breakSlider.addEventListener('input', ()=> {
    breakValue.textContent = breakSlider.value;
})

toggleSettings.addEventListener('click', () => {
    const isHidden = sliderContainer.classList.contains('hidden');
    if (isHidden) {
        sliderContainer.classList.remove('hidden');
        sliderContainer.style.display = 'block';
    } else {
        sliderContainer.classList.add('hidden');
    }
});

cycleSlider.addEventListener('input', () => {
    cycleValue.textContent = cycleSlider.value;
});

document.getElementById("open-task-list").addEventListener("click", () => {
    const taskList = document.getElementById('task-list');
    taskList.classList.remove('hidden');
    taskList.style.display = 'flex'; 
});

document.getElementById("close-task-list").addEventListener("click", () => {
    const taskList = document.getElementById('task-list');
    const inputfield = document.getElementById('task-input-field'); 
    taskList.classList.add('hidden');
    inputfield.classList.add('hidden');
});

// Save button for sliders
saveButton.addEventListener('click', () => {
    if (!confirm("Changing the timer settings will reset the timer. Are you sure you want to continue?")) 
        return;

    const newWorkMinutes = parseInt(workSlider.value, 10);
    const newBreakMinutes = parseInt(breakSlider.value, 10);
    const newCycleCount = parseInt(cycleSlider.value, 10);

    workDuration = newWorkMinutes * 60;
    shortBreak = newBreakMinutes * 60;
    pomoCycles = newCycleCount;

 
    if (timerRunning) {
        clearInterval(intervalId);
        timerRunning = false;
        document.getElementById("toggleButton").textContent = "Start";
    }

    if (currentMode === "work") {
        timeLeft = workDuration;
    } else {
        timeLeft = shortBreak;
    }

    displayTimeLeft(timeLeft);
    updateRoundCounter();
    sliderContainer.classList.add('hidden');
});

// CUSTOM ALERT BOX 
function showCustomAlert(message, callback) {
    const alertBox = document.getElementById('custom-alert');
    const alertMessage = document.getElementById('alert-message');
    const okButton = document.getElementById('alert-ok');

    alertMessage.textContent = message;
    alertBox.classList.remove('hidden');

    function closeAlert() {
        alarmSound.pause();
        alarmSound.currentTime = 0;

        alertBox.classList.add('hidden');
        okButton.removeEventListener('click', closeAlert);
        callback(); // starts the next timer phase 
    }

    okButton.addEventListener('click', closeAlert);
}

function updateModeLabel() {
    const modeLabel = document.querySelector(".pomodoro__mode");

    if (currentMode === "work") {
        modeLabel.textContent = "work";
    } else if (currentMode === "shortBreak") {
        modeLabel.textContent = "break";
    } else if (currentMode === "longBreak") {
        modeLabel.textContent = "long break";
    }
}

// TASK LIST //

function updateTaskDisplay(){
    const getTasks = document.getElementById('task-container');
    if (tasks.length === 0) {
       getTasks.innerHTML = '<p>No tasks yet! you should add some, lazy bones!</p>';
    } else {
    let taskHTML = '';
    tasks.forEach(task => {
        taskHTML += `<div class="task-item">${task.text}</div>`;
    });
    getTasks.innerHTML = taskHTML;
    }    
}

document.getElementById("add-task-button").addEventListener("click", ()=> {
    const inputfield = document.getElementById("task-input-field");
    if (inputfield.classList.contains('hidden')) {
        inputfield.classList.remove('hidden');
    } else {
        addTask();
    }
});

function addTask() {
    const inputField = document.getElementById('task-input-field');
    const taskText = inputField.value.trim();

    if (taskText.trim() !== '') {
        tasks.push({
            text: taskText,
            completed: false
        });

        updateTaskDisplay();
        inputField.value = '';
        inputField.classList.add('hidden');
    }

}