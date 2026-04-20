let workDuration = 25 * 60;
let shortBreak = 5 * 60;
let longBreak = 15 * 60;
let pomoCycles = 4;

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let deleteMode = false;

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

/*** ALARM SOUND ***/
const alarmSound = new Audio('assets/tones/timer-done-2.mp3');


/*** TIMER ***/

function startTimer() {
    const toggleButton = document.getElementById("toggleButton");
    timerRunning = true;
    toggleButton.textContent = "Pause";

    const endTime = Date.now() + timeLeft * 1000;

    intervalId = setInterval(() => {
        const now = Date.now();
        timeLeft = Math.max(0, Math.round((endTime - now) / 1000));
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

function showCustomConfirm(message, onConfirm) {
    const alertBox = document.getElementById('custom-alert');
    const alertMessage = document.getElementById('alert-message');
    const okButton = document.getElementById('alert-ok');

    alertMessage.textContent = message;
    alertBox.classList.remove('hidden');

    function handleOk() {
        alertBox.classList.add('hidden');
        okButton.removeEventListener('click', handleOk);
        onConfirm();
    }

    okButton.addEventListener('click', handleOk);
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
document.getElementById("delete-task-button").addEventListener("click", toggleDeleteMode);
document.getElementById("delete-selected-tasks").addEventListener("click", deleteSelectedTasks);
updateTaskDisplay();

document.getElementById('task-container').addEventListener('change', function(event){
        if (event.target.type === 'checkbox' && deleteMode) {
            
            const checkedBoxes = document.querySelectorAll('#task-container input[type="checkbox"]:checked');
            const deleteButton = document.getElementById("delete-selected-tasks");

            if (checkedBoxes.length > 0) {
                deleteButton.disabled = false; 
            } else {
                deleteButton.disabled = true;
            }
        }
     })

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

/*** TASK LIST ***/

function updateTaskDisplay() {
    const container = document.getElementById('task-container');
    const deleteTaskButton = document.getElementById("delete-task-button");

    if (tasks.length === 0) {
        container.innerHTML = '<p>No tasks yet! you should add some, lazy bones!</p>';
        deleteTaskButton.classList.add('hidden');
        updateActiveTaskDisplay();
        return;
    }

    deleteTaskButton.classList.remove('hidden');

    const activeTasks = tasks.filter(t => !t.completed);
    const completedTasks = tasks.filter(t => t.completed);

    let html = '';

    activeTasks.forEach((task, i) => {
        const realIndex = tasks.indexOf(task);
        if (deleteMode) {
            html += `<div class="task-item">
                <input type="checkbox" id="task-checkbox-${realIndex}">
                ${task.text}
            </div>`;
        } else {
            html += `<div class="task-item">
                <input type="checkbox" class="complete-checkbox" data-index="${realIndex}">
                <span>${task.text}</span>
                <button class="pin-btn ${task.pinned ? 'pinned' : ''}" data-index="${realIndex}">.ᐟ(pin)</button>
            </div>`;
        }
    });

    if (completedTasks.length > 0) {
        html += `<p class="completed-header">Completed</p>`;
        completedTasks.forEach((task) => {
            const realIndex = tasks.indexOf(task);
            if (deleteMode) {
                html += `<div class="task-item completed">
                    <input type="checkbox" id="task-checkbox-${realIndex}">
                    ${task.text}
                </div>`;
            } else {
                html += `<div class="task-item completed">
                    <input type="checkbox" class="complete-checkbox" data-index="${realIndex}" checked>
                    <span>${task.text}</span>
                </div>`;
            }
        });
    }

    container.innerHTML = html;

    // attach complete checkbox listeners
    document.querySelectorAll('.complete-checkbox').forEach(cb => {
        cb.addEventListener('change', (e) => {
            const index = parseInt(e.target.dataset.index);
            tasks[index].completed = e.target.checked;
            if (tasks[index].completed) tasks[index].pinned = false;
            localStorage.setItem('tasks', JSON.stringify(tasks));
            updateTaskDisplay();
        });
    });

    // attach pin button listeners
    document.querySelectorAll('.pin-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            const alreadyPinned = tasks[index].pinned;
            tasks.forEach(t => t.pinned = false); // unpin all
            if (!alreadyPinned) tasks[index].pinned = true; // toggle
            localStorage.setItem('tasks', JSON.stringify(tasks));
            updateTaskDisplay();
        });
    });

    updateActiveTaskDisplay();
}

document.getElementById("add-task-button").addEventListener("click", ()=> {
    const inputfield = document.getElementById("task-input-field");
    console.log('hidden?', inputfield.classList.contains('hidden'), 'value:', inputfield.value, 'disabled?', inputfield.disabled);
    if (inputfield.classList.contains('hidden')) {
        inputfield.classList.remove('hidden');
        inputfield.focus();
    } else {
        addTask();
    }
});

function updateActiveTaskDisplay() {
    const activeDisplay = document.getElementById('active-task-display');
    const pinned = tasks.find(t => t.pinned && !t.completed);
    activeDisplay.textContent = pinned ? `★ ${pinned.text}` : '';
}

function addTask() {
    const inputField = document.getElementById('task-input-field');
    const taskText = inputField.value.trim();

    if (taskText !== '') {
        tasks.push({ text: taskText, completed: false });
        localStorage.setItem('tasks', JSON.stringify(tasks)); // <-- add this
        updateTaskDisplay();
        inputField.value = '';
        inputField.classList.add('hidden');
    } else {
        inputField.classList.add('hidden');
    }
}

function toggleDeleteMode(){
    deleteMode = !deleteMode;
    
    const deleteButton = document.getElementById("delete-task-button");
    const deleteSelectedButton = document.getElementById("delete-selected-tasks");
    const addTaskButton = document.getElementById("add-task-button"); // renamed

    if (deleteMode) {
        deleteButton.textContent = "cancel";
        deleteSelectedButton.classList.remove('hidden');
        deleteSelectedButton.disabled = true;
        addTaskButton.classList.add('hidden'); // renamed
    } else {
        deleteButton.textContent = "delete a task";
        deleteSelectedButton.classList.add('hidden');
        deleteSelectedButton.disabled = false;
        addTaskButton.classList.remove('hidden'); // renamed
    }

    updateTaskDisplay();
}

function deleteSelectedTasks() {
    let tasksToDelete = [];

    tasks.forEach((task, i) => {
        const checkbox = document.getElementById(`task-checkbox-${i}`);
        if (checkbox && checkbox.checked) {
            tasksToDelete.push(i);
        }
    });

    if (tasksToDelete.length >= 1) {
    const msg = tasksToDelete.length === 1 
        ? "Do you want to delete this task? i hope you finished it!"
        : "Do you want to delete these tasks? tsk tsk tsk...";
    
    showCustomConfirm(msg, () => {
        for (let i = 0; i < tasksToDelete.length; i++) {
            tasks.splice(tasksToDelete[i], 1);
        }
        localStorage.setItem('tasks', JSON.stringify(tasks));
        updateTaskDisplay();
        toggleDeleteMode();
    });
}
}

function showCustomConfirm(message, onConfirm) {
    const confirmBox = document.getElementById('custom-confirm');
    const confirmMessage = document.getElementById('confirm-message');
    const okButton = document.getElementById('confirm-ok');
    const cancelButton = document.getElementById('confirm-cancel');

    confirmMessage.textContent = message;
    confirmBox.classList.remove('hidden');

    function handleOk() {
        confirmBox.classList.add('hidden');
        okButton.removeEventListener('click', handleOk);
        cancelButton.removeEventListener('click', handleCancel);
        onConfirm();
    }

    function handleCancel() {
        confirmBox.classList.add('hidden');
        okButton.removeEventListener('click', handleOk);
        cancelButton.removeEventListener('click', handleCancel);
    }

    okButton.addEventListener('click', handleOk);
    cancelButton.addEventListener('click', handleCancel);
}