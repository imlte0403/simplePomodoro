// Configuration
const CONFIG = {
    DEFAULT_WORK_TIME: 25,
    DEFAULT_SHORT_BREAK_TIME: 5,
    DEFAULT_LONG_BREAK_TIME: 15,
    LONG_BREAK_INTERVAL: 4,
    NOTIFICATION_DISPLAY_TIME: 3000,
};

// State management
const State = {
    isWorkSession: true,
    workSessionCount: 0,
    timeInSeconds: 0,
    totalFocusTime: 0,
    isRunning: false,
    workTime: CONFIG.DEFAULT_WORK_TIME,
    shortBreakTime: CONFIG.DEFAULT_SHORT_BREAK_TIME,
    longBreakTime: CONFIG.DEFAULT_LONG_BREAK_TIME,
    isMusicPlaying: false,

    getCurrentSessionDuration() {
        if (this.isWorkSession) {
            return this.workTime * 60;
        } else if (this.workSessionCount % CONFIG.LONG_BREAK_INTERVAL === 0) {
            return this.longBreakTime * 60;
        } else {
            return this.shortBreakTime * 60;
        }
    },

    init() {
        this.timeInSeconds = this.workTime * 60;
    }
};

// DOM elements
const DOM = {
    timerDisplay: document.getElementById('timer'),
    progressRingFill: document.querySelector('.progress-ring-fill'),
    sessionText: document.getElementById('session-text'),
    startBtn: document.getElementById('start-btn'),
    stopBtn: document.getElementById('stop-btn'),
    resetBtn: document.getElementById('reset-btn'),
    sessionCountDisplay: document.getElementById('session-count'),
    totalTimeDisplay: document.getElementById('total-time'),
    themeBtn: document.getElementById('theme-btn'),
    todoInput: document.getElementById('todo-input'),
    addTodoBtn: document.getElementById('add-todo-btn'),
    todoList: document.getElementById('todo-list'),
    notification: document.getElementById('notification'),
    workTimeInput: document.getElementById('work-time'),
    shortBreakTimeInput: document.getElementById('short-break-time'),
    longBreakTimeInput: document.getElementById('long-break-time'),
    saveSettingsBtn: document.getElementById('save-settings-btn'),
    musicToggleBtn: document.getElementById('music-toggle-btn'),
    backgroundMusic: document.getElementById('bg-music'),
    volumeSlider: document.getElementById('volume-slider'),
    musicToggleBtn: document.getElementById('music-toggle-btn'), 
    prevMusicBtn: document.getElementById('prev-music-btn'), 
    nextMusicBtn: document.getElementById('next-music-btn') 

};

// Timer module
const TimerModule = (() => {
    let timerInterval;
    const radius = 120;
    const circumference = 2 * Math.PI * radius;

    function updateDisplay() {
        const minutes = Math.floor(State.timeInSeconds / 60);
        const seconds = State.timeInSeconds % 60;
        DOM.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Update progress ring
        const totalSessionTime = State.getCurrentSessionDuration();
        const progress = (State.timeInSeconds / totalSessionTime);
        const offset = circumference - (progress * circumference);
        DOM.progressRingFill.style.strokeDasharray = `${circumference} ${circumference}`;
        DOM.progressRingFill.style.strokeDashoffset = offset;
    }

    function updateStats() {
        DOM.sessionCountDisplay.textContent = State.workSessionCount;
        DOM.totalTimeDisplay.textContent = `${Math.floor(State.totalFocusTime / 60)}분`;
    }

    function start() {
        if (State.isRunning) return;
        
        State.isRunning = true;
        DOM.startBtn.textContent = '실행중...';
        DOM.startBtn.style.opacity = '0.7';
        
        timerInterval = setInterval(() => {
            State.timeInSeconds--;
            
            if (State.isWorkSession) {
                State.totalFocusTime++;
                updateStats();
            }
            
            updateDisplay();
            
            if (State.timeInSeconds <= 0) {
                clearInterval(timerInterval);
                nextSession();
            }
        }, 1000);
    }

    function stop() {
        clearInterval(timerInterval);
        State.isRunning = false;
        DOM.startBtn.textContent = '시작';
        DOM.startBtn.style.opacity = '1';
    }

    function reset() {
        stop();
        State.isWorkSession = true;
        State.timeInSeconds = State.workTime * 60;
        DOM.sessionText.textContent = '작업 시간';
        updateDisplay();
        updateSessionText();
    }

    function nextSession() {
        State.isRunning = false;
        State.isWorkSession = !State.isWorkSession;
        
        if (State.isWorkSession) {
            DOM.sessionText.textContent = '작업 시간';
            State.timeInSeconds = State.workTime * 60;
        } else {
            State.workSessionCount++;
            updateStats();
            
            if (State.workSessionCount % CONFIG.LONG_BREAK_INTERVAL === 0) {
                DOM.sessionText.textContent = '긴 휴식';
                State.timeInSeconds = State.longBreakTime * 60;
            } else {
                DOM.sessionText.textContent = '짧은 휴식';
                State.timeInSeconds = State.shortBreakTime * 60;
            }
        }
        
        updateDisplay();
        updateSessionText();
        showNotification(`${DOM.sessionText.textContent} 시작!`);
        DOM.startBtn.textContent = '시작';
        DOM.startBtn.style.opacity = '1';
    }

    function updateSessionText() {
        const sessionDot = document.querySelector('.session-dot');
        if (State.isWorkSession) {
            sessionDot.style.background = '#6366f1';
        } else if (State.workSessionCount % CONFIG.LONG_BREAK_INTERVAL === 0) {
            sessionDot.style.background = '#8b5cf6';
        } else {
            sessionDot.style.background = '#10b981';
        }
    }

    return { start, stop, reset, updateDisplay, updateStats };
})();

// Theme module
const ThemeModule = (() => {
    function toggle() {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        DOM.themeBtn.textContent = isLight ? '☀️' : '🌙';
    }

    return { toggle };
})();

// Todo module
const TodoModule = (() => {
    function add() {
        const text = DOM.todoInput.value.trim();
        if (!text) return;

        const li = document.createElement('li');
        li.className = 'todo-item';
        li.innerHTML = `
            <div class="todo-checkbox"></div>
            <span class="todo-text">${text}</span>
            <button class="delete-btn">×</button>
        `;

        const checkbox = li.querySelector('.todo-checkbox');
        const todoText = li.querySelector('.todo-text');
        const deleteBtn = li.querySelector('.delete-btn');

        checkbox.addEventListener('click', () => {
            checkbox.classList.toggle('checked');
            todoText.classList.toggle('completed');
        });

        todoText.addEventListener('click', () => {
            checkbox.classList.toggle('checked');
            todoText.classList.toggle('completed');
        });

        deleteBtn.addEventListener('click', () => {
            li.remove();
        });

        DOM.todoList.appendChild(li);
        DOM.todoInput.value = '';
        DOM.todoInput.focus();
    }

    return { add };
})();

// Settings module
const SettingsModule = (() => {
    function save() {
        State.workTime = parseInt(DOM.workTimeInput.value);
        State.shortBreakTime = parseInt(DOM.shortBreakTimeInput.value);
        State.longBreakTime = parseInt(DOM.longBreakTimeInput.value);

        TimerModule.reset();
        showNotification('설정이 저장되었습니다!');
    }

    return { save };
})();

// Notification system
function showNotification(message) {
    DOM.notification.textContent = message;
    DOM.notification.classList.add('show');
    setTimeout(() => {
        DOM.notification.classList.remove('show');
    }, CONFIG.NOTIFICATION_DISPLAY_TIME);
}

// Music module
const MusicModule = (() => {
    function toggle() {
        State.isMusicPlaying = !State.isMusicPlaying;
        if (State.isMusicPlaying) {
            DOM.backgroundMusic.play();
            DOM.musicToggleBtn.innerHTML = '음악 끄기 🔇';
        } else {
            DOM.backgroundMusic.pause();
            DOM.musicToggleBtn.innerHTML = '음악 켜기 🎵';
        }
    }
    return { toggle };
})();

const musicFiles = [
    "background1.mp3",
    "background2.mp3",
    "background3.mp3"
];
let currentMusicIndex = 0;

function playCurrentMusic() {
    DOM.backgroundMusic.src = musicFiles[currentMusicIndex];
    DOM.backgroundMusic.load(); 
    if (State.isMusicPlaying) { 
        DOM.backgroundMusic.play(); 
    }
}

function playNextMusic() {
    currentMusicIndex = (currentMusicIndex + 1) % musicFiles.length;
    playCurrentMusic();
}

function playPrevMusic() {
    currentMusicIndex = (currentMusicIndex - 1 + musicFiles.length) % musicFiles.length;
    playCurrentMusic();
}

// Event listeners
DOM.prevMusicBtn.addEventListener('click', playPrevMusic);
DOM.nextMusicBtn.addEventListener('click', playNextMusic);
DOM.startBtn.addEventListener('click', TimerModule.start);
DOM.stopBtn.addEventListener('click', TimerModule.stop);
DOM.resetBtn.addEventListener('click', TimerModule.reset);
DOM.themeBtn.addEventListener('click', ThemeModule.toggle);
DOM.addTodoBtn.addEventListener('click', TodoModule.add);
DOM.todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') TodoModule.add();
});
DOM.saveSettingsBtn.addEventListener('click', SettingsModule.save);
DOM.musicToggleBtn.addEventListener('click', MusicModule.toggle);

DOM.volumeSlider.addEventListener('input', function() {
    DOM.backgroundMusic.volume = this.value;
});

// Initialize
State.init();
TimerModule.updateDisplay();
TimerModule.updateStats();
DOM.backgroundMusic.volume = DOM.volumeSlider.value;
playCurrentMusic();