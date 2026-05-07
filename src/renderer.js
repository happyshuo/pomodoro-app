const PHASE = { WORK: 'work', SHORT_BREAK: 'shortBreak', LONG_BREAK: 'longBreak' };

const state = {
  data: null,
  phase: PHASE.WORK,
  running: false,
  timeLeft: 25 * 60,
  timeLeftAtTickStart: 25 * 60,
  tickReference: 0,
  currentTaskId: null,
  pomodorosCompleted: 0,
  timerInterval: null,
};

const CIRCUMFERENCE = 553;

const phaseLabel = document.querySelector('#phaseLabel');
const progressFill = document.querySelector('#progressFill');
const timerMinutes = document.querySelector('#timerMinutes');
const timerSeconds = document.querySelector('#timerSeconds');
const startBtn = document.querySelector('#startBtn');
const resetBtn = document.querySelector('#resetBtn');
const taskSelector = document.querySelector('#taskSelector');
const pomodoroCount = document.querySelector('#pomodoroCount');
const taskInput = document.querySelector('#taskInput');
const addTaskBtn = document.querySelector('#addTaskBtn');
const taskList = document.querySelector('#taskList');
const statTodayPomodoros = document.querySelector('#statTodayPomodoros');
const statTodayTasks = document.querySelector('#statTodayTasks');
const statTodayMinutes = document.querySelector('#statTodayMinutes');
const historyList = document.querySelector('#historyList');
const tabBtns = document.querySelectorAll('.tab-btn');
const panels = document.querySelectorAll('.panel');

async function loadData() {
  state.data = await window.pomodoroAPI.loadData();
}

async function saveData() {
  await window.pomodoroAPI.saveData(state.data);
}

function showNotification(title, body) {
  window.pomodoroAPI.showNotification({ title, body });
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return { m: String(m).padStart(2, '0'), s: String(s).padStart(2, '0') };
}

function getPhaseDuration() {
  const s = state.data.settings;
  switch (state.phase) {
    case PHASE.WORK: return s.workDuration;
    case PHASE.SHORT_BREAK: return s.shortBreakDuration;
    case PHASE.LONG_BREAK: return s.longBreakDuration;
  }
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function formatDateTime(ts) {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function formatDateShort(ts) {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return '今天';
  if (d.toDateString() === yesterday.toDateString()) return '昨天';
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function getTodaySessions() {
  return state.data.sessions.filter((s) => s.date === todayStr());
}

function updateTimerDisplay() {
  const { m, s } = formatTime(state.timeLeft);
  timerMinutes.textContent = m;
  timerSeconds.textContent = s;
  const total = getPhaseDuration();
  const offset = total > 0 ? CIRCUMFERENCE * (1 - state.timeLeft / total) : 0;
  progressFill.setAttribute('stroke-dashoffset', offset);
}

function updatePhaseUI() {
  const isWork = state.phase === PHASE.WORK;
  phaseLabel.textContent = isWork ? '专注' : '休息';
  phaseLabel.className = 'phase-label' + (isWork ? '' : ' break');
  progressFill.className = 'progress-fill' + (isWork ? '' : ' break');
  startBtn.textContent = state.running ? '暂停' : '开始';
  startBtn.className = 'btn btn-primary' + (state.running && !isWork ? ' running' : '');
}

function stopTimer() {
  clearTimeout(state.timerInterval);
  state.timerInterval = null;
  state.running = false;
}

function scheduleTick() {
  state.timerInterval = setTimeout(() => {
    const elapsed = Math.floor((Date.now() - state.tickReference) / 1000);
    state.timeLeft = Math.max(0, state.timeLeftAtTickStart - elapsed);
    updateTimerDisplay();

    if (state.timeLeft <= 0) {
      stopTimer();
      onTimerComplete();
    } else {
      scheduleTick();
    }
  }, 1000);
}

function startTimer() {
  if (state.running) {
    stopTimer();
    updatePhaseUI();
    return;
  }
  state.running = true;
  state.tickReference = Date.now();
  state.timeLeftAtTickStart = state.timeLeft;
  updatePhaseUI();
  scheduleTick();
}

function resetTimer() {
  stopTimer();
  state.phase = PHASE.WORK;
  state.timeLeft = getPhaseDuration();
  updateTimerDisplay();
  updatePhaseUI();
}

function pushSession(type, taskId, duration) {
  state.data.sessions.push({
    date: todayStr(),
    type,
    taskId,
    endTime: Date.now(),
    duration,
  });
}

function refreshUI() {
  updateTimerDisplay();
  updatePhaseUI();
  renderTaskSelector();
  renderPomodoroCount();
  renderTasks();
  renderStats();
}

async function onTimerComplete() {
  const s = state.data.settings;

  if (state.phase === PHASE.WORK) {
    state.pomodorosCompleted++;
    pushSession(PHASE.WORK, state.currentTaskId, s.workDuration);

    if (state.currentTaskId) {
      const task = state.data.tasks.find((t) => t.id === state.currentTaskId);
      if (task) task.pomodoros++;
    }

    const isLongBreak = state.pomodorosCompleted % s.longBreakInterval === 0;
    state.phase = isLongBreak ? PHASE.LONG_BREAK : PHASE.SHORT_BREAK;

    showNotification('番茄钟完成！', `已专注 ${s.workDuration / 60} 分钟`);
  } else {
    pushSession(state.phase, null, getPhaseDuration());
    state.phase = PHASE.WORK;
    showNotification('休息结束！', '准备好开始下一个番茄了吗？');
  }

  state.timeLeft = getPhaseDuration();
  refreshUI();
  await saveData();
}

function renderTasks() {
  const tasks = state.data.tasks;
  if (tasks.length === 0) {
    taskList.innerHTML = '<div class="empty-state">还没有任务，添加一个吧</div>';
    return;
  }
  taskList.innerHTML = tasks
    .map(
      (t) => `
    <div class="task-item ${t.completed ? 'completed' : ''}" data-id="${t.id}">
      <div class="task-check ${t.completed ? 'done' : ''}" data-action="toggle"></div>
      <span class="task-text">${escapeHtml(t.text)}</span>
      <span class="task-pomos">🍅 ${t.pomodoros}</span>
      <button class="task-delete" data-action="delete">✕</button>
    </div>`
    )
    .join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function renderTaskSelector() {
  const tasks = state.data.tasks.filter((t) => !t.completed);
  const currentId = state.currentTaskId;
  let html = '<option value="">-- 选择任务 --</option>';
  for (const t of tasks) {
    const selected = t.id === currentId ? ' selected' : '';
    html += `<option value="${t.id}"${selected}>${escapeHtml(t.text)}</option>`;
  }
  taskSelector.innerHTML = html;
  state.currentTaskId = taskSelector.value || null;
}

function renderPomodoroCount() {
  const total = state.data.tasks.reduce((sum, t) => sum + t.pomodoros, 0);
  pomodoroCount.textContent = `🍅 ${total}`;
}

async function afterTaskMutation() {
  renderTasks();
  renderTaskSelector();
  await saveData();
}

async function addTask(text) {
  if (!text.trim()) return;
  state.data.tasks.push({
    id: crypto.randomUUID(),
    text: text.trim(),
    completed: false,
    pomodoros: 0,
    createdAt: Date.now(),
  });
  await afterTaskMutation();
}

async function toggleTask(id) {
  const task = state.data.tasks.find((t) => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  await afterTaskMutation();
}

async function deleteTask(id) {
  state.data.tasks = state.data.tasks.filter((t) => t.id !== id);
  if (state.currentTaskId === id) state.currentTaskId = null;
  await afterTaskMutation();
}

function renderStats() {
  const todaySessions = getTodaySessions();
  const workSessions = todaySessions.filter((s) => s.type === PHASE.WORK);

  statTodayPomodoros.textContent = workSessions.length;

  const todayTaskIds = new Set(
    workSessions.filter((s) => s.taskId).map((s) => s.taskId)
  );
  statTodayTasks.textContent = todayTaskIds.size;

  const totalMinutes = Math.round(
    workSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60
  );
  statTodayMinutes.textContent = totalMinutes;

  const recent = [...state.data.sessions].reverse().slice(0, 20);
  if (recent.length === 0) {
    historyList.innerHTML = '<div class="empty-state">暂无记录</div>';
    return;
  }
  historyList.innerHTML = recent
    .map((s) => {
      const task = s.taskId
        ? state.data.tasks.find((t) => t.id === s.taskId)
        : null;
      const taskName = task
        ? task.text
        : s.type === PHASE.WORK
          ? '专注'
          : '休息';
      const duration = Math.round((s.duration || 0) / 60);
      const icon = s.type === PHASE.WORK ? '🍅' : '☕';
      return `<div class="history-item">
        <span class="date">${formatDateShort(s.endTime)} ${formatDateTime(s.endTime)}</span>
        <span class="task-name">${icon} ${escapeHtml(taskName)}</span>
        <span>${duration}分钟</span>
      </div>`;
    })
    .join('');
}

tabBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    tabBtns.forEach((b) => b.classList.remove('active'));
    panels.forEach((p) => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`${btn.dataset.tab}Panel`).classList.add('active');
    if (btn.dataset.tab === 'stats') renderStats();
  });
});

startBtn.addEventListener('click', startTimer);
resetBtn.addEventListener('click', resetTimer);

taskSelector.addEventListener('change', () => {
  state.currentTaskId = taskSelector.value || null;
});

async function handleAddTask() {
  await addTask(taskInput.value);
  taskInput.value = '';
}

addTaskBtn.addEventListener('click', handleAddTask);

taskInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleAddTask();
});

taskList.addEventListener('click', async (e) => {
  const item = e.target.closest('.task-item');
  if (!item) return;
  const id = item.dataset.id;
  const action = e.target.dataset.action;
  if (action === 'toggle') await toggleTask(id);
  if (action === 'delete') await deleteTask(id);
});

async function init() {
  await loadData();
  state.timeLeft = getPhaseDuration();
  renderTaskSelector();
  renderPomodoroCount();
  renderTasks();
  renderStats();
  updateTimerDisplay();
  updatePhaseUI();
}

init().catch((e) => console.error('Init failed:', e));
