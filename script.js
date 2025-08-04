// 설정
const CONFIG = {
    DEFAULT_WORK_TIME: 25, // 기본 작업 시간 (분)
    DEFAULT_SHORT_BREAK_TIME: 5, // 기본 짧은 휴식 시간 (분)
    DEFAULT_LONG_BREAK_TIME: 15, // 기본 긴 휴식 시간 (분)
    LONG_BREAK_INTERVAL: 4, // 긴 휴식 세션 간격 (작업 세션 횟수)
    NOTIFICATION_DISPLAY_TIME: 3000, // 알림 표시 시간 (밀리초)
    PROGRESS_RING_RADIUS: 120, // 진행 원형의 반지름
};

// 상태 관리
const State = {
    isWorkSession: true, // 현재 작업 세션인지 여부
    workSessionCount: 0, // 완료된 작업 세션 수
    timeInSeconds: 0, // 현재 세션의 남은 시간 (초)
    totalFocusTime: 0, // 총 집중 시간 (초)
    isRunning: false, // 타이머 실행 중 여부
    workTime: CONFIG.DEFAULT_WORK_TIME, // 사용자 설정 작업 시간
    shortBreakTime: CONFIG.DEFAULT_SHORT_BREAK_TIME, // 사용자 설정 짧은 휴식 시간
    longBreakTime: CONFIG.DEFAULT_LONG_BREAK_TIME, // 사용자 설정 긴 휴식 시간
    isMusicPlaying: false, // 음악 재생 중 여부

    // 현재 세션의 총 시간(초)을 반환
    getCurrentSessionDuration() {
        if (this.isWorkSession) {
            return this.workTime * 60;
        } else if (this.workSessionCount % CONFIG.LONG_BREAK_INTERVAL === 0) {
            return this.longBreakTime * 60;
        } else {
            return this.shortBreakTime * 60;
        }
    },

    // 상태 초기화
    init() {
        this.timeInSeconds = this.workTime * 60;
    }
};

// DOM 요소 캐싱
const DOM = {
    timerDisplay: document.getElementById('timer'), // 타이머 시간 표시 요소
    progressRingFill: document.querySelector('.progress-ring-fill'), // 진행 원형 채우기 요소
    sessionText: document.getElementById('session-text'), // 현재 세션 텍스트 (작업/휴식)
    startBtn: document.getElementById('start-btn'), // 시작 버튼
    stopBtn: document.getElementById('stop-btn'), // 중지 버튼
    resetBtn: document.getElementById('reset-btn'), // 초기화 버튼
    sessionCountDisplay: document.getElementById('session-count'), // 세션 카운트 표시
    totalTimeDisplay: document.getElementById('total-time'), // 총 집중 시간 표시
    themeBtn: document.getElementById('theme-btn'), // 테마 토글 버튼
    todoInput: document.getElementById('todo-input'), // 할 일 입력 필드
    addTodoBtn: document.getElementById('add-todo-btn'), // 할 일 추가 버튼
    todoList: document.getElementById('todo-list'), // 할 일 목록 컨테이너
    notification: document.getElementById('notification'), // 알림 메시지 표시 요소
    workTimeInput: document.getElementById('work-time'), // 작업 시간 설정 입력 필드
    shortBreakTimeInput: document.getElementById('short-break-time'), // 짧은 휴식 시간 설정 입력 필드
    longBreakTimeInput: document.getElementById('long-break-time'), // 긴 휴식 시간 설정 입력 필드
    saveSettingsBtn: document.getElementById('save-settings-btn'), // 설정 저장 버튼
    musicToggleBtn: document.getElementById('music-toggle-btn'), // 음악 재생/일시정지 버튼
    backgroundMusic: document.getElementById('bg-music'), // 배경 음악 오디오 요소
        volumeSlider: document.getElementById('volume-slider'), // 볼륨 조절 슬라이더
    prevMusicBtn: document.getElementById('prev-music-btn'), // 이전 음악 버튼
    prevMusicBtn: document.getElementById('prev-music-btn'), // 이전 음악 버튼
    nextMusicBtn: document.getElementById('next-music-btn') // 다음 음악 버튼
};

// 타이머 모듈
const TimerModule = (() => {
    let timerInterval; // 타이머 인터벌 ID
    const radius = CONFIG.PROGRESS_RING_RADIUS; // 진행 원형의 반지름
    const circumference = 2 * Math.PI * radius; // 진행 원형의 둘레

    // 타이머 시간 및 진행 원형 업데이트
    function updateDisplay() {
        const minutes = Math.floor(State.timeInSeconds / 60);
        const seconds = State.timeInSeconds % 60;
        DOM.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // 진행 원형 업데이트
        const totalSessionTime = State.getCurrentSessionDuration();
        const progress = (State.timeInSeconds / totalSessionTime);
        const offset = circumference - (progress * circumference);
        DOM.progressRingFill.style.strokeDasharray = `${circumference} ${circumference}`;
        DOM.progressRingFill.style.strokeDashoffset = offset;
    }

    // 통계(세션 수, 총 집중 시간) 업데이트
    function updateStats() {
        DOM.sessionCountDisplay.textContent = State.workSessionCount;
        DOM.totalTimeDisplay.textContent = `${Math.floor(State.totalFocusTime / 60)}분`;
    }

    // 타이머 시작
    function start() {
        if (State.isRunning) return; // 이미 실행 중이면 중복 실행 방지
        
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
                nextSession(); // 다음 세션으로 전환
            }
        }, 1000);
    }

    // 타이머 중지
    function stop() {
        clearInterval(timerInterval);
        State.isRunning = false;
        DOM.startBtn.textContent = '시작';
        DOM.startBtn.style.opacity = '1';
    }

    // 타이머 초기화
    function reset() {
        stop();
        State.isWorkSession = true;
        State.timeInSeconds = State.workTime * 60;
        DOM.sessionText.textContent = '작업 시간';
        updateDisplay();
        updateSessionText(); // 세션 텍스트 및 색상 업데이트
    }

    // 다음 세션으로 전환
    function nextSession() {
        State.isRunning = false;
        State.isWorkSession = !State.isWorkSession;
        
        if (State.isWorkSession) {
            // 작업 세션
            DOM.sessionText.textContent = '작업 시간';
            State.timeInSeconds = State.workTime * 60;
        } else {
            // 휴식 세션
            State.workSessionCount++;
            updateStats();
            
            if (State.workSessionCount % CONFIG.LONG_BREAK_INTERVAL === 0) {
                // 긴 휴식
                DOM.sessionText.textContent = '긴 휴식';
                State.timeInSeconds = State.longBreakTime * 60;
            } else {
                // 짧은 휴식
                DOM.sessionText.textContent = '짧은 휴식';
                State.timeInSeconds = State.shortBreakTime * 60;
            }
        }
        
        updateDisplay();
        updateSessionText(); // 세션 텍스트 및 색상 업데이트
        NotificationModule.show(`${DOM.sessionText.textContent} 시작!`); // 알림 표시
        DOM.startBtn.textContent = '시작';
        DOM.startBtn.style.opacity = '1';
    }

    // 세션 텍스트 및 세션 점 색상 업데이트
    function updateSessionText() {
        const sessionDot = document.querySelector('.session-dot');
        if (State.isWorkSession) {
            sessionDot.style.background = '#6366f1'; // 작업 세션 색상
        } else if (State.workSessionCount % CONFIG.LONG_BREAK_INTERVAL === 0) {
            sessionDot.style.background = '#8b5cf6'; // 긴 휴식 색상
        } else {
            sessionDot.style.background = '#10b981'; // 짧은 휴식 색상
        }
    }

    return { start, stop, reset, updateDisplay, updateStats };
})();

// 테마 모듈
const ThemeModule = (() => {
    // 테마 토글 (라이트/다크 모드)
    function toggle() {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        DOM.themeBtn.textContent = isLight ? '☀️' : '🌙'; // 버튼 텍스트 변경
    }

    return { toggle };
})();

// 할 일 모듈
const TodoModule = (() => {
    // 할 일 추가
    function add() {
        const text = DOM.todoInput.value.trim();
        if (!text) return; // 입력값이 없으면 추가하지 않음

        const li = document.createElement('li');
        li.className = 'todo-item';
        li.innerHTML = `
            <div class="todo-checkbox"></div>
            <span class="todo-text">${text}</span>
            <button class="btn-icon edit-btn">...</button>
            <button class="btn-icon delete-btn">×</button>
        `;

        const checkbox = li.querySelector('.todo-checkbox');
        const todoText = li.querySelector('.todo-text');
        const deleteBtn = li.querySelector('.delete-btn');

        // 체크박스 및 텍스트 클릭 시 완료 상태 토글
        const toggleCompletion = () => {
            checkbox.classList.toggle('checked');
            todoText.classList.toggle('completed');
        };
        checkbox.addEventListener('click', toggleCompletion);
        todoText.addEventListener('click', toggleCompletion);

        // 삭제 버튼 클릭 시 할 일 제거
        deleteBtn.addEventListener('click', () => {
            li.remove();
        });

        // 수정 버튼 클릭 시 할 일 텍스트 수정 모드 활성화
        const editBtn = li.querySelector('.edit-btn');
        editBtn.addEventListener('click', () => {
            todoText.contentEditable = true;
            todoText.focus();
            todoText.classList.add('editing');

            // 텍스트 전체 선택
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(todoText);
            selection.removeAllRanges();
            selection.addRange(range);
        });

        // 수정 완료 후 저장하는 함수
        const saveEdit = () => {
            todoText.contentEditable = false;
            todoText.classList.remove('editing');
        };

        // 다른 곳을 클릭하면(blur) 저장
        todoText.addEventListener('blur', saveEdit);

        // Enter 키를 누르면 저장하고, 줄바꿈은 방지
        todoText.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // Enter 시 줄바꿈 되는 기본 동작 방지
                saveEdit();
            }
        });

        DOM.todoList.appendChild(li);
        DOM.todoInput.value = '';
        DOM.todoInput.focus();
    }

    return { add };
})();

// 설정 모듈
const SettingsModule = (() => {
    // 설정 저장
    function save() {
        State.workTime = parseInt(DOM.workTimeInput.value); // 작업 시간 파싱
        State.shortBreakTime = parseInt(DOM.shortBreakTimeInput.value); // 짧은 휴식 시간 파싱
        State.longBreakTime = parseInt(DOM.longBreakTimeInput.value); // 긴 휴식 시간 파싱

        TimerModule.reset(); // 타이머 초기화 및 새 설정 적용
        showNotification('설정이 저장되었습니다!'); // 설정 저장 알림
    }

    return { save };
})();

// 알림 모듈
const NotificationModule = (() => {
    function show(message) {
        DOM.notification.textContent = message;
        DOM.notification.classList.add('show');
        setTimeout(() => {
            DOM.notification.classList.remove('show');
        }, CONFIG.NOTIFICATION_DISPLAY_TIME);
    }
    return { show };
})();

// 음악 모듈
const MusicModule = (() => {
    // 음악 재생/일시정지 토글
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

// 배경 음악 파일 목록
const musicFiles = [
    "background1.mp3",
    "background2.mp3",
    "background3.mp3"
];
let currentMusicIndex = 0; // 현재 재생 중인 음악 인덱스

// 현재 인덱스의 음악 재생
function playCurrentMusic() {
    DOM.backgroundMusic.src = musicFiles[currentMusicIndex];
    DOM.backgroundMusic.load(); 
    if (State.isMusicPlaying) { 
        DOM.backgroundMusic.play(); 
    }
}

// 다음 음악 재생
function playNextMusic() {
    currentMusicIndex = (currentMusicIndex + 1) % musicFiles.length;
    playCurrentMusic();
}

// 이전 음악 재생
function playPrevMusic() {
    currentMusicIndex = (currentMusicIndex - 1 + musicFiles.length) % musicFiles.length;
    playCurrentMusic();
}

// 이벤트 리스너 등록
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

// 볼륨 슬라이더 변경 시 음악 볼륨 조절
DOM.volumeSlider.addEventListener('input', function() {
    DOM.backgroundMusic.volume = this.value;
});

// 초기화
State.init(); // 상태 초기화
TimerModule.updateDisplay(); // 타이머 디스플레이 초기 업데이트
TimerModule.updateStats(); // 통계 디스플레이 초기 업데이트
DOM.backgroundMusic.volume = DOM.volumeSlider.value; // 초기 볼륨 설정
playCurrentMusic(); // 초기 음악 재생