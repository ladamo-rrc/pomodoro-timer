let workDuration = 25 * 60;
let shortBreak = 5 * 60;
let longBreak = 15 * 60;
let pomoCycles = 4;

let timeLeft = workDuration;
let currentMode = "work";
let completedSessions = 0;

let timerRunning = false;
let intervalId = null;

/*** TIMER ***/

// Timer function // 
function startTimer() {
    if (timerRunning) {
        return;
    }

    timerRunning = true;
    intervalId = setInterval(() => {
        timeLeft--;
        displayTimeLeft(timeLeft);

        if (timeLeft <= 0) {
            clearInterval(intervalId);
            timerRunning = false;
            document.title = "Time's up!";

            if (currentMode === "work") {
                completedSessions++;

                if (completedSessions % pomoCycles === 0) {
                    currentMode = "longBreak";
                    timeLeft = longBreak;
                } else {
                    currentMode = "shortBreak";
                    timeLeft = shortBreak;
                }
            } else {
                currentMode = "work";
                timeLeft = workDuration;
            }

            alarmSound.play();
            let nextLabel = currentMode === "work" ? "work" : "break";
            setTimeout(() => {
                alert(`Time for ${nextLabel}! Click OK to begin.`);
                startTimer();
            }, 100);
        }
    }, 1000);
}

// pause function // 
function pauseTimer(){
    if (timerRunning) {
        clearInterval(intervalId);
        timerRunning = false;
    }
}

// Reset // 
function resetTimer() {
    clearInterval(intervalId);
    timerRunning = false;
    timeLeft = currentMode === "work" ? workDuration
            : currentMode === "shortBreak" ? shortBreak
            : longBreak;
    
    displayTimeLeft(timeLeft);
    document.title = "Pomodoro timer";
}

// Display time left // 
function displayTimeLeft(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formatted = `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    document.querySelector(".pomodoro__time").textContent = formatted;
    document.title = formatted;
}

document.getElementById("startButton").addEventListener("click", startTimer);
document.getElementById("pauseButton").addEventListener("click", pauseTimer);
document.getElementById("resetButton").addEventListener("click", resetTimer);

/*** ALARM SOUND ***/

const alarmSound = new Audio('assets/tones/marimba-alert.mp3');

function switchTimer() {
    alarmSound.play(); 
    if (isWorking) {
      currentTime = breakTime;
      isWorking = false;
    } else {
      currentTime = workTime;
      isWorking = true;
    }
    updateDisplay();
  }

  /*** SLIDERS ***/

let workMinutes = 25;
let breakMinutes = 5;

const toggleButton = document.getElementById('toggle-settings');
const sliderContainer = document.getElementById('slider-container');
const workSlider = document.getElementById('work-slider');
const breakSlider = document.getElementById('break-slider');
const workValue = document.getElementById('work-value');
const breakValue = document.getElementById('break-value');
const saveButton = document.getElementById('save-settings');
const timerDisplay = document.querySelector('.pomodoro__time');

workSlider.addEventListener('input', () =>{
    workValue.textContent = workSlider.value;
});

breakSlider.addEventListener('input', ()=> {
    breakValue.textContent = breakSlider.value;
})

toggleButton.addEventListener('click', () => {
    const isHidden = sliderContainer.style.display === 'none';
    sliderContainer.style.display = isHidden ? 'block' : 'none';
});

saveButton.addEventListener('click', () => {
    const newWorkMinutes = parseInt(workSlider.value, 10);
    const newBreakMinutes = parseInt(breakSlider.value, 10);

    workDuration = newWorkMinutes * 60;
    shortBreak = newBreakMinutes * 60;

    if (!timerRunning) {
        timeLeft = currentMode === "work" ? workDuration
            : currentMode === "shortBreak" ? shortBreak
            : longBreak;
        displayTimeLeft(timeLeft);
    }

    sliderContainer.style.display = 'none';
});
