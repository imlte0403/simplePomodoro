const timerDisplay = document.getElementById('timer');
const sessionText = document.getElementById('session-text');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const resetBtn = document.getElementById('reset-btn');
const sessionCountDisplay = document.getElementById('session-count');
const bgmBtn = document.getElementById('bgm-btn');
const notificationSound = document.getElementById('notification-sound');
const bgmSound = document.getElementById('bgm-sound');
const bgmSelect = document.getElementById('bgm-select');
const themeBtn = document.getElementById('theme-btn');

let timer;
let isWorkSession = true;
let workSessionCount = 0;
let timeInSeconds = 25 * 60;
let isBgmPlaying = false;

function updateTimerDisplay() {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateSessionCountDisplay() {
    sessionCountDisplay.textContent = `완료한 세션: ${workSessionCount}`;
}

function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
        timeInSeconds--;
        updateTimerDisplay();
        if (timeInSeconds <= 0) {
            clearInterval(timer);
            notificationSound.play();
            nextSession();
        }
    }, 1000);
    startBtn.classList.add('active');
    stopBtn.classList.remove('active');
}

function stopTimer() {
    clearInterval(timer);
    startBtn.classList.remove('active');
    stopBtn.classList.add('active');
}

function resetTimer() {
    clearInterval(timer);
    if (isWorkSession) {
        timeInSeconds = 25 * 60;
    } else {
        if (workSessionCount === 4) {
            timeInSeconds = 15 * 60;
        } else {
            timeInSeconds = 5 * 60;
        }
    }
    updateTimerDisplay();
    startBtn.classList.remove('active');
    stopBtn.classList.remove('active');
}

function nextSession() {
    isWorkSession = !isWorkSession;
    if (isWorkSession) {
        sessionText.textContent = '작업 시간';
        timeInSeconds = 25 * 60;
    } else {
        workSessionCount++;
        updateSessionCountDisplay();
        if (workSessionCount % 4 === 0) {
            sessionText.textContent = '긴 휴식';
            timeInSeconds = 15 * 60;
        } else {
            sessionText.textContent = '휴식 시간';
            timeInSeconds = 5 * 60;
        }
    }
    updateTimerDisplay();
    alert(sessionText.textContent + ' 시작!');
}

function toggleBgm() {
    if (isBgmPlaying) {
        bgmSound.pause();
    } else {
        bgmSound.play();
    }
    isBgmPlaying = !isBgmPlaying;
}

bgmSelect.addEventListener('change', () => {
    bgmSound.src = bgmSelect.value;
    if (isBgmPlaying) {
        bgmSound.play();
    }
});

startBtn.addEventListener('click', startTimer);
stopBtn.addEventListener('click', stopTimer);
resetBtn.addEventListener('click', resetTimer);
bgmBtn.addEventListener('click', toggleBgm);

themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
});

// Todo List
const todoInput = document.getElementById('todo-input');
const addTodoBtn = document.getElementById('add-todo-btn');
const todoList = document.getElementById('todo-list');

function addTodo() {
    const todoText = todoInput.value.trim();
    if (todoText !== '') {
        const li = document.createElement('li');
        
        const span = document.createElement('span');
        span.textContent = todoText;

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '삭제';
        deleteBtn.addEventListener('click', () => {
            li.remove();
        });

        li.appendChild(span);
        li.appendChild(deleteBtn);
        todoList.appendChild(li);
        todoInput.value = '';
        todoInput.focus();
    }
}

addTodoBtn.addEventListener('click', addTodo);

todoInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        addTodo();
    }
});

updateTimerDisplay();
updateSessionCountDisplay();