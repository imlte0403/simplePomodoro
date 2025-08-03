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

const bgmSelection = document.querySelector('.bgm-selection');

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
    bgmBtn.classList.remove('active');
    themeBtn.classList.remove('active');
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
    showNotification(sessionText.textContent + ' 시작!');
}

function showNotification(message) {
    const notificationMessage = document.getElementById('notification-message');
    notificationMessage.textContent = message;
    notificationMessage.style.opacity = '1';
    setTimeout(() => {
        notificationMessage.style.opacity = '0';
    }, 3000);
}

function toggleBgm() {
    if (isBgmPlaying) {
        bgmSound.pause();
    } else {
        bgmSound.play();
    }
    isBgmPlaying = !isBgmPlaying;
    bgmBtn.classList.toggle('active');
    bgmSelection.classList.toggle('hidden');
}

bgmSelect.addEventListener('change', () => {
    if (isBgmPlaying) { // Pause if currently playing
        bgmSound.pause();
    }
    bgmSound.src = bgmSelect.value;
    if (isBgmPlaying) { // Play the new source if it was playing before
        bgmSound.play();
    }
});

startBtn.addEventListener('click', startTimer);
stopBtn.addEventListener('click', stopTimer);
resetBtn.addEventListener('click', resetTimer);
bgmBtn.addEventListener('click', toggleBgm);

themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    themeBtn.classList.toggle('active');
    if (document.body.classList.contains('light-mode')) {
        themeBtn.textContent = '다크 모드';
    } else {
        themeBtn.textContent = '라이트 모드';
    }
});

// Todo List
const todoInput = document.getElementById('todo-input');
const addTodoBtn = document.getElementById('add-todo-btn');
const todoList = document.getElementById('todo-list');

function addTodo() {
    const todoText = todoInput.value.trim();
    if (todoText !== '') {
        const li = document.createElement('li');
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.addEventListener('change', () => {
            li.classList.toggle('completed', checkbox.checked);
        });

        const span = document.createElement('span');
        span.textContent = todoText;
        span.addEventListener('click', () => {
            checkbox.checked = !checkbox.checked;
            li.classList.toggle('completed', checkbox.checked);
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '삭제';
        deleteBtn.addEventListener('click', () => {
            li.remove();
        });

        li.appendChild(checkbox);
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