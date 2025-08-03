// 1. CONFIG object for constants
const CONFIG = {
    DEFAULT_WORK_TIME: 25,
    DEFAULT_SHORT_BREAK_TIME: 5,
    DEFAULT_LONG_BREAK_TIME: 15,
    LOCAL_STORAGE_KEYS: {
        WORK_TIME: 'workTime',
        SHORT_BREAK_TIME: 'shortBreakTime',
        LONG_BREAK_TIME: 'longBreakTime',
    },
    LONG_BREAK_INTERVAL: 4,
    NOTIFICATION_DISPLAY_TIME: 3000, // 3 seconds
};

// 2. State object for mutable variables
const State = {
    isWorkSession: true,
    workSessionCount: 0,
    timeInSeconds: 0, // Will be initialized based on settings
    isBgmPlaying: false,
    workTime: 0,
    shortBreakTime: 0,
    longBreakTime: 0,

    // Initialize session times from local storage or defaults
    loadSessionTimes() {
        this.workTime = parseInt(localStorage.getItem(CONFIG.LOCAL_STORAGE_KEYS.WORK_TIME)) || CONFIG.DEFAULT_WORK_TIME;
        this.shortBreakTime = parseInt(localStorage.getItem(CONFIG.LOCAL_STORAGE_KEYS.SHORT_BREAK_TIME)) || CONFIG.DEFAULT_SHORT_BREAK_TIME;
        this.longBreakTime = parseInt(localStorage.getItem(CONFIG.LOCAL_STORAGE_KEYS.LONG_BREAK_TIME)) || CONFIG.DEFAULT_LONG_BREAK_TIME;
        this.timeInSeconds = this.workTime * 60; // Set initial time
    },

    saveSessionTimes() {
        localStorage.setItem(CONFIG.LOCAL_STORAGE_KEYS.WORK_TIME, this.workTime);
        localStorage.setItem(CONFIG.LOCAL_STORAGE_KEYS.SHORT_BREAK_TIME, this.shortBreakTime);
        localStorage.setItem(CONFIG.LOCAL_STORAGE_KEYS.LONG_BREAK_TIME, this.longBreakTime);
    },

    getCurrentSessionDuration() {
        if (this.isWorkSession) {
            return this.workTime * 60;
        } else if (this.workSessionCount % CONFIG.LONG_BREAK_INTERVAL === 0) {
            return this.longBreakTime * 60;
        } else {
            return this.shortBreakTime * 60;
        }
    }
};

// 3. DOM object for element references
const DOM = {
    timerDisplay: document.getElementById('timer'),
    progressRingProgress: document.querySelector('.progress-ring-progress'),
    sessionText: document.getElementById('session-text'),
    startBtn: document.getElementById('start-btn'),
    stopBtn: document.getElementById('stop-btn'),
    resetBtn: document.getElementById('reset-btn'),
    sessionCountDisplay: document.getElementById('session-count'),
    bgmBtn: document.getElementById('bgm-btn'),
    notificationSound: document.getElementById('notification-sound'),
    bgmSound: document.getElementById('bgm-sound'),
    bgmSelect: document.getElementById('bgm-select'),
    themeBtn: document.getElementById('theme-btn'),
    bgmSelection: document.querySelector('.bgm-selection'),
    todoInput: document.getElementById('todo-input'),
    addTodoBtn: document.getElementById('add-todo-btn'),
    todoList: document.getElementById('todo-list'),
    notificationMessage: document.getElementById('notification-message'),
    workTimeInput: document.getElementById('work-time'),
    shortBreakTimeInput: document.getElementById('short-break-time'),
    longBreakTimeInput: document.getElementById('long-break-time'),
    saveSettingsBtn: document.getElementById('save-settings-btn'),
};

// 4. Modularized functions

const TimerModule = (() => {
    let timerInterval;

    function updateDisplay() {
        const minutes = Math.floor(State.timeInSeconds / 60);
        const seconds = State.timeInSeconds % 60;
        DOM.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Update circular progress bar
        const radius = DOM.progressRingProgress.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
        const totalSessionTime = State.getCurrentSessionDuration();
        const offset = circumference - (State.timeInSeconds / totalSessionTime) * circumference;
        DOM.progressRingProgress.style.strokeDasharray = `${circumference} ${circumference}`;
        DOM.progressRingProgress.style.strokeDashoffset = offset;
    }

    function updateSessionCountDisplay() {
        DOM.sessionCountDisplay.textContent = `완료한 세션: ${State.workSessionCount}`;
    }

    function start() {
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            State.timeInSeconds--;
            updateDisplay();
            if (State.timeInSeconds <= 0) {
                clearInterval(timerInterval);
                DOM.notificationSound.play();
                nextSession();
            }
        }, 1000);
        DOM.startBtn.classList.add('active');
        DOM.stopBtn.classList.remove('active');
    }

    function stop() {
        clearInterval(timerInterval);
        DOM.startBtn.classList.remove('active');
        DOM.stopBtn.classList.add('active');
    }

    function reset() {
        clearInterval(timerInterval);
        State.isWorkSession = true; // Always reset to work session
        State.timeInSeconds = State.workTime * 60;
        updateDisplay();
        DOM.startBtn.classList.remove('active');
        DOM.stopBtn.classList.remove('active');
        DOM.bgmBtn.classList.remove('active');
        DOM.themeBtn.classList.remove('active');
    }

    function nextSession() {
        State.isWorkSession = !State.isWorkSession;
        if (State.isWorkSession) {
            DOM.sessionText.textContent = '작업 시간';
            State.timeInSeconds = State.workTime * 60;
        } else {
            State.workSessionCount++;
            updateSessionCountDisplay();
            if (State.workSessionCount % CONFIG.LONG_BREAK_INTERVAL === 0) {
                DOM.sessionText.textContent = '긴 휴식';
                State.timeInSeconds = State.longBreakTime * 60;
            } else {
                DOM.sessionText.textContent = '휴식 시간';
                State.timeInSeconds = State.shortBreakTime * 60;
            }
        }
        updateDisplay();
        UINotifications.show(`${DOM.sessionText.textContent} 시작!`);
    }

    return {
        start,
        stop,
        reset,
        updateDisplay,
        updateSessionCountDisplay,
        nextSession // Expose nextSession for external use if needed (e.g., settings change)
    };
})();

const AudioModule = (() => {
    function toggleBgm() {
        if (State.isBgmPlaying) {
            DOM.bgmSound.pause();
        } else {
            DOM.bgmSound.play();
        }
        State.isBgmPlaying = !State.isBgmPlaying;
        DOM.bgmBtn.classList.toggle('active');
        DOM.bgmSelection.classList.toggle('hidden');
    }

    function handleBgmSelectChange() {
        if (State.isBgmPlaying) { // Pause if currently playing
            DOM.bgmSound.pause();
        }
        DOM.bgmSound.src = DOM.bgmSelect.value;
        if (State.isBgmPlaying) { // Play the new source if it was playing before
            DOM.bgmSound.play();
        }
    }

    return {
        toggleBgm,
        handleBgmSelectChange
    };
})();

const ThemeModule = (() => {
    function toggleTheme() {
        document.body.classList.toggle('light-mode');
        DOM.themeBtn.classList.toggle('active');
        if (document.body.classList.contains('light-mode')) {
            DOM.themeBtn.textContent = '다크 모드';
        } else {
            DOM.themeBtn.textContent = '라이트 모드';
        }
    }
    return {
        toggleTheme
    };
})();

const TodoListModule = (() => {
    function addTodo() {
        const todoText = DOM.todoInput.value.trim();
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
            DOM.todoList.appendChild(li);
            DOM.todoInput.value = '';
            DOM.todoInput.focus();
        }
    }

    return {
        addTodo
    };
})();

const SettingsModule = (() => {
    function loadSettingsToInputs() {
        DOM.workTimeInput.value = State.workTime;
        DOM.shortBreakTimeInput.value = State.shortBreakTime;
        DOM.longBreakTimeInput.value = State.longBreakTime;
    }

    function saveSettings() {
        State.workTime = parseInt(DOM.workTimeInput.value);
        State.shortBreakTime = parseInt(DOM.shortBreakTimeInput.value);
        State.longBreakTime = parseInt(DOM.longBreakTimeInput.value);

        State.saveSessionTimes();
        TimerModule.reset(); // Reset timer with new settings
        UINotifications.show('설정이 저장되었습니다!');
    }

    return {
        loadSettingsToInputs,
        saveSettings
    };
})();

const UINotifications = (() => {
    function show(message) {
        DOM.notificationMessage.textContent = message;
        DOM.notificationMessage.style.opacity = '1';
        setTimeout(() => {
            DOM.notificationMessage.style.opacity = '0';
        }, CONFIG.NOTIFICATION_DISPLAY_TIME);
    }
    return {
        show
    };
})();


// 5. Initialization
document.addEventListener('DOMContentLoaded', () => {
    State.loadSessionTimes(); // Load settings first
    SettingsModule.loadSettingsToInputs(); // Update settings inputs
    TimerModule.updateDisplay(); // Initial display update
    TimerModule.updateSessionCountDisplay(); // Initial session count display

    // Event Listeners
    DOM.startBtn.addEventListener('click', TimerModule.start);
    DOM.stopBtn.addEventListener('click', TimerModule.stop);
    DOM.resetBtn.addEventListener('click', TimerModule.reset);
    DOM.bgmBtn.addEventListener('click', AudioModule.toggleBgm);
    DOM.bgmSelect.addEventListener('change', AudioModule.handleBgmSelectChange);
    DOM.themeBtn.addEventListener('click', ThemeModule.toggleTheme);
    DOM.addTodoBtn.addEventListener('click', TodoListModule.addTodo);
    DOM.todoInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            TodoListModule.addTodo();
        }
    });
    DOM.saveSettingsBtn.addEventListener('click', SettingsModule.saveSettings);
});