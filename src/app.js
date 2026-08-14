import "./styles.css";
import {
  COURSE,
  GOALS,
  PLACEMENT_QUESTIONS,
  buildWeekTest,
  getCourseStats,
  getLesson,
  scorePlacement,
} from "./curriculum.js";
import { evaluateOutcome, formatScheduledDate, getSelfStudyCycle, getSelfStudyPlan, scheduledDateForDay, weekDateRange } from "./planner.js";
import {
  addMistake,
  addReviewItem,
  clearRecordings,
  createDefaultState,
  deleteRecording,
  dueReviewItems,
  exportBackup,
  listRecordings,
  loadState,
  localDateKey,
  markStudyDate,
  resetState,
  saveRecording,
  saveState,
  validateAndImportBackup,
} from "./storage.js";

const app = document.querySelector("#app");
let state = loadState();
let deferredInstallPrompt = null;
let recorder = null;
let recordingChunks = [];
let recordingStream = null;
let recordingStartedAt = 0;
let recordingTimer = null;
let activeAudioUrl = "";

const ui = {
  nav: "home",
  onboardingStep: state.onboarded ? 0 : 0,
  onboarding: {
    name: state.profile.name || "",
    learningMode: state.profile.learningMode || "self",
    goal: state.profile.goal || "daily",
    dailyMinutes: state.profile.dailyMinutes || 40,
    studyDays: state.profile.studyDays || [1, 2, 3, 4, 5],
    reminderTime: state.profile.reminderTime || "20:30",
    startDate: state.profile.startDate || state.course.startDate || localDateKey(),
  },
  placementIndex: 0,
  placementAnswers: {},
  placementResult: null,
  assessmentActive: false,
  assessmentIndex: 0,
  assessmentAnswers: {},
  assessmentResult: null,
  activeTask: "",
  mode: "standard",
  feedback: null,
  wordIndex: 0,
  wordRevealed: false,
  taskTemp: {},
  quizIndex: 0,
  quizAnswers: {},
  quizChecked: {},
  reviewIndex: 0,
  reviewRevealed: false,
  weekTestIndex: 0,
  weekTestAnswers: {},
  activeWeekTest: null,
  outcomeWeek: null,
  weekTestSpeaking: false,
  installable: false,
  toast: "",
  recordStatus: "idle",
  recordSeconds: 0,
  recordingLabel: "",
  recordingBlob: null,
  recordings: [],
  backupStatus: "",
};

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  ui.installable = true;
  render();
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  ui.installable = false;
  toast("已添加到主屏幕");
});

document.addEventListener("click", handleClick);
document.addEventListener("change", handleChange);
document.addEventListener("input", handleInput);
window.addEventListener("hashchange", syncHash);

registerServiceWorker();
syncHash();
render();

function render() {
  stopSpeech();
  document.documentElement.dataset.motion = state.settings.reducedMotion ? "reduced" : "full";
  if (!state.onboarded) {
    app.innerHTML = renderOnboarding();
    return;
  }

  if (ui.assessmentActive) {
    app.innerHTML = renderAssessment();
    return;
  }

  if (ui.activeTask) {
    app.innerHTML = renderTaskScreen();
    return;
  }

  if (ui.activeWeekTest !== null) {
    app.innerHTML = renderWeekTest();
    return;
  }
  if (ui.outcomeWeek !== null) {
    app.innerHTML = renderOutcomeSubmission();
    return;
  }

  const view = {
    home: renderHome,
    today: renderSelfStudyToday,
    training: renderTraining,
    records: renderRecords,
    profile: renderProfile,
  }[ui.nav] || renderHome;

  app.innerHTML = `
    <div class="app-shell">
      ${renderAppHeader()}
      <main class="main-view" id="main-content">${view()}</main>
      ${renderBottomNav()}
    </div>
    ${ui.toast ? `<div class="toast" role="status">${escapeHTML(ui.toast)}</div>` : ""}
  `;
  if (ui.nav === "profile") loadRecordings();
}

function renderOnboarding() {
  const step = ui.onboardingStep;
  const progress = step === 0 ? 0 : Math.min(100, (step / 3) * 100);
  return `
    <main class="onboarding">
      ${step > 0 && step < 4 ? `
        <header class="onboard-top">
          <button class="icon-button" data-action="onboard-back" aria-label="返回">${icon("arrow-left")}</button>
          <div class="mini-progress"><span style="width:${progress}%"></span></div>
          <span class="step-count">${step}/3</span>
        </header>` : ""}
      ${step === 0 ? renderWelcome() : ""}
      ${step === 1 ? renderGoalStep() : ""}
      ${step === 2 ? renderScheduleStep() : ""}
      ${step === 3 ? renderPlacementIntro() : ""}
      ${step === 4 ? renderPlacementQuestion() : ""}
      ${step === 5 ? renderPlacementResult() : ""}
    </main>
    ${ui.toast ? `<div class="toast" role="status">${escapeHTML(ui.toast)}</div>` : ""}
  `;
}

function renderWelcome() {
  return `
    <section class="welcome-screen">
      <div class="brand-mark large" aria-hidden="true"><span>e</span><i></i></div>
      <div class="welcome-copy">
        <span class="eyebrow">ECHO ENGLISH</span>
        <h1>每天一点，<br><em>真的开口。</em></h1>
        <p>给你每天清楚的学习行动，也保留自己选择教材的自由。没有登录、没有付费墙，学习记录只留在你的设备。</p>
      </div>
      <div class="welcome-demo" aria-label="每日学习内容示例">
        <div><span>01</span><b>听懂一句</b><small>8 分钟</small></div>
        <div><span>02</span><b>跟着开口</b><small>10 分钟</small></div>
        <div><span>03</span><b>检验掌握</b><small>8 分钟</small></div>
      </div>
      <button class="primary-button wide" data-action="onboard-next">开始制定我的计划 ${icon("arrow-right")}</button>
      <p class="privacy-note">无需注册 · 免费使用 · 支持离线</p>
    </section>
  `;
}

function renderGoalStep() {
  return `
    <section class="onboard-content">
      <span class="eyebrow">先确定学习方向</span>
      <h1>你主要想在哪些场景<br>使用英语？</h1>
      <div class="onboard-structure-note">${icon("map")}<p><b>自学计划是主线</b><small>我安排每天做什么，你自己选择材料；应用里的听力、词汇和小测作为专项训练工具。</small></p></div>
      <div class="field-label mode-goal-label">主要学习方向<span>以后可以切换</span></div>
      <div class="goal-grid">
        ${Object.values(GOALS).map((goal) => `
          <button class="goal-card ${ui.onboarding.goal === goal.id ? "selected" : ""}" data-action="select-goal" data-goal="${goal.id}">
            <span class="goal-icon" style="background:${goal.color}">${goal.icon}</span>
            <span><b>${goal.name}</b><small>${goal.description}</small></span>
            <i class="radio-dot"></i>
          </button>
        `).join("")}
      </div>
      <label class="field-label" for="learner-name">怎么称呼你？<span>选填</span></label>
      <input class="text-field" id="learner-name" data-field="name" value="${escapeAttr(ui.onboarding.name)}" placeholder="例如：小林" maxlength="20">
      <button class="primary-button wide" data-action="onboard-next">继续 ${icon("arrow-right")}</button>
    </section>
  `;
}

function renderScheduleStep() {
  const dayLabels = ["一", "二", "三", "四", "五", "六", "日"];
  return `
    <section class="onboard-content">
      <span class="eyebrow">让计划适合生活</span>
      <h1>每天留多少时间<br>给自己的英语？</h1>
      <div class="time-options">
        ${[20, 40, 60].map((minutes) => `
          <button class="time-option ${Number(ui.onboarding.dailyMinutes) === minutes ? "selected" : ""}" data-action="select-minutes" data-minutes="${minutes}">
            <b>${minutes}</b><span>分钟</span><small>${minutes === 20 ? "轻量" : minutes === 40 ? "推荐" : "进阶"}</small>
          </button>`).join("")}
      </div>
      <div class="schedule-block">
        <div class="field-label">每周学习日<span>建议 5 天，周末复习</span></div>
        <div class="day-pills">
          ${dayLabels.map((label, index) => {
            const value = index + 1;
            return `<button class="day-pill ${ui.onboarding.studyDays.includes(value) ? "selected" : ""}" data-action="toggle-study-day" data-day="${value}">${label}</button>`;
          }).join("")}
        </div>
      </div>
      <label class="field-label" for="reminder-time">提醒时间<span>稍后在“我的”添加到系统日历</span></label>
      <input class="text-field time-field" type="time" id="reminder-time" data-field="reminderTime" value="${escapeAttr(ui.onboarding.reminderTime)}">
      <label class="field-label" for="start-date">计划从哪一天开始？<span>这天就是第 1 周第 1 天</span></label>
      <input class="text-field time-field" type="date" id="start-date" data-field="startDate" value="${escapeAttr(ui.onboarding.startDate)}">
      <p class="date-help">第 1 周将显示为：${weekDateRange(ui.onboarding.startDate, ui.onboarding.studyDays, 0)}。不要求从周一开始。</p>
      <button class="primary-button wide" data-action="onboard-next">继续 ${icon("arrow-right")}</button>
    </section>
  `;
}

function renderPlacementIntro() {
  return `
      <section class="onboard-content placement-intro">
        <div class="illustration-orbit" aria-hidden="true"><span class="orbit-card">✓</span><span class="orbit-dot one"></span><span class="orbit-dot two"></span><div>${icon("map")}</div></div>
        <span class="eyebrow">自学打卡模式</span>
        <h1>教材由你选，<br>行动由计划管</h1>
        <p class="muted">应用不会代替老师或权威教材。它负责每天告诉你做什么、花多久、做到什么程度，并保存材料来源和你的学习证据。</p>
        <div class="feature-list"><div>${icon("calendar")}<span><b>按真实日期滚动</b><small>第 1 周从 ${ui.onboarding.startDate} 开始，不强制周一</small></span></div><div>${icon("refresh")}<span><b>12 周后继续下一周期</b><small>长期循环，换材料、调难度、继续攻克弱项</small></span></div></div>
        <button class="primary-button wide" data-action="finish-self-onboarding">生成我的长期自学计划</button>
      </section>`;
}

function renderPlacementQuestion() {
  const question = PLACEMENT_QUESTIONS[ui.placementIndex];
  if (!question) return renderPlacementResult();
  const selected = ui.placementAnswers[question.id];
  return `
    <section class="test-screen">
      <header class="test-header">
        <button class="icon-button" data-action="placement-prev" aria-label="上一题">${icon("arrow-left")}</button>
        <div class="test-progress"><span style="width:${((ui.placementIndex + 1) / PLACEMENT_QUESTIONS.length) * 100}%"></span></div>
        <span>${ui.placementIndex + 1}/${PLACEMENT_QUESTIONS.length}</span>
      </header>
      <div class="question-meta"><span>${question.category}</span><i>·</i><span>${question.level}</span></div>
      ${question.speak ? `
        <button class="listen-orb" data-action="speak-text" data-text="${escapeAttr(question.speak)}">
          ${icon("volume")}<span>点击播放，可重复听</span>
        </button>` : ""}
      <h1 class="question-title">${question.prompt}</h1>
      <div class="choice-list">
        ${question.choices.map((choice, index) => `
          <button class="choice-button ${Number(selected) === index ? "selected" : ""}" data-action="placement-answer" data-answer="${index}">
            <span>${String.fromCharCode(65 + index)}</span><b>${choice}</b><i>${icon("check")}</i>
          </button>`).join("")}
      </div>
      <div class="test-actions">
        <button class="text-button" data-action="placement-skip">跳过这题</button>
        <button class="primary-button" data-action="placement-next" ${selected === undefined ? "disabled" : ""}>${ui.placementIndex === PLACEMENT_QUESTIONS.length - 1 ? "查看结果" : "下一题"}</button>
      </div>
    </section>
  `;
}

function renderPlacementResult() {
  const result = ui.placementResult || scorePlacement(ui.placementAnswers);
  const weakest = Object.entries(result.categories).sort((a, b) => (a[1][0] / a[1][1]) - (b[1][0] / b[1][1]))[0]?.[0];
  return `
    <section class="onboard-content result-screen">
      <div class="result-badge"><span>${result.level}</span><small>建议起点</small></div>
      <span class="eyebrow">测评完成</span>
      <h1>你的起点是<br><em>${result.level} ${levelName(result.level)}</em></h1>
      <p class="muted">答对 ${result.total}/${result.max} 题。当前相对薄弱项是${weakest || "词汇"}，计划会增加它的复现次数。</p>
      <div class="score-grid">
        ${Object.entries(result.categories).map(([name, score]) => {
          const percent = Math.round((score[0] / score[1]) * 100);
          return `<div><span>${name}</span><b>${percent}%</b><i><em style="width:${percent}%"></em></i></div>`;
        }).join("")}
      </div>
      <div class="level-switch">
        <span>我想从这里开始</span>
        <div>${["A1", "A2", "B1"].map((level) => `<button class="${result.level === level ? "selected" : ""}" data-action="select-result-level" data-level="${level}">${level}</button>`).join("")}</div>
      </div>
      <button class="primary-button wide" data-action="finish-onboarding">生成我的 12 周内置课程 ${icon("spark")}</button>
    </section>
  `;
}

function renderAssessment() {
  if (ui.assessmentResult) return renderAssessmentResult();
  const question = PLACEMENT_QUESTIONS[ui.assessmentIndex];
  const selected = ui.assessmentAnswers[question.id];
  return `
    <main class="activity-shell assessment-screen">
      <header class="activity-header"><button class="icon-button" data-action="assessment-close" aria-label="退出测评">${icon("close")}</button><div><small>当前水平</small><b>水平测评</b></div><span class="activity-step">${ui.assessmentIndex + 1}/${PLACEMENT_QUESTIONS.length}</span></header>
      <div class="activity-progress"><span style="width:${((ui.assessmentIndex + 1) / PLACEMENT_QUESTIONS.length) * 100}%"></span></div>
      <section class="activity-content">
        <div class="question-meta"><span>${question.category}</span><i>·</i><span>${question.level}</span></div>
        ${question.speak ? `<button class="listen-orb small" data-action="speak-text" data-text="${escapeAttr(question.speak)}">${icon("volume")}<span>播放句子</span></button>` : ""}
        <h1 class="question-title">${question.prompt}</h1>
        <div class="choice-list">${question.choices.map((choice, index) => `<button class="choice-button ${Number(selected) === index ? "selected" : ""}" data-action="assessment-answer" data-answer="${index}"><span>${String.fromCharCode(65 + index)}</span><b>${choice}</b><i>${icon("check")}</i></button>`).join("")}</div>
        <div class="test-actions"><button class="text-button" data-action="assessment-skip">跳过</button>${ui.assessmentIndex ? `<button class="text-button" data-action="assessment-prev">上一题</button>` : ""}<button class="primary-button" data-action="assessment-next" ${selected === undefined ? "disabled" : ""}>${ui.assessmentIndex === PLACEMENT_QUESTIONS.length - 1 ? "查看结果" : "下一题"}</button></div>
      </section>
      ${ui.toast ? `<div class="toast" role="status">${escapeHTML(ui.toast)}</div>` : ""}
    </main>`;
}

function renderAssessmentResult() {
  const result = ui.assessmentResult;
  const snapshot = assessmentSnapshot();
  const change = snapshot.latest ? result.percent - snapshot.latest.percent : null;
  return `
    <main class="activity-shell assessment-screen"><header class="activity-header"><button class="icon-button" data-action="assessment-close">${icon("close")}</button><div><small>测评完成</small><b>本次结果</b></div><span class="activity-step">${result.level}</span></header>
      <section class="activity-content assessment-result">
        <div class="result-badge"><span>${result.level}</span><small>${result.percent}%</small></div>
        <div class="activity-intro"><span class="eyebrow">本次基线</span><h1>答对 ${result.total}/${result.max} 题</h1><p>${change === null ? "保存后，以后的测评会和本次对比。" : `较上次 ${change >= 0 ? "提升" : "下降"} ${Math.abs(change)} 个百分点。`}</p></div>
        <div class="score-grid">${Object.entries(result.categories).map(([name, score]) => { const percent = Math.round((score[0] / score[1]) * 100); return `<div><span>${name}</span><b>${percent}%</b><i><em style="width:${percent}%"></em></i></div>`; }).join("")}</div>
        <div class="sticky-action"><button class="primary-button wide" data-action="save-assessment">保存本次结果</button></div>
      </section>
    </main>`;
}

function assessmentSnapshot() {
  const history = Array.isArray(state.profile.assessmentHistory) ? state.profile.assessmentHistory : [];
  const latest = history.at(-1) || (state.profile.placement?.completedAt ? state.profile.placement : null);
  const previous = history.length > 1 ? history.at(-2) : null;
  return { history, latest, previous, delta: latest && previous ? latest.percent - previous.percent : null };
}

function renderAppHeader() {
  const greeting = greetingForHour();
  const displayName = state.profile.name ? `，${escapeHTML(state.profile.name)}` : "";
  return `
    <header class="app-header">
      <button class="mini-brand" data-nav="home" aria-label="Echo 首页"><span>e</span><i></i></button>
      <div class="header-greeting"><small>${greeting}${displayName}</small><b>${navTitle(ui.nav)}</b></div>
      <button class="streak-pill" data-nav="records" aria-label="连续学习 ${state.stats.streak} 天">🔥 <b>${state.stats.streak}</b></button>
    </header>
  `;
}

function renderBottomNav() {
  const navItems = [
    ["home", "home", "首页"],
    ["today", "map", "今日计划"],
    ["training", "cards", "专项训练"],
    ["records", "chart", "学习记录"],
    ["profile", "user", "我的"],
  ];
  return `
    <nav class="bottom-nav" aria-label="主要导航">
      ${navItems.map(([id, iconName, label]) => `
        <button class="${ui.nav === id ? "active" : ""}" data-nav="${id}">
          <span>${icon(iconName)}</span>
          <small>${label}</small>
        </button>`).join("")}
    </nav>
  `;
}

function renderHome() {
  const plan = getSelfStudyPlan(state.course.currentDay, state.profile.goal, state.profile.dailyMinutes);
  const weekCompleted = state.course.completedDays.filter((day) => Math.floor(day / 5) === Math.floor(state.course.currentDay / 5)).length;
  const latestWeek = Math.max(0, Math.floor((Math.max(1, state.course.currentDay) - 1) / 5));
  const latestWeekCompleted = state.course.completedDays.filter((day) => Math.floor(day / 5) === latestWeek).length;
  const cyclePercent = Math.round(((plan.dayInCycle - 1) / 60) * 100);
  const todayRecord = state.course.selfStudyRecords?.[plan.id];
  const todayProgress = plan.tasks.filter((task) => todayRecord?.tasks?.[task.key]).length;
  const unresolved = Object.values(state.course.selfStudyRecords || {}).filter((record) => record.questions?.trim() && !record.questionsResolved).length;
  const assessment = assessmentSnapshot();
  return `<section class="home-view">
    <article class="home-welcome"><small>${formatScheduledDate(state.profile.startDate || state.course.startDate, state.profile.studyDays, state.course.currentDay)}</small><h1>${state.profile.name ? `${escapeHTML(state.profile.name)}，` : ""}今天继续一点</h1><p>第 ${plan.cycleNumber} 周期 · 第 ${plan.weekNumber} 周 · ${plan.weekTitle}</p><div class="home-cycle-progress"><i><span style="width:${cyclePercent}%"></span></i><small>本周期 ${cyclePercent}%</small></div></article>
    <div class="home-metrics"><div><span>🔥</span><b>${state.stats.streak}</b><small>连续天数</small></div><div><span>✓</span><b>${weekCompleted}/5</b><small>本周打卡</small></div><div><span>⏱</span><b>${state.stats.totalMinutes}</b><small>累计分钟</small></div></div>
    <button class="level-snapshot" data-action="start-assessment"><span>${icon("target")}</span><div><small>当前水平</small><b>${assessment.latest ? `${assessment.latest.level} · ${assessment.latest.percent}%` : "还没有基线"}</b><em>${assessment.latest ? `${formatDateTime(assessment.latest.completedAt)}${assessment.delta === null ? "" : ` · ${assessment.delta >= 0 ? "+" : ""}${assessment.delta}%`}` : "完成 24 题，之后可重复对比"}</em></div><i>${assessment.latest ? "重新测评" : "开始测评"} ${icon("chevron-right")}</i></button>
    <div class="section-heading"><div><span>开始学习</span><small>一条主线，一个工具箱</small></div></div>
    <div class="home-entry-grid">
      <button class="home-entry primary" data-nav="today"><span>${icon("map")}</span><div><small>主要任务</small><h2>自学打卡</h2><p>今天：${plan.title}</p></div><i>${todayProgress}/${plan.tasks.length} 项 ${icon("chevron-right")}</i></button>
      <button class="home-entry" data-nav="training"><span>${icon("cards")}</span><div><small>按需使用</small><h2>专项训练</h2><p>听力、词汇、跟读、口语和小测</p></div><i>进入工具箱 ${icon("chevron-right")}</i></button>
    </div>
    <article class="home-week-card"><div><small>本周进度 · ${weekDateRange(state.profile.startDate || state.course.startDate, state.profile.studyDays, Math.floor(state.course.currentDay / 5))}</small><h2>${plan.weekTitle}</h2><p>${plan.weekOutcome}</p></div><div class="day-dots">${[0,1,2,3,4].map((day) => `<i class="${day < weekCompleted ? "done" : day === plan.dayInWeek - 1 ? "current" : ""}">${day < weekCompleted ? icon("check") : day + 1}</i>`).join("")}</div><button class="secondary-button" data-action="open-outcome" data-week="${latestWeek}">${latestWeekCompleted >= 5 ? `${state.course.outcomes?.[`week-${latestWeek + 1}`]?.submittedAt ? "查看或更新" : "提交"}第 ${latestWeek + 1} 周成果` : `完成 ${5 - latestWeekCompleted} 天后提交成果`}</button></article>
    ${unresolved ? `<button class="question-reminder" data-nav="records">${icon("search")}<span><b>${unresolved} 个问题还没解决</b><small>去学习记录中继续核对</small></span>${icon("chevron-right")}</button>` : ""}
  </section>`;
}

function renderTraining() {
  const lesson = currentLesson();
  const record = getDayRecord(lesson.id);
  const standardTasks = ["listen", "shadow", "words", "speak", "quiz"];
  const minimumTasks = ["listen", "speak", "quiz"];
  const tasks = ui.mode === "minimum" ? minimumTasks : standardTasks;
  const completed = tasks.filter((key) => record.tasks?.[key]).length;
  const progress = Math.round((completed / tasks.length) * 100);
  const allDone = completed === tasks.length;
  const weekTestDue = lesson.dayInWeek === 1 && lesson.weekNumber > 1 && !state.training.weeklyTests[lesson.weekNumber - 1];
  const markup = `
    <section class="today-view training-view">
      <article class="training-intro"><span>${icon("cards")}</span><div><small>专项训练</small><h1>哪里薄弱，练哪里</h1><p>按需练习，不影响自学打卡进度。</p></div></article>
      ${weekTestDue ? renderWeekTestBanner(lesson.weekNumber - 1) : ""}
      <div class="lesson-hero">
        <div class="hero-topline">
          <span>专项第 ${lesson.weekNumber} 周 · 第 ${lesson.dayInWeek} 天</span>
          <button class="mode-toggle" data-action="toggle-mode">${ui.mode === "standard" ? "40 分钟" : "10 分钟"} ${icon("chevron")}</button>
        </div>
        <h1>${lesson.week.title}</h1>
        <p>${lesson.focus.name}：${lesson.focus.hint} ${lesson.levelTip}</p>
        <div class="hero-progress">
          <i><span style="width:${progress}%"></span></i><small>${completed}/${tasks.length} 项</small>
        </div>
        <div class="hero-leaf" aria-hidden="true">${leafIllustration()}</div>
      </div>

      <div class="training-set-summary"><span><b>本组内容</b><small>3 道听力 · ${lesson.words.length} 张词汇卡 · ${lesson.quiz.length} 道小测</small></span><button data-action="change-training-set">换一组</button></div>

      ${ui.mode === "minimum" ? `
        <div class="minimum-note">${icon("bolt")}<span><b>今天很忙？完成最低任务也算坚持。</b><small>10 分钟模式记录学习，但不推进正式课程天数。</small></span></div>
      ` : ""}

      <div class="section-heading"><div><span>今日训练</span><small>${ui.mode === "standard" ? `${state.profile.dailyMinutes} 分钟标准计划` : "10 分钟保底计划"}</small></div><b>${progress}%</b></div>
      <div class="task-list">
        ${tasks.map((key, index) => renderTaskCard(key, lesson, record, index)).join("")}
      </div>

      ${allDone ? `
        <div class="completion-card">
          <span>🌱</span><div><b>${ui.mode === "standard" ? "今天的学习完成了！" : "保住了今天的节奏！"}</b><small>${ui.mode === "standard" ? "把新表达带进真实生活吧。" : "有时间时再回来完成标准计划。"}</small></div>
          <button class="primary-button" data-action="complete-day">${ui.mode === "standard" ? "完成并继续" : "记录 10 分钟"}</button>
        </div>` : ""}
    </section>`;
  return markup;
}

function renderSelfStudyToday() {
  const plan = getSelfStudyPlan(state.course.currentDay, state.profile.goal, state.profile.dailyMinutes);
  const record = getSelfStudyRecord(plan.id);
  record.planTitle = plan.title;
  const completed = plan.tasks.filter((task) => record.tasks?.[task.key]).length;
  const progress = Math.round((completed / plan.tasks.length) * 100);
  const allDone = completed === plan.tasks.length;
  const scheduledDate = formatScheduledDate(state.profile.startDate || state.course.startDate, state.profile.studyDays, state.course.currentDay);
  return `
    <section class="today-view self-study-view">
      <div class="mode-notice">${icon("shield")}<span><b>材料由你选</b><small>这里安排动作和验收标准。</small></span><button data-nav="training">专项训练</button></div>
      <div class="lesson-hero self-hero">
        <div class="hero-topline"><span>第 ${plan.cycleNumber} 周期 · 第 ${plan.weekNumber} 周 · 第 ${plan.dayInWeek} 天</span><em>${scheduledDate}</em></div>
        <h1>${plan.title}</h1>
        <p>${plan.purpose}</p>
        <div class="hero-progress"><i><span style="width:${progress}%"></span></i><small>${completed}/${plan.tasks.length} 项</small></div>
        <div class="hero-leaf" aria-hidden="true">${leafIllustration()}</div>
      </div>
      <article class="week-objective-card"><small>本周能力目标 · ${weekDateRange(state.profile.startDate || state.course.startDate, state.profile.studyDays, Math.floor(plan.courseDay / 5))}</small><h2>${plan.weekTitle}</h2><p>${plan.weekOutcome}</p><span>建议主题：${plan.guide}</span></article>
      <div class="section-heading"><div><span>今日行动清单</span><small>${state.profile.dailyMinutes} 分钟 · 完成标准写得清清楚楚</small></div><b>${progress}%</b></div>
      <div class="self-task-list">
        ${plan.tasks.map((task, index) => `
          <label class="self-task-card ${record.tasks?.[task.key] ? "done" : ""}">
            <input type="checkbox" data-self-task="${task.key}" ${record.tasks?.[task.key] ? "checked" : ""}>
            <i>${record.tasks?.[task.key] ? icon("check") : String(index + 1).padStart(2, "0")}</i>
            <span><b>${task.title}</b><small>${task.detail}</small><em>验收：${task.evidence}</em></span><strong>${task.minutes} 分钟</strong>
          </label>`).join("")}
      </div>
      <article class="reflection-card">
        <label>大意或今天学到了什么<textarea data-self-field="summary" placeholder="用自己的话写，不用抄原文">${escapeHTML(record.summary || "")}</textarea></label>
        <label>没解决的问题<textarea data-self-field="questions" placeholder="保留疑问，之后可以换资料交叉核对">${escapeHTML(record.questions || "")}</textarea></label>
        <label>下一次要调整什么<textarea data-self-field="nextStep" placeholder="只写一个具体调整就够了">${escapeHTML(record.nextStep || "")}</textarea></label>
      </article>
      ${allDone ? `<div class="completion-card"><span>✅</span><div><b>今天的行动完成了</b><small>完成复盘后即可打卡。</small></div><button class="primary-button" data-action="complete-self-day">完成打卡并继续</button></div>` : ""}
    </section>
  `;
}

function getSelfStudyRecord(id) {
  if (!state.course.selfStudyRecords) state.course.selfStudyRecords = {};
  if (!state.course.selfStudyRecords[id]) {
    state.course.selfStudyRecords[id] = { id, tasks: {}, source: {}, summary: "", questions: "", nextStep: "", createdAt: new Date().toISOString() };
  }
  state.course.selfStudyRecords[id].id = id;
  return state.course.selfStudyRecords[id];
}

function renderTaskCard(key, lesson, record, index) {
  const meta = {
    listen: ["headphones", "精听", "3 道听力题，逐题反馈", 8],
    shadow: ["repeat", "跟读", "3 句跟读，模仿节奏", 8],
    words: ["cards", "词汇", `${lesson.words.length} 张高频表达卡`, 8],
    speak: ["mic", "开口", "用自己的信息完成表达", 10],
    quiz: ["check-circle", "小测", "3 题检验，立即得到反馈", 6],
  }[key];
  const done = Boolean(record.tasks?.[key]);
  return `
    <button class="task-card ${done ? "done" : ""}" data-action="start-task" data-task="${key}">
      <span class="task-number">${done ? icon("check") : String(index + 1).padStart(2, "0")}</span>
      <i class="task-icon">${icon(meta[0])}</i>
      <span class="task-copy"><b>${meta[1]}</b><small>${meta[2]}</small></span>
      <span class="task-time">${done ? "已完成" : `${meta[3]} 分钟`}</span>
      ${icon("chevron-right")}
    </button>
  `;
}

function renderWeekTestBanner(weekNumber) {
  return `
    <button class="week-test-banner" data-action="start-week-test" data-week="${weekNumber - 1}">
      <span>${icon("award")}</span><div><small>上一周完成</small><b>第 ${weekNumber} 周学习检验</b><em>5 道客观题 + 1 段口语复盘</em></div>${icon("arrow-right")}
    </button>
  `;
}

function renderTaskScreen() {
  const lesson = currentLesson();
  const names = { listen: "精听", shadow: "跟读", words: "词汇", speak: "开口", quiz: "小测" };
  const bodies = {
    listen: () => renderListeningTask(lesson),
    shadow: () => renderShadowTask(lesson),
    words: () => renderWordsTask(lesson),
    speak: () => renderSpeakingTask(lesson),
    quiz: () => renderQuizTask(lesson),
  };
  return `
    <main class="activity-shell">
      <header class="activity-header">
        <button class="icon-button" data-action="close-task" aria-label="退出练习">${icon("close")}</button>
        <div><small>第 ${lesson.weekNumber} 周 · 第 ${lesson.dayInWeek} 天</small><b>${names[ui.activeTask]}</b></div>
        <span class="activity-step">${icon(taskIcon(ui.activeTask))}</span>
      </header>
      <div class="activity-progress"><span style="width:${taskProgress()}%"></span></div>
      <section class="activity-content">${bodies[ui.activeTask]?.() || ""}</section>
      ${ui.feedback ? renderFeedbackSheet() : ""}
      ${ui.toast ? `<div class="toast" role="status">${escapeHTML(ui.toast)}</div>` : ""}
    </main>
  `;
}

function withTrainingState(callback) {
  const selfCourse = state.course;
  state.course = state.training;
  try { return callback(); }
  finally { state.course = selfCourse; }
}

function renderListeningTask(lesson) {
  const set = lesson.listeningSet || [lesson.listening];
  const itemIndex = Math.min(Number(ui.taskTemp.listenIndex) || 0, set.length - 1);
  const item = set[itemIndex];
  const selected = ui.taskTemp.listenAnswers?.[itemIndex];
  const checked = Boolean(ui.taskTemp.listenChecked?.[itemIndex]);
  return `
    <div class="activity-intro inline"><div><span class="eyebrow">先听，不看英文</span><h1>${itemIndex + 1} / ${set.length}</h1></div><p>听关键词，选主要意思。</p></div>
    <button class="audio-player" data-action="speak-text" data-text="${escapeAttr(item.text)}">
      <span>${icon("volume")}</span><div class="fake-wave">${waveBars(28)}</div><small>0:04</small>
    </button>
    <div class="listen-speed"><span>语速</span>${[0.72, 0.86, 1].map((rate) => `<button class="${Number(state.settings.voiceRate) === rate ? "active" : ""}" data-action="voice-rate" data-rate="${rate}">${rate === 0.72 ? "慢" : rate === 0.86 ? "正常" : "原速"}</button>`).join("")}</div>
    <h2 class="activity-question">${item.prompt}</h2>
    <div class="choice-list compact">
      ${item.choices.map((choice, index) => {
        const status = checked ? (index === item.answer ? "correct" : Number(selected) === index ? "wrong" : "") : Number(selected) === index ? "selected" : "";
        return `<button class="choice-button ${status}" data-action="listen-answer" data-answer="${index}" ${checked ? "disabled" : ""}><span>${String.fromCharCode(65 + index)}</span><b>${choice}</b><i>${icon(status === "correct" ? "check" : status === "wrong" ? "close" : "check")}</i></button>`;
      }).join("")}
    </div>
    <div class="sticky-action"><button class="primary-button wide" data-action="check-listen" ${selected === undefined || checked ? "disabled" : ""}>检查答案</button></div>
  `;
}

function renderShadowTask(lesson) {
  const samples = lesson.shadowSamples || [lesson.sample];
  return `
    <div class="activity-intro"><span class="eyebrow">听一句，跟一句</span><h1>模仿节奏，<br>不追求完美口音</h1><p>先听 2 次，再按住自己的速度说出来。</p></div>
    <div class="shadow-sentence-list">${samples.map((sample, index) => `<div class="model-sentence"><span>句子 ${index + 1}</span><h2>${sample.en}</h2><p>${sample.zh}</p><button data-action="speak-text" data-text="${escapeAttr(sample.en)}">${icon("volume")} 播放范读</button></div>`).join("")}</div>
    ${renderRecordPanel(`第${lesson.dayNumber}天跟读`, lesson.courseDay, "shadow")}
    <div class="self-check">
      <span>完成后自己听一遍</span>
      <label><input type="checkbox" data-temp="shadowClear" ${ui.taskTemp.shadowClear ? "checked" : ""}><i></i>句子说完整了</label>
      <label><input type="checkbox" data-temp="shadowRhythm" ${ui.taskTemp.shadowRhythm ? "checked" : ""}><i></i>重音和停顿接近范读</label>
    </div>
    <div class="sticky-action"><button class="primary-button wide" data-action="finish-simple-task" data-task="shadow" ${!ui.taskTemp.shadowClear || !ui.taskTemp.shadowRhythm ? "disabled" : ""}>完成跟读</button></div>
  `;
}

function renderWordsTask(lesson) {
  const index = Math.min(ui.wordIndex, lesson.words.length - 1);
  const word = lesson.words[index];
  return `
    <div class="activity-intro inline"><div><span class="eyebrow">高频表达</span><h1>${index + 1} / ${lesson.words.length}</h1></div><p>先回想含义，再翻开卡片。</p></div>
    <div class="word-card ${ui.wordRevealed ? "revealed" : ""}" data-action="reveal-word" role="button" tabindex="0">
      <span class="word-label">${ui.wordRevealed ? "ENGLISH · 中文" : "ENGLISH"}</span>
      <h2>${word.term}</h2>
      ${ui.wordRevealed ? `<div class="word-answer"><b>${word.meaning}</b><p>${findWordExample(lesson, word.term)}</p><button data-action="speak-text" data-text="${escapeAttr(word.term)}">${icon("volume")} 听发音</button></div>` : `<div class="tap-hint">${icon("rotate")} 点击翻面</div>`}
    </div>
    ${ui.wordRevealed ? `
      <div class="memory-actions">
        <button data-action="rate-word" data-rating="again"><span>再见一次</span><small>今天再复习</small></button>
        <button data-action="rate-word" data-rating="know"><span>记住了</span><small>逐步延长间隔</small></button>
      </div>` : ""}
    <div class="dot-progress">${lesson.words.map((_, dot) => `<i class="${dot <= index ? "active" : ""}"></i>`).join("")}</div>
  `;
}

function renderSpeakingTask(lesson) {
  return `
    <div class="activity-intro"><span class="eyebrow">轮到你说</span><h1>把今天的表达<br>换成你的信息</h1><p>${lesson.speaking.prompt}</p></div>
    <details class="model-details">
      <summary>需要一点提示？看参考表达 ${icon("chevron")}</summary>
      <div><p>${lesson.speaking.model}</p><button data-action="speak-text" data-text="${escapeAttr(lesson.speaking.model)}">${icon("volume")} 听参考</button></div>
    </details>
    ${renderRecordPanel(`第${lesson.dayNumber}天开口`, lesson.courseDay, "speaking")}
    <div class="self-check rubric">
      <span>诚实打勾，比机器给个假分数更有用</span>
      <label><input type="checkbox" data-temp="speakComplete" ${ui.taskTemp.speakComplete ? "checked" : ""}><i></i><b>完整</b><small>表达了一个完整意思</small></label>
      <label><input type="checkbox" data-temp="speakUseful" ${ui.taskTemp.speakUseful ? "checked" : ""}><i></i><b>用上新词</b><small>至少用了今天一个表达</small></label>
      <label><input type="checkbox" data-temp="speakFlow" ${ui.taskTemp.speakFlow ? "checked" : ""}><i></i><b>能听懂</b><small>自己回听时大部分清楚</small></label>
    </div>
    <div class="sticky-action"><button class="primary-button wide" data-action="finish-simple-task" data-task="speak" ${!ui.taskTemp.speakComplete || !ui.taskTemp.speakUseful || !ui.taskTemp.speakFlow ? "disabled" : ""}>保存这次开口</button></div>
  `;
}

function renderQuizTask(lesson) {
  const question = normalizeQuizQuestion(lesson.quiz[ui.quizIndex]);
  const selected = ui.quizAnswers[question.id];
  const checked = ui.quizChecked[question.id];
  const isText = question.type === "text";
  return `
    <div class="activity-intro inline"><div><span class="eyebrow">掌握检验</span><h1>${ui.quizIndex + 1} / ${lesson.quiz.length}</h1></div><p>答错会自动进入复习。</p></div>
    <div class="quiz-card">
      <span>${question.type === "text" ? "补全句子" : "选择题"}</span>
      <h2>${question.prompt}</h2>
      ${isText ? `
        <input class="text-field quiz-input ${checked ? (isQuizCorrect(question, selected) ? "correct" : "wrong") : ""}" data-field="quizText" value="${escapeAttr(selected || "")}" placeholder="输入缺少的英文" ${checked ? "disabled" : ""} autocomplete="off" autocapitalize="none">
      ` : `<div class="choice-list compact">${question.choices.map((choice, index) => {
        const status = checked ? (index === question.answer ? "correct" : Number(selected) === index ? "wrong" : "") : Number(selected) === index ? "selected" : "";
        return `<button class="choice-button ${status}" data-action="quiz-answer" data-answer="${index}" ${checked ? "disabled" : ""}><span>${String.fromCharCode(65 + index)}</span><b>${choice}</b><i>${icon(status === "correct" ? "check" : status === "wrong" ? "close" : "check")}</i></button>`;
      }).join("")}</div>`}
      ${checked ? `<div class="answer-explanation ${isQuizCorrect(question, selected) ? "good" : "bad"}">${icon(isQuizCorrect(question, selected) ? "check-circle" : "info")}<span><b>${isQuizCorrect(question, selected) ? "答对了" : `正确答案：${question.answerText ?? question.choices[question.answer]}`}</b><small>${question.explanation}</small></span></div>` : ""}
    </div>
    <div class="sticky-action"><button class="primary-button wide" data-action="quiz-next" ${selected === undefined || selected === "" ? "disabled" : ""}>${!checked ? "检查答案" : ui.quizIndex === lesson.quiz.length - 1 ? "查看成绩" : "下一题"}</button></div>
  `;
}

function renderRecordPanel(label, courseDay, kind) {
  const recording = ui.recordStatus;
  return `
    <div class="record-panel">
      ${ui.recordingBlob ? `
        <div class="record-ready">
          <button class="record-circle small" data-action="play-recording">${icon("play")}</button>
          <div><b>录音已准备好</b><small>${formatSeconds(ui.recordSeconds)} · 只保存在此设备</small></div>
          <button class="icon-button" data-action="discard-recording" aria-label="删除本次录音">${icon("trash")}</button>
        </div>
        <button class="secondary-button wide" data-action="save-current-recording" data-label="${escapeAttr(label)}" data-day="${courseDay}" data-kind="${kind}">${icon("save")} 保存录音</button>
      ` : `
        <button class="record-circle ${recording === "recording" ? "recording" : ""}" data-action="${recording === "recording" ? "stop-recording" : "start-recording"}" aria-label="${recording === "recording" ? "停止录音" : "开始录音"}">
          ${recording === "recording" ? `<i></i>` : icon("mic")}
        </button>
        <b>${recording === "recording" ? formatSeconds(ui.recordSeconds) : "点击开始录音"}</b>
        <small>${recording === "recording" ? "再点一次停止" : "首次使用时，请允许浏览器访问麦克风"}</small>
      `}
    </div>
  `;
}

function renderFeedbackSheet() {
  const feedback = ui.feedback;
  return `
    <div class="feedback-backdrop">
      <div class="feedback-sheet ${feedback.correct ? "correct" : "try"}">
        <span>${icon(feedback.correct ? "sprout" : "lightbulb")}</span>
        <div><small>${feedback.correct ? "NICE WORK" : "再看一眼"}</small><h2>${feedback.title}</h2><p>${feedback.detail}</p></div>
        <button class="primary-button wide" data-action="feedback-continue">${feedback.button || "继续"}</button>
      </div>
    </div>
  `;
}

function renderPlan() {
  if (state.profile.learningMode === "self") return renderSelfStudyPlan();
  const goal = GOALS[state.profile.goal];
  const currentWeek = Math.floor(state.course.currentDay / 5);
  const stats = getCourseStats(state.profile.goal);
  return `
    <section class="plan-view">
      <div class="plan-summary">
        <span class="goal-icon" style="background:${goal.color}">${goal.icon}</span>
        <div><small>${state.profile.level} · 12 周路径</small><h1>${goal.name}</h1><p>${goal.description}</p></div>
      </div>
      <div class="course-numbers"><div><b>${stats.lessons}</b><span>学习日</span></div><div><b>${stats.vocabulary}</b><span>核心表达</span></div><div><b>12</b><span>学习检验</span></div></div>
      <div class="section-heading"><div><span>学习地图</span><small>每周 5 天学习 + 1 次检验</small></div></div>
      <div class="timeline">
        ${COURSE[state.profile.goal].map((week, index) => {
          const doneDays = state.course.completedDays.filter((day) => Math.floor(day / 5) === index).length;
          const status = index < currentWeek ? "done" : index === currentWeek ? "current" : "locked";
          const canTest = doneDays >= 5;
          return `
            <article class="week-row ${status}">
              <div class="week-node">${status === "done" ? icon("check") : index + 1}</div>
              <div class="week-card">
                <div><small>第 ${index + 1} 周 · ${weekDateRange(state.profile.startDate || state.course.startDate, state.profile.studyDays, index)}</small>${index === currentWeek ? "<em>正在学</em>" : ""}</div>
                <h2>${week.title}</h2><p>${week.outcome}</p>
                <div class="day-dots">${[0, 1, 2, 3, 4].map((day) => `<i class="${day < doneDays ? "done" : index === currentWeek && day === state.course.currentDay % 5 ? "current" : ""}">${day < doneDays ? icon("check") : day + 1}</i>`).join("")}</div>
                ${canTest ? `<button class="week-test-link ${state.course.weeklyTests[index + 1] ? "done" : ""}" data-action="start-week-test" data-week="${index}">${icon("award")} ${state.course.weeklyTests[index + 1] ? `已检验 · ${state.course.weeklyTests[index + 1].objectiveScore}%` : "开始本周检验"} ${icon("chevron-right")}</button>` : ""}
              </div>
            </article>`;
        }).join("")}
      </div>
    </section>
  `;
}

function renderSelfStudyPlan() {
  const goal = GOALS[state.profile.goal];
  const plan = getSelfStudyPlan(state.course.currentDay, state.profile.goal, state.profile.dailyMinutes);
  const cycle = getSelfStudyCycle(state.profile.goal, plan.cycleNumber);
  const recordedDays = Object.values(state.course.selfStudyRecords || {}).filter((record) => record.completedAt || record.summary?.trim() || record.source?.title?.trim() || Object.values(record.tasks || {}).some(Boolean)).length;
  return `
    <section class="plan-view">
      <div class="plan-summary self-plan-summary"><span class="goal-icon" style="background:${goal.color}">${goal.icon}</span><div><small>自学打卡 · 第 ${plan.cycleNumber} 个 12 周周期</small><h1>${goal.name}</h1><p>当前周期结束后会自动进入下一周期，不会停止；新周期继续根据记录攻克弱项。</p></div></div>
      <div class="course-numbers"><div><b>${state.course.completedDays.length}</b><span>累计打卡</span></div><div><b>${recordedDays}</b><span>学习记录</span></div><div><b>长期</b><span>循环规划</span></div></div>
      <div class="section-heading"><div><span>第 ${plan.cycleNumber} 周期规划</span><small>开始于 ${formatScheduledDate(state.profile.startDate || state.course.startDate, state.profile.studyDays, (plan.cycleNumber - 1) * 60)}</small></div></div>
      <div class="timeline">
        ${cycle.map((week, index) => {
          const absoluteWeek = (plan.cycleNumber - 1) * 12 + index;
          const doneDays = state.course.completedDays.filter((day) => Math.floor(day / 5) === absoluteWeek).length;
          const status = index < plan.weekNumber - 1 ? "done" : index === plan.weekNumber - 1 ? "current" : "locked";
          return `<article class="week-row ${status}"><div class="week-node">${status === "done" ? icon("check") : index + 1}</div><div class="week-card"><div><small>第 ${index + 1} 周 · ${weekDateRange(state.profile.startDate || state.course.startDate, state.profile.studyDays, absoluteWeek)}</small>${status === "current" ? "<em>正在进行</em>" : ""}</div><h2>${week.title}</h2><p>${week.outcome}</p><span class="week-guide">建议主题：${week.guide}</span><div class="day-dots">${[0,1,2,3,4].map((day) => `<i class="${day < doneDays ? "done" : status === "current" && day === plan.dayInWeek - 1 ? "current" : ""}">${day < doneDays ? icon("check") : day + 1}</i>`).join("")}</div></div></article>`;
        }).join("")}
      </div>
      <div class="cycle-note">${icon("refresh")}<div><b>第 12 周以后怎么办？</b><p>系统自动进入第 ${plan.cycleNumber + 1} 个周期。行动框架保留，但你选择新材料，并依据上个周期的未解决问题调整主题和难度。</p></div></div>
    </section>`;
}

function renderReview() {
  if (state.profile.learningMode === "self") return renderSelfStudyReview();
  const due = dueReviewItems(state);
  const item = due[ui.reviewIndex] || due[0];
  return `
    <section class="review-view">
      <div class="review-hero"><span>${icon("layers")}</span><div><small>间隔复习</small><h1>${due.length ? `今天有 ${due.length} 个表达` : "今天已经复习完了"}</h1><p>${due.length ? "根据你的记忆情况，安排在快要忘记时再见。" : "学过的内容会在合适的时间重新出现。"}</p></div></div>
      ${item ? `
        <div class="review-card-wrap">
          <div class="review-counter">${Math.min(ui.reviewIndex + 1, due.length)} / ${due.length}</div>
          <button class="review-card ${ui.reviewRevealed ? "revealed" : ""}" data-action="reveal-review">
            <span>${ui.reviewRevealed ? "答案" : "你还记得吗？"}</span><h2>${item.term}</h2>
            ${ui.reviewRevealed ? `<b>${item.meaning}</b><p>${item.example || ""}</p>` : `<small>${icon("rotate")} 点击查看意思</small>`}
          </button>
          ${ui.reviewRevealed ? `<div class="memory-actions review"><button data-action="rate-review" data-rating="again"><span>模糊</span><small>稍后再来</small></button><button data-action="rate-review" data-rating="know"><span>记得</span><small>延长间隔</small></button></div>` : ""}
        </div>` : `<div class="empty-state"><span>🌿</span><h2>复习篮是空的</h2><p>完成今天的词汇训练后，新表达会自动来到这里。</p><button class="secondary-button" data-nav="today">去学习</button></div>`}
      <div class="section-heading"><div><span>最近错题</span><small>客观题会自动收集</small></div><b>${state.review.mistakes.length}</b></div>
      <div class="mistake-list">
        ${state.review.mistakes.slice(0, 6).map((mistake) => `<div><span>${icon("info")}</span><p><b>${escapeHTML(mistake.prompt)}</b><small>${escapeHTML(mistake.explanation || mistake.answer || "")}</small></p></div>`).join("") || `<p class="soft-empty">还没有错题，继续保持。</p>`}
      </div>
    </section>
  `;
}

function renderSelfStudyReview() {
  const records = Object.entries(state.course.selfStudyRecords || {})
    .map(([id, record]) => ({ ...record, id }))
    .filter((record) => record.questions?.trim())
    .sort((a, b) => (b.completedAt || "").localeCompare(a.completedAt || ""));
  const openQuestions = records.filter((record) => !record.questionsResolved);
  return `
    <section class="review-view self-review-view">
      <div class="review-hero"><span>${icon("search")}</span><div><small>疑问复盘</small><h1>${openQuestions.length ? `${openQuestions.length} 个问题待核对` : "暂时没有未解决问题"}</h1><p>换一个来源交叉核对，必要时请教可靠的老师；不要因为应用给出一句话就把它当成定论。</p></div></div>
      <div class="section-heading"><div><span>学习过程中留下的问题</span><small>解决后可以标记，记录仍会保留</small></div><b>${records.length}</b></div>
      <div class="self-question-list">
        ${records.map((record) => `<article class="self-question-card ${record.questionsResolved ? "resolved" : ""}">
          <div><small>${formatDateTime(record.completedAt || record.createdAt)}</small><h2>${escapeHTML(record.planTitle || record.source?.title || "自学记录")}</h2></div>
          <p>${escapeHTML(record.questions)}</p>
          ${record.nextStep ? `<span>下次调整：${escapeHTML(record.nextStep)}</span>` : ""}
          <button class="secondary-button" data-action="toggle-self-question" data-record-id="${escapeHTML(record.id)}">${record.questionsResolved ? "重新打开" : "标记为已解决"}</button>
        </article>`).join("") || `<div class="empty-state"><span>🔎</span><h2>还没有留下问题</h2><p>每天学习后，把不确定的地方记下来。它们比假装全懂更有价值。</p><button class="secondary-button" data-nav="today">去学习</button></div>`}
      </div>
    </section>`;
}

function renderRecords() {
  const plan = getSelfStudyPlan(state.course.currentDay, state.profile.goal, state.profile.dailyMinutes);
  const outcomes = Object.values(state.course.outcomes || {}).filter((item) => item.submittedAt).sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  const completedRecords = Object.entries(state.course.selfStudyRecords || {})
    .map(([id, record]) => ({ ...record, id }))
    .filter((record) => record.completedAt)
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt));
  return `<section class="records-view">
    <div class="records-summary"><div><small>第 ${plan.cycleNumber} 周期 · 第 ${plan.weekNumber} 周</small><h1>学习记录</h1><p>打卡、总结、疑问和周期成果都保存在这里。</p></div><span>${state.course.completedDays.length}<small>累计打卡</small></span></div>
    ${renderSelfStudyReview()}
    <div class="section-heading"><div><span>周期成果</span><small>每完成 5 个学习日可提交一次</small></div><b>${outcomes.length}</b></div>
    <div class="outcome-list">${outcomes.map((item) => `<article class="outcome-result-card"><div><small>第 ${item.weekIndex + 1} 周 · ${formatDateTime(item.submittedAt)}</small><h2>${escapeHTML(item.title)}</h2></div><strong>${item.objectiveScore}<small>完成度</small></strong><p>${escapeHTML(item.feedback)}</p><div class="outcome-tags">${item.wordCount ? `<span>${item.wordCount} 词</span>` : ""}<span>${item.evidenceCount} 项证据</span><span>自评 ${item.selfScore}/3</span></div><div class="outcome-actions"><button data-action="open-outcome" data-week="${item.weekIndex}">查看或修改</button><button data-action="copy-outcome" data-week="${item.weekIndex}">复制给老师或 AI 点评</button></div></article>`).join("") || `<p class="soft-empty">完成一周的 5 个学习日后，就可以提交第一份成果。</p>`}</div>
    <div class="section-heading"><div><span>最近打卡</span><small>学习总结</small></div><b>${completedRecords.length}</b></div>
    <div class="learning-log-list">${completedRecords.slice(0,12).map((record) => `<article><span>${icon("check")}</span><div><small>${formatDateTime(record.completedAt)}</small><h2>${escapeHTML(record.planTitle || record.source?.title || "自学记录")}</h2><p>${escapeHTML(record.summary || "")}</p></div></article>`).join("") || `<p class="soft-empty">还没有完成打卡。</p>`}</div>
  </section>`;
}

function renderOutcomeSubmission() {
  const weekIndex = ui.outcomeWeek;
  const firstDay = weekIndex * 5;
  const records = Array.from({ length: 5 }, (_, index) => state.course.selfStudyRecords?.[getSelfStudyPlan(firstDay + index, state.profile.goal, state.profile.dailyMinutes).id]).filter(Boolean);
  const completed = records.filter((record) => record.completedAt).length;
  const draft = state.course.outcomes?.[`week-${weekIndex + 1}`] || {};
  return `<main class="activity-shell outcome-screen"><header class="activity-header"><button class="icon-button" data-action="close-outcome">${icon("close")}</button><div><small>第 ${weekIndex + 1} 周</small><b>提交周期成果</b></div><span class="activity-step">${completed}/5 天</span></header><section class="activity-content">
    <div class="activity-intro"><span class="eyebrow">成果检验</span><h1>交一份能回看的作品</h1><p>应用会检查完成度、长度、证据和前后对比；语言是否准确，需要老师或人工进一步点评。</p></div>
    <article class="outcome-form">
      <label>成果名称<input class="text-field" data-outcome-field="title" value="${escapeAttr(draft.title || "")}" placeholder="例如：2 分钟自我介绍"></label>
      <label>粘贴英文成果或文字稿<textarea data-outcome-field="text" placeholder="可以粘贴作文、演讲稿或录音文字稿">${escapeHTML(draft.text || "")}</textarea></label>
      <label>成果或录音链接（选填）<input class="text-field" data-outcome-field="link" value="${escapeAttr(draft.link || "")}" placeholder="网盘、视频或其他可访问位置"></label>
      <label>本周新使用的表达<textarea data-outcome-field="expressions" placeholder="每行写一个，建议至少 5 个">${escapeHTML(draft.expressions || "")}</textarea></label>
      <div class="outcome-checks"><span>请诚实自评</span>${[["complete","我没有照着原文读完"],["clear","别人基本能听懂或看懂"],["improved","和本周开始相比有进步"]].map(([key,label]) => `<label><input type="checkbox" data-outcome-check="${key}" ${draft.checks?.[key] ? "checked" : ""}><i></i>${label}</label>`).join("")}</div>
    </article>
    <div class="outcome-boundary">${icon("shield")}<p><b>不会假装自动批改</b><small>离线网页无法可靠判断发音和语法。提交后会生成结构化报告，方便你交给老师或之后发给我检查。</small></p></div>
    <button class="primary-button wide" data-action="submit-outcome" ${completed < 5 ? "disabled" : ""}>${completed < 5 ? `还需完成 ${5 - completed} 个学习日` : "提交并生成检验报告"}</button>
  </section></main>`;
}

function renderProgress() {
  const completed = state.course.completedDays.length;
  const cycleDay = state.profile.learningMode === "self" ? state.course.currentDay % 60 : Math.min(60, state.course.currentDay);
  const percent = Math.round((cycleDay / 60) * 100);
  const currentPlan = state.profile.learningMode === "self" ? getSelfStudyPlan(state.course.currentDay, state.profile.goal, state.profile.dailyMinutes) : null;
  const recentDates = Array.from({ length: 14 }, (_, offset) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - offset));
    return date;
  });
  const weekly = [0, 1, 2, 3, 4, 5, 6].map((offset) => {
    const date = new Date(); date.setDate(date.getDate() - (6 - offset));
    const key = localDateKey(date);
    const completedOnDate = state.stats.studyDates.includes(key);
    return { label: ["日", "一", "二", "三", "四", "五", "六"][date.getDay()], value: completedOnDate ? 60 : 8, active: completedOnDate };
  });
  return `
    <section class="progress-view">
      <div class="progress-overview">
        <div class="progress-ring" style="--progress:${percent * 3.6}deg"><span><b>${percent}%</b><small>总进度</small></span></div>
        <div><small>${currentPlan ? `第 ${currentPlan.cycleNumber} 个训练周期` : "12 周目标"}</small><h1>已完成 ${completed}<br>个学习日</h1><p>第 ${currentPlan ? currentPlan.weekNumber : Math.min(12, Math.floor(state.course.currentDay / 5) + 1)} 周 · ${GOALS[state.profile.goal].name}</p></div>
      </div>
      <div class="metric-grid">
        <div><span>🔥</span><b>${state.stats.streak}</b><small>连续天数</small></div>
        <div><span>⏱</span><b>${state.stats.totalMinutes}</b><small>累计分钟</small></div>
        <div><span>✨</span><b>${state.stats.xp}</b><small>成长点数</small></div>
      </div>
      <article class="chart-card"><div class="card-title"><span>最近 7 天</span><small>${weekly.filter((day) => day.active).length} 天学习</small></div><div class="bar-chart">${weekly.map((day) => `<div><i style="height:${day.value}%" class="${day.active ? "active" : ""}"></i><span>${day.label}</span></div>`).join("")}</div></article>
      <article class="calendar-card"><div class="card-title"><span>学习足迹</span><small>最近 14 天</small></div><div class="heat-grid">${recentDates.map((date) => { const key = localDateKey(date); const active = state.stats.studyDates.includes(key); return `<div class="${active ? "active" : ""}" title="${key}"><span>${date.getDate()}</span><small>${["日", "一", "二", "三", "四", "五", "六"][date.getDay()]}</small></div>`; }).join("")}</div></article>
      <article class="milestone-card"><span>${icon("award")}</span><div><small>下一个里程碑</small><b>${currentPlan ? (currentPlan.dayInCycle < 5 ? "完成本周期第一周" : currentPlan.dayInCycle < 30 ? "走完本周期一半" : "完成本周期并进入下一轮") : completed < 5 ? "完成第一周" : completed < 30 ? "走完一半课程" : completed < 60 ? "完成 12 周旅程" : "你完成啦！"}</b><i><em style="width:${percent}%"></em></i></div></article>
    </section>
  `;
}

function renderProfile() {
  const goal = GOALS[state.profile.goal];
  const assessment = assessmentSnapshot();
  const assessmentHistory = assessment.history.slice(-3).reverse();
  return `
    <section class="profile-view">
      <div class="profile-card"><div class="avatar">${escapeHTML((state.profile.name || "E").slice(0, 1).toUpperCase())}</div><div><h1>${escapeHTML(state.profile.name || "英语学习者")}</h1><p>自学打卡 · ${goal.name} · 第 ${Math.floor((state.course.currentDay % 60) / 5) + 1} 周</p></div><button class="icon-button" data-action="edit-profile">${icon("edit")}</button></div>
      <div class="settings-group"><h2>水平测评 <span>${assessment.history.length} 次记录</span></h2>
        <article class="assessment-profile-card ${assessmentHistory.length ? "" : "no-history"}"><div><small>当前基线</small><b>${assessment.latest ? `${assessment.latest.level} · ${assessment.latest.percent}%` : "尚未测评"}</b><span>${assessment.delta === null ? "完成后可持续对比" : `较上次 ${assessment.delta >= 0 ? "+" : ""}${assessment.delta}%`}</span></div><button data-action="start-assessment">${assessment.latest ? "重新测评" : "开始测评"}</button></article>
        ${assessmentHistory.length ? `<div class="assessment-history">${assessmentHistory.map((item, index) => `<div><span>${formatDateTime(item.completedAt)}</span><b>${item.level}</b><em>${item.percent}%${index < assessmentHistory.length - 1 ? ` · ${item.percent - assessmentHistory[index + 1].percent >= 0 ? "+" : ""}${item.percent - assessmentHistory[index + 1].percent}%` : ""}</em></div>`).join("")}</div>` : ""}
      </div>
      <div class="settings-group"><h2>学习设置</h2>
        <button class="setting-row" data-action="change-goal"><span>${icon("target")}</span><div><b>学习路线</b><small>${goal.name}</small></div>${icon("chevron-right")}</button>
        <button class="setting-row" data-action="change-start-date"><span>${icon("calendar")}</span><div><b>计划开始日期</b><small>${state.profile.startDate || state.course.startDate} · 当前周从这天滚动计算</small></div>${icon("chevron-right")}</button>
        <label class="setting-row"><span>${icon("volume")}</span><div><b>范读声音</b><small>浏览器自带英语语音</small></div><input class="switch" type="checkbox" data-setting="sound" ${state.settings.sound ? "checked" : ""}></label>
        <label class="setting-row"><span>${icon("spark")}</span><div><b>减少动画</b><small>更安静的页面效果</small></div><input class="switch" type="checkbox" data-setting="reducedMotion" ${state.settings.reducedMotion ? "checked" : ""}></label>
        <button class="setting-row" data-action="download-calendar"><span>${icon("calendar")}</span><div><b>添加到系统日历</b><small>${state.profile.calendarAddedAt ? "已生成，可再次添加" : `${state.profile.reminderTime} · 每周 ${state.profile.studyDays.length} 天`}</small></div>${icon("download")}</button>
      </div>
      <div class="settings-group"><h2>安装与离线</h2>
        <button class="setting-row" data-action="install-app"><span>${icon("phone")}</span><div><b>添加到手机主屏幕</b><small>${ui.installable ? "点击即可安装" : "像普通 App 一样打开"}</small></div>${icon("chevron-right")}</button>
        <div class="privacy-box">${icon("shield")}<p><b>数据只在你的设备</b><small>没有账号、没有云端数据库。清理浏览器数据前，请先导出备份。</small></p></div>
      </div>
      <div class="settings-group"><h2>数据备份</h2>
        <button class="setting-row" data-action="export-backup"><span>${icon("download")}</span><div><b>导出学习备份</b><small>换手机时保存进度</small></div>${icon("chevron-right")}</button>
        <button class="setting-row" data-action="import-backup"><span>${icon("upload")}</span><div><b>导入学习备份</b><small>恢复已有进度</small></div>${icon("chevron-right")}</button>
        <input type="file" id="backup-file" accept="application/json,.json" hidden>
      </div>
      <div class="settings-group"><h2>我的录音 <span>${ui.recordings.length}</span></h2>
        <div class="recording-list">${renderRecordingList()}</div>
      </div>
      <div class="settings-group danger-zone"><h2>重新开始</h2><button class="setting-row" data-action="reset-progress"><span>${icon("refresh")}</span><div><b>清除所有学习数据</b><small>此操作不可撤销，请先备份</small></div>${icon("chevron-right")}</button></div>
      <footer class="app-footer"><div class="mini-brand"><span>e</span><i></i></div><p>Echo · v1.0<br>Made for small, steady progress.</p></footer>
    </section>
  `;
}

function renderRecordingList() {
  if (!ui.recordings.length) return `<p class="soft-empty">练习中的录音可以选择保存，之后会出现在这里。</p>`;
  return ui.recordings.slice(0, 20).map((recording) => `
    <div class="recording-row"><button data-action="play-saved-recording" data-recording-id="${recording.id}">${icon("play")}</button><div><b>${escapeHTML(recording.label)}</b><small>${formatDateTime(recording.createdAt)} · 第 ${Number(recording.courseDay) + 1} 天</small></div><button class="icon-button" data-action="delete-recording" data-recording-id="${recording.id}">${icon("trash")}</button></div>
  `).join("");
}

function renderWeekTest() {
  const weekIndex = ui.activeWeekTest;
  const test = buildWeekTest(state.profile.goal, weekIndex);
  if (ui.weekTestSpeaking) return renderWeekSpeaking(test, weekIndex);
  const question = test.questions[ui.weekTestIndex];
  const selected = ui.weekTestAnswers[question.id];
  const checked = ui.quizChecked[question.id];
  return `
    <main class="activity-shell week-test-screen">
      <header class="activity-header"><button class="icon-button" data-action="close-week-test">${icon("close")}</button><div><small>第 ${test.weekNumber} 周</small><b>学习检验</b></div><span class="activity-step">${ui.weekTestIndex + 1}/${test.questions.length}</span></header>
      <div class="activity-progress"><span style="width:${((ui.weekTestIndex + 1) / (test.questions.length + 1)) * 100}%"></span></div>
      <section class="activity-content">
        <div class="activity-intro"><span class="eyebrow">客观题</span><h1>${question.prompt}</h1><p>这部分会自动准确判分；答错的内容会进入复习。</p></div>
        ${question.speak ? `<button class="listen-orb small" data-action="speak-text" data-text="${escapeAttr(question.speak)}">${icon("volume")}<span>播放句子</span></button>` : ""}
        <div class="choice-list">${question.choices.map((choice, index) => {
          const status = checked ? (index === question.answer ? "correct" : Number(selected) === index ? "wrong" : "") : Number(selected) === index ? "selected" : "";
          return `<button class="choice-button ${status}" data-action="week-answer" data-answer="${index}" ${checked ? "disabled" : ""}><span>${String.fromCharCode(65 + index)}</span><b>${choice}</b><i>${icon(status === "correct" ? "check" : status === "wrong" ? "close" : "check")}</i></button>`;
        }).join("")}</div>
        ${checked ? `<div class="answer-explanation ${Number(selected) === question.answer ? "good" : "bad"}">${icon(Number(selected) === question.answer ? "check-circle" : "info")}<span><b>${Number(selected) === question.answer ? "回答正确" : `正确答案：${question.choices[question.answer]}`}</b><small>${question.explanation}</small></span></div>` : ""}
        <div class="sticky-action"><button class="primary-button wide" data-action="week-next" ${selected === undefined ? "disabled" : ""}>${checked ? (ui.weekTestIndex === test.questions.length - 1 ? "进入口语复盘" : "下一题") : "检查答案"}</button></div>
      </section>
    </main>
  `;
}

function renderWeekSpeaking(test, weekIndex) {
  const checks = ["weekComplete", "weekKeywords", "weekClear"];
  const ready = checks.every((key) => ui.taskTemp[key]);
  return `
    <main class="activity-shell week-test-screen">
      <header class="activity-header"><button class="icon-button" data-action="close-week-test">${icon("close")}</button><div><small>第 ${test.weekNumber} 周</small><b>口语复盘</b></div><span class="activity-step">${icon("mic")}</span></header>
      <div class="activity-progress"><span style="width:100%"></span></div>
      <section class="activity-content">
        <div class="activity-intro"><span class="eyebrow">最后一步</span><h1>录下本周的<br>真实学习成果</h1><p>${test.speakingPrompt}</p></div>
        <div class="keyword-chips">${test.keywords.map((item) => `<span>${item.term}<small>${item.meaning}</small></span>`).join("")}</div>
        ${renderRecordPanel(`第${test.weekNumber}周口语检验`, weekIndex * 5 + 4, "weekly")}
        <div class="self-check rubric"><span>口语不做虚假的“AI 精准打分”，用可核对标准自评</span>
          <label><input type="checkbox" data-temp="weekComplete" ${ui.taskTemp.weekComplete ? "checked" : ""}><i></i><b>完成任务</b><small>连续说了至少 30 秒</small></label>
          <label><input type="checkbox" data-temp="weekKeywords" ${ui.taskTemp.weekKeywords ? "checked" : ""}><i></i><b>使用表达</b><small>用上至少 3 个本周词组</small></label>
          <label><input type="checkbox" data-temp="weekClear" ${ui.taskTemp.weekClear ? "checked" : ""}><i></i><b>清楚可懂</b><small>回听时能听清大部分内容</small></label>
        </div>
        <div class="sticky-action"><button class="primary-button wide" data-action="finish-week-test" data-week="${weekIndex}" ${ready ? "" : "disabled"}>完成本周检验</button></div>
      </section>
    </main>
  `;
}

async function handleClick(event) {
  const target = event.target.closest("[data-action], [data-nav], summary");
  if (!target) return;
  const nav = target.dataset.nav;
  if (nav) {
    ui.nav = nav;
    ui.activeTask = "";
    history.replaceState(null, "", `#${nav}`);
    render();
    window.scrollTo(0, 0);
    return;
  }
  const action = target.dataset.action;
  if (!action) return;

  if (action === "onboard-next") {
    if (ui.onboardingStep === 2 && ui.onboarding.studyDays.length === 0) return toast("请至少选择一个学习日");
    ui.onboardingStep += 1;
    render(); return;
  }
  if (action === "onboard-back") { ui.onboardingStep = Math.max(0, ui.onboardingStep - 1); render(); return; }
  if (action === "select-goal") { ui.onboarding.goal = target.dataset.goal; render(); return; }
  if (action === "select-minutes") { ui.onboarding.dailyMinutes = Number(target.dataset.minutes); render(); return; }
  if (action === "toggle-study-day") {
    const day = Number(target.dataset.day);
    ui.onboarding.studyDays = ui.onboarding.studyDays.includes(day) ? ui.onboarding.studyDays.filter((item) => item !== day) : [...ui.onboarding.studyDays, day].sort();
    render(); return;
  }
  if (action === "start-placement") { ui.onboardingStep = 4; ui.placementIndex = 0; render(); return; }
  if (action === "finish-self-onboarding") { finishSelfOnboarding(); return; }
  if (action === "skip-placement") {
    ui.placementResult = { ...scorePlacement({}), level: "A1" };
    ui.onboardingStep = 5; render(); return;
  }
  if (action === "placement-answer") {
    const question = PLACEMENT_QUESTIONS[ui.placementIndex];
    ui.placementAnswers[question.id] = Number(target.dataset.answer); render(); return;
  }
  if (action === "placement-prev") {
    if (ui.placementIndex === 0) ui.onboardingStep = 3; else ui.placementIndex -= 1;
    render(); return;
  }
  if (action === "placement-skip") { nextPlacement(true); return; }
  if (action === "placement-next") { nextPlacement(false); return; }
  if (action === "select-result-level") {
    ui.placementResult = { ...(ui.placementResult || scorePlacement(ui.placementAnswers)), level: target.dataset.level };
    render(); return;
  }
  if (action === "finish-onboarding") { finishOnboarding(); return; }
  if (action === "start-assessment") { startAssessment(); return; }
  if (action === "assessment-close") { closeAssessment(); return; }
  if (action === "assessment-answer") {
    const question = PLACEMENT_QUESTIONS[ui.assessmentIndex];
    ui.assessmentAnswers[question.id] = Number(target.dataset.answer); render(); return;
  }
  if (action === "assessment-prev") { ui.assessmentIndex = Math.max(0, ui.assessmentIndex - 1); render(); return; }
  if (action === "assessment-skip") { nextAssessment(true); return; }
  if (action === "assessment-next") { nextAssessment(false); return; }
  if (action === "save-assessment") { saveAssessment(); return; }
  if (action === "toggle-mode") { ui.mode = ui.mode === "standard" ? "minimum" : "standard"; render(); return; }
  if (action === "change-training-set") {
    state.training.currentDay = (Number(state.training.currentDay) + 1) % 60;
    saveState(state); resetTaskUI(); render(); window.scrollTo(0, 0); return;
  }
  if (action === "start-task") { openTask(target.dataset.task); return; }
  if (action === "close-task") { await cleanRecording(); ui.activeTask = ""; resetTaskUI(); render(); return; }
  if (action === "speak-text") { speak(target.dataset.text, Number(target.dataset.rate) || state.settings.voiceRate); return; }
  if (action === "voice-rate") { state.settings.voiceRate = Number(target.dataset.rate); saveState(state); render(); return; }
  if (action === "listen-answer") {
    const index = Number(ui.taskTemp.listenIndex) || 0;
    if (!ui.taskTemp.listenAnswers) ui.taskTemp.listenAnswers = {};
    ui.taskTemp.listenAnswers[index] = Number(target.dataset.answer); render(); return;
  }
  if (action === "check-listen") { checkListening(); return; }
  if (action === "reveal-word") { if (!ui.wordRevealed) { ui.wordRevealed = true; render(); } return; }
  if (action === "rate-word") { rateWord(target.dataset.rating); return; }
  if (action === "finish-simple-task") { completeTask(target.dataset.task); return; }
  if (action === "quiz-answer") {
    const lesson = currentLesson();
    const question = normalizeQuizQuestion(lesson.quiz[ui.quizIndex]);
    ui.quizAnswers[question.id] = Number(target.dataset.answer); render(); return;
  }
  if (action === "quiz-next") { handleQuizNext(); return; }
  if (action === "feedback-continue") { continueFromFeedback(); return; }
  if (action === "complete-day") { completeDay(); return; }
  if (action === "complete-self-day") { completeSelfStudyDay(); return; }
  if (action === "start-week-test") { startWeekTest(Number(target.dataset.week)); return; }
  if (action === "close-week-test") { await cleanRecording(); ui.activeWeekTest = null; resetTaskUI(); render(); return; }
  if (action === "week-answer") {
    const test = buildWeekTest(state.profile.goal, ui.activeWeekTest);
    ui.weekTestAnswers[test.questions[ui.weekTestIndex].id] = Number(target.dataset.answer); render(); return;
  }
  if (action === "week-next") { weekTestNext(); return; }
  if (action === "finish-week-test") { finishWeekTest(Number(target.dataset.week)); return; }
  if (action === "reveal-review") { ui.reviewRevealed = true; render(); return; }
  if (action === "rate-review") { rateReview(target.dataset.rating); return; }
  if (action === "toggle-self-question") {
    const record = state.course.selfStudyRecords?.[target.dataset.recordId];
    if (record) { record.questionsResolved = !record.questionsResolved; saveState(state); render(); }
    return;
  }
  if (action === "open-outcome") {
    const week = Number(target.dataset.week);
    const done = state.course.completedDays.filter((day) => Math.floor(day / 5) === week).length;
    if (done < 5) return toast(`本周还需完成 ${5 - done} 个学习日`);
    ui.outcomeWeek = week; render(); window.scrollTo(0, 0); return;
  }
  if (action === "close-outcome") { ui.outcomeWeek = null; render(); return; }
  if (action === "submit-outcome") { submitOutcome(); return; }
  if (action === "copy-outcome") { await copyOutcomeForReview(Number(target.dataset.week)); return; }
  if (action === "start-recording") { startRecording(); return; }
  if (action === "stop-recording") { stopRecording(); return; }
  if (action === "play-recording") { playBlob(ui.recordingBlob); return; }
  if (action === "discard-recording") { await cleanRecording(); render(); return; }
  if (action === "save-current-recording") { await persistCurrentRecording(target.dataset); return; }
  if (action === "play-saved-recording") { playSavedRecording(target.dataset.recordingId); return; }
  if (action === "delete-recording") { removeSavedRecording(target.dataset.recordingId); return; }
  if (action === "export-backup") { downloadBackup(); return; }
  if (action === "import-backup") { document.querySelector("#backup-file")?.click(); return; }
  if (action === "download-calendar") { await addCalendarReminder(); return; }
  if (action === "install-app") { installApp(); return; }
  if (action === "reset-progress") { resetProgress(); return; }
  if (action === "change-goal") { changeGoal(); return; }
  if (action === "change-start-date") { changeStartDate(); return; }
  if (action === "edit-profile") { editProfile(); return; }
}

function handleChange(event) {
  const input = event.target;
  if (input.dataset.outcomeCheck) {
    const record = getOutcomeDraft();
    if (!record.checks) record.checks = {};
    record.checks[input.dataset.outcomeCheck] = input.checked;
    saveState(state); render(); return;
  }
  if (input.dataset.selfTask) {
    const plan = getSelfStudyPlan(state.course.currentDay, state.profile.goal, state.profile.dailyMinutes);
    const record = getSelfStudyRecord(plan.id);
    record.tasks[input.dataset.selfTask] = input.checked;
    record.updatedAt = new Date().toISOString();
    saveState(state); render();
    return;
  }
  if (input.dataset.temp) {
    ui.taskTemp[input.dataset.temp] = input.checked;
    render();
    return;
  }
  if (input.dataset.setting) {
    state.settings[input.dataset.setting] = input.checked;
    saveState(state); render();
    return;
  }
  if (input.id === "backup-file" && input.files?.[0]) importBackupFile(input.files[0]);
}

function handleInput(event) {
  const input = event.target;
  if (input.dataset.outcomeField) {
    const record = getOutcomeDraft();
    record[input.dataset.outcomeField] = input.value;
    saveState(state); return;
  }
  if (input.dataset.selfField) {
    const plan = getSelfStudyPlan(state.course.currentDay, state.profile.goal, state.profile.dailyMinutes);
    const record = getSelfStudyRecord(plan.id);
    const field = input.dataset.selfField;
    if (["title", "publisher", "url"].includes(field)) record.source[field] = input.value;
    else record[field] = input.value;
    record.updatedAt = new Date().toISOString();
    saveState(state);
    return;
  }
  const field = input.dataset.field;
  if (!field) return;
  if (["name", "reminderTime", "startDate"].includes(field)) ui.onboarding[field] = input.value;
  if (field === "quizText") {
    const lesson = currentLesson();
    ui.quizAnswers[lesson.quiz[ui.quizIndex].id] = input.value;
    const submit = document.querySelector(".sticky-action .primary-button");
    if (submit) submit.disabled = !input.value.trim();
  }
}

function nextPlacement(skipped) {
  const question = PLACEMENT_QUESTIONS[ui.placementIndex];
  if (skipped) ui.placementAnswers[question.id] = -1;
  if (ui.placementIndex < PLACEMENT_QUESTIONS.length - 1) {
    ui.placementIndex += 1;
  } else {
    ui.placementResult = scorePlacement(ui.placementAnswers);
    ui.onboardingStep = 5;
  }
  render();
}

function startAssessment() {
  ui.assessmentActive = true;
  ui.assessmentIndex = 0;
  ui.assessmentAnswers = {};
  ui.assessmentResult = null;
  render();
  window.scrollTo(0, 0);
}

function closeAssessment() {
  ui.assessmentActive = false;
  ui.assessmentResult = null;
  render();
}

function nextAssessment(skipped) {
  const question = PLACEMENT_QUESTIONS[ui.assessmentIndex];
  if (skipped) ui.assessmentAnswers[question.id] = -1;
  if (ui.assessmentIndex < PLACEMENT_QUESTIONS.length - 1) ui.assessmentIndex += 1;
  else ui.assessmentResult = scorePlacement(ui.assessmentAnswers);
  render();
}

function saveAssessment() {
  const result = ui.assessmentResult || scorePlacement(ui.assessmentAnswers);
  const entry = { ...result, id: `assessment-${Date.now()}`, completedAt: new Date().toISOString() };
  const assessmentHistory = Array.isArray(state.profile.assessmentHistory) ? state.profile.assessmentHistory : [];
  state.profile.assessmentHistory = [...assessmentHistory, entry].slice(-12);
  state.profile.placement = entry;
  state.profile.level = entry.level;
  saveState(state);
  ui.assessmentActive = false;
  ui.assessmentResult = null;
  ui.nav = "profile";
  history.replaceState(null, "", "#profile");
  toast("测评结果已保存");
}

function finishOnboarding() {
  const result = ui.placementResult || scorePlacement(ui.placementAnswers);
  const assessment = { ...result, id: `assessment-${Date.now()}`, completedAt: new Date().toISOString() };
  state.profile = {
    ...state.profile,
    name: ui.onboarding.name.trim(),
    learningMode: ui.onboarding.learningMode,
    goal: ui.onboarding.goal,
    level: result.level,
    dailyMinutes: Number(ui.onboarding.dailyMinutes),
    studyDays: ui.onboarding.studyDays,
    reminderTime: ui.onboarding.reminderTime,
    startDate: ui.onboarding.startDate || localDateKey(),
    placement: assessment,
    assessmentHistory: [...(state.profile.assessmentHistory || []), assessment].slice(-12),
  };
  state.course.startDate = state.profile.startDate;
  state.onboarded = true;
  saveState(state);
  ui.nav = "today";
  history.replaceState(null, "", "#today");
  render();
}

function finishSelfOnboarding() {
  state.profile = {
    ...state.profile,
    name: ui.onboarding.name.trim(),
    learningMode: "self",
    goal: ui.onboarding.goal,
    dailyMinutes: Number(ui.onboarding.dailyMinutes),
    studyDays: ui.onboarding.studyDays,
    reminderTime: ui.onboarding.reminderTime,
    startDate: ui.onboarding.startDate || localDateKey(),
  };
  state.course.startDate = state.profile.startDate;
  state.onboarded = true;
  saveState(state);
  ui.nav = "home";
  history.replaceState(null, "", "#home");
  render();
}

function openTask(task) {
  ui.activeTask = task;
  resetTaskUI();
  render();
  window.scrollTo(0, 0);
}

function resetTaskUI() {
  ui.feedback = null;
  ui.wordIndex = 0;
  ui.wordRevealed = false;
  ui.taskTemp = {};
  ui.quizIndex = 0;
  ui.quizAnswers = {};
  ui.quizChecked = {};
  ui.recordStatus = "idle";
  ui.recordSeconds = 0;
  ui.recordingBlob = null;
}

function checkListening() {
  const lesson = currentLesson();
  const set = lesson.listeningSet || [lesson.listening];
  const index = Math.min(Number(ui.taskTemp.listenIndex) || 0, set.length - 1);
  const item = set[index];
  const correct = Number(ui.taskTemp.listenAnswers?.[index]) === item.answer;
  if (!ui.taskTemp.listenChecked) ui.taskTemp.listenChecked = {};
  ui.taskTemp.listenChecked[index] = true;
  if (!correct) {
    addMistake(state, { prompt: item.prompt, answer: item.choices[item.answer], explanation: item.explanation });
    saveState(state);
  }
  ui.feedback = {
    correct,
    title: correct ? "你抓住了主要意思" : "关键词会带你找到答案",
    detail: item.explanation,
    button: index === set.length - 1 ? "完成精听" : "下一题",
    next: index === set.length - 1 ? "complete-listen" : "advance-listen",
  };
  render();
}

function continueFromFeedback() {
  const next = ui.feedback?.next;
  ui.feedback = null;
  if (next === "advance-listen") {
    ui.taskTemp.listenIndex = (Number(ui.taskTemp.listenIndex) || 0) + 1;
    render(); return;
  }
  if (next === "complete-listen") return completeTask("listen");
  if (next === "complete-quiz") return completeTask("quiz");
  render();
}

function rateWord(rating) {
  const lesson = currentLesson();
  const word = lesson.words[ui.wordIndex];
  addReviewItem(state, {
    key: `${state.profile.goal}:${word.term.toLowerCase()}`,
    term: word.term,
    meaning: word.meaning,
    example: findWordExample(lesson, word.term),
    correct: rating === "know",
  });
  saveState(state);
  if (ui.wordIndex < lesson.words.length - 1) {
    ui.wordIndex += 1;
    ui.wordRevealed = false;
    render();
  } else {
    completeTask("words");
  }
}

function completeTask(task) {
  const lesson = currentLesson();
  const record = getDayRecord(lesson.id);
  record.tasks[task] = true;
  record.updatedAt = new Date().toISOString();
  state.training.dayProgress[lesson.id] = record;
  state.stats.xp += task === "quiz" ? 20 : 10;
  saveState(state);
  cleanRecording();
  ui.activeTask = "";
  resetTaskUI();
  toast(`${{ listen: "精听", shadow: "跟读", words: "词汇", speak: "开口", quiz: "小测" }[task]}完成 +${task === "quiz" ? 20 : 10} ✨`);
}

function handleQuizNext() {
  const lesson = currentLesson();
  const question = normalizeQuizQuestion(lesson.quiz[ui.quizIndex]);
  const selected = ui.quizAnswers[question.id];
  if (!ui.quizChecked[question.id]) {
    ui.quizChecked[question.id] = true;
    if (!isQuizCorrect(question, selected)) {
      addMistake(state, {
        prompt: question.prompt,
        answer: question.answerText ?? question.choices[question.answer],
        explanation: question.explanation,
      });
      saveState(state);
    }
    render(); return;
  }
  if (ui.quizIndex < lesson.quiz.length - 1) {
    ui.quizIndex += 1;
    render(); return;
  }
  finishQuiz();
}

function finishQuiz() {
  const lesson = currentLesson();
  const correct = lesson.quiz.filter((raw) => {
    const question = normalizeQuizQuestion(raw);
    return isQuizCorrect(question, ui.quizAnswers[question.id]);
  }).length;
  const record = getDayRecord(lesson.id);
  record.quizScore = Math.round((correct / lesson.quiz.length) * 100);
  state.training.dayProgress[lesson.id] = record;
  saveState(state);
  ui.feedback = {
    correct: correct >= 2,
    title: `${correct} / ${lesson.quiz.length} 题正确`,
    detail: correct === 3 ? "今天的重点已经掌握。" : "答错的内容已经放进复习篮，之后会再次出现。",
    button: "完成今日小测",
    next: "complete-quiz",
  };
  render();
}

function getDayRecord(id) {
  if (!state.training.dayProgress[id]) {
    state.training.dayProgress[id] = { tasks: { listen: false, shadow: false, words: false, speak: false, quiz: false }, createdAt: new Date().toISOString() };
  }
  return state.training.dayProgress[id];
}

function completeDay() {
  const lesson = currentLesson();
  const today = localDateKey();
  if (ui.mode === "minimum") {
    const alreadyLogged = state.training.minimumLog.includes(today);
    if (!alreadyLogged) {
      state.training.minimumLog.push(today);
      state.stats.totalMinutes += 10;
      state.stats.xp += 10;
    }
    markStudyDate(state, today);
    saveState(state);
    toast(alreadyLogged ? "今天的 10 分钟已经记录过了" : "今天的 10 分钟已记录，节奏没有断 🌱");
    return;
  }
  if (state.training.completedDays.includes(lesson.courseDay)) {
    toast("这个学习日已经完成了");
    return;
  }
  if (!state.training.completedDays.includes(lesson.courseDay)) state.training.completedDays.push(lesson.courseDay);
  const record = getDayRecord(lesson.id);
  record.completedAt = new Date().toISOString();
  record.complete = true;
  state.stats.totalMinutes += Number(state.profile.dailyMinutes) || 40;
  state.stats.xp += 30;
  markStudyDate(state, today);
  state.training.lastCompletionDate = today;
  if (state.training.currentDay < 59) state.training.currentDay += 1;
  saveState(state);
  ui.mode = "standard";
  toast(lesson.courseDay === 59 ? "12 周课程全部完成！你做到了 🎉" : `第 ${lesson.dayNumber} 天完成，新的学习日已解锁`);
}

function completeSelfStudyDay() {
  const plan = getSelfStudyPlan(state.course.currentDay, state.profile.goal, state.profile.dailyMinutes);
  const record = getSelfStudyRecord(plan.id);
  record.planTitle = plan.title;
  if (!plan.tasks.every((task) => record.tasks?.[task.key])) return toast("请先完成今天的行动清单");
  if (!record.summary?.trim()) return toast("请先用自己的话写下今天的学习总结");
  if (state.course.completedDays.includes(state.course.currentDay)) return toast("这个学习日已经打卡");
  record.completedAt = new Date().toISOString();
  state.course.completedDays.push(state.course.currentDay);
  state.stats.totalMinutes += Number(state.profile.dailyMinutes) || 40;
  state.stats.xp += 30;
  markStudyDate(state, localDateKey());
  state.course.lastCompletionDate = localDateKey();
  state.course.currentDay += 1;
  saveState(state);
  const next = getSelfStudyPlan(state.course.currentDay, state.profile.goal, state.profile.dailyMinutes);
  toast(plan.dayInCycle === 59 ? `第 ${plan.cycleNumber} 周期完成，已进入第 ${next.cycleNumber} 周期` : `第 ${plan.courseDay + 1} 个学习日已打卡`);
}

function getOutcomeDraft() {
  if (!state.course.outcomes) state.course.outcomes = {};
  const key = `week-${ui.outcomeWeek + 1}`;
  if (!state.course.outcomes[key]) state.course.outcomes[key] = { weekIndex: ui.outcomeWeek, title: "", text: "", link: "", expressions: "", checks: {} };
  return state.course.outcomes[key];
}

function submitOutcome() {
  const draft = getOutcomeDraft();
  const title = draft.title?.trim();
  const text = draft.text?.trim() || "";
  const link = draft.link?.trim() || "";
  const expressions = (draft.expressions || "").split(/\n|,|，/).map((item) => item.trim()).filter(Boolean);
  if (!title) return toast("请先填写成果名称");
  if (!text && !link) return toast("请粘贴文字成果，或填写成果链接");
  const { wordCount, selfScore, evidenceCount, objectiveScore, feedback } = evaluateOutcome({ text, link, expressions, checks: draft.checks });
  Object.assign(draft, { title, text, link, expressions: expressions.join("\n"), wordCount, selfScore, evidenceCount, objectiveScore, feedback, submittedAt: new Date().toISOString() });
  state.stats.xp += 60;
  saveState(state);
  ui.outcomeWeek = null;
  ui.nav = "records";
  history.replaceState(null, "", "#records");
  toast(`成果已提交 · 完成度 ${objectiveScore}%`);
}

async function copyOutcomeForReview(weekIndex) {
  const item = state.course.outcomes?.[`week-${weekIndex + 1}`];
  if (!item?.submittedAt) return toast("还没有可复制的成果");
  const content = [
    `请帮我检查下面这份第 ${weekIndex + 1} 周英语学习成果。`,
    "请分别指出：1. 表达是否自然；2. 语法或用词错误；3. 更好的改写；4. 下周最需要练什么。不要只给分数。",
    "",
    `成果名称：${item.title}`,
    `应用完成度：${item.objectiveScore}%（只代表材料完整度，不代表语言准确率）`,
    `自我检查：${item.selfScore}/3`,
    `本周新表达：\n${item.expressions || "未填写"}`,
    `成果正文：\n${item.text || "未粘贴文字稿"}`,
    item.link ? `成果或录音链接：${item.link}` : "",
  ].filter(Boolean).join("\n");
  try {
    await navigator.clipboard.writeText(content);
    toast("点评材料已复制，可以粘贴给老师或 AI");
  } catch {
    window.prompt("请复制下面的点评材料", content);
  }
}

function startWeekTest(weekIndex) {
  ui.activeWeekTest = weekIndex;
  ui.weekTestIndex = 0;
  ui.weekTestAnswers = {};
  ui.weekTestSpeaking = false;
  resetTaskUI();
  render(); window.scrollTo(0, 0);
}

function weekTestNext() {
  const test = buildWeekTest(state.profile.goal, ui.activeWeekTest);
  const question = test.questions[ui.weekTestIndex];
  const selected = ui.weekTestAnswers[question.id];
  if (!ui.quizChecked[question.id]) {
    ui.quizChecked[question.id] = true;
    if (Number(selected) !== question.answer) {
      addMistake(state, { prompt: question.prompt, answer: question.choices[question.answer], explanation: question.explanation });
      saveState(state);
    }
    render(); return;
  }
  if (ui.weekTestIndex < test.questions.length - 1) {
    ui.weekTestIndex += 1; render();
  } else {
    ui.weekTestSpeaking = true;
    ui.taskTemp = {};
    render();
  }
}

function finishWeekTest(weekIndex) {
  const test = buildWeekTest(state.profile.goal, weekIndex);
  const correct = test.questions.filter((question) => Number(ui.weekTestAnswers[question.id]) === question.answer).length;
  const selfScore = [ui.taskTemp.weekComplete, ui.taskTemp.weekKeywords, ui.taskTemp.weekClear].filter(Boolean).length;
  state.training.weeklyTests[weekIndex + 1] = {
    objectiveScore: Math.round((correct / test.questions.length) * 100),
    speakingScore: Math.round((selfScore / 3) * 100),
    completedAt: new Date().toISOString(),
  };
  state.stats.xp += 60;
  saveState(state);
  cleanRecording();
  ui.activeWeekTest = null;
  ui.nav = "progress";
  resetTaskUI();
  toast(`第 ${weekIndex + 1} 周检验完成 · 客观题 ${correct}/${test.questions.length}`);
}

function rateReview(rating) {
  const due = dueReviewItems(state);
  const item = due[ui.reviewIndex] || due[0];
  if (!item) return;
  addReviewItem(state, { ...item, correct: rating === "know" });
  state.stats.xp += rating === "know" ? 5 : 2;
  saveState(state);
  ui.reviewRevealed = false;
  ui.reviewIndex = 0;
  render();
}

async function startRecording() {
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
    toast("当前浏览器不支持录音，请使用最新版 Chrome、Edge 或 Safari");
    return;
  }
  try {
    recordingStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recordingChunks = [];
    const preferred = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm"].find((type) => MediaRecorder.isTypeSupported(type));
    recorder = preferred ? new MediaRecorder(recordingStream, { mimeType: preferred }) : new MediaRecorder(recordingStream);
    recorder.ondataavailable = (event) => { if (event.data.size) recordingChunks.push(event.data); };
    recorder.onstop = () => {
      ui.recordingBlob = new Blob(recordingChunks, { type: recorder.mimeType || "audio/webm" });
      ui.recordStatus = "ready";
      clearInterval(recordingTimer);
      releaseRecordingStream();
      render();
    };
    recorder.start();
    recordingStartedAt = Date.now();
    ui.recordSeconds = 0;
    ui.recordStatus = "recording";
    recordingTimer = window.setInterval(() => {
      ui.recordSeconds = Math.round((Date.now() - recordingStartedAt) / 1000);
      const label = document.querySelector(".record-panel > b");
      if (label) label.textContent = formatSeconds(ui.recordSeconds);
    }, 500);
    render();
  } catch (error) {
    console.warn(error);
    toast("没有获得麦克风权限。请在浏览器地址栏的权限设置里允许麦克风。");
  }
}

function stopRecording() {
  if (recorder?.state === "recording") recorder.stop();
}

async function cleanRecording() {
  if (recorder?.state === "recording") {
    recorder.onstop = null;
    recorder.stop();
  }
  clearInterval(recordingTimer);
  releaseRecordingStream();
  ui.recordStatus = "idle";
  ui.recordSeconds = 0;
  ui.recordingBlob = null;
  if (activeAudioUrl) URL.revokeObjectURL(activeAudioUrl);
  activeAudioUrl = "";
}

function releaseRecordingStream() {
  recordingStream?.getTracks().forEach((track) => track.stop());
  recordingStream = null;
}

function playBlob(blob) {
  if (!blob) return;
  if (activeAudioUrl) URL.revokeObjectURL(activeAudioUrl);
  activeAudioUrl = URL.createObjectURL(blob);
  new Audio(activeAudioUrl).play();
}

async function persistCurrentRecording(dataset) {
  if (!ui.recordingBlob) return;
  try {
    const id = `${dataset.kind}-${dataset.day}-${Date.now()}`;
    await saveRecording({ id, blob: ui.recordingBlob, label: dataset.label, courseDay: Number(dataset.day), kind: dataset.kind });
    ui.recordingBlob = null;
    ui.recordStatus = "idle";
    toast("录音已保存在这台设备");
  } catch (error) {
    console.warn(error);
    toast("录音保存失败，可能是浏览器存储空间不足");
  }
}

async function loadRecordings() {
  try {
    const recordings = await listRecordings();
    if (JSON.stringify(recordings.map((item) => item.id)) !== JSON.stringify(ui.recordings.map((item) => item.id))) {
      ui.recordings = recordings;
      if (ui.nav === "profile") render();
    }
  } catch (error) {
    console.warn(error);
  }
}

function playSavedRecording(id) {
  const recording = ui.recordings.find((item) => item.id === id);
  if (recording) playBlob(recording.blob);
}

async function removeSavedRecording(id) {
  if (!window.confirm("删除这条录音吗？删除后无法恢复。")) return;
  await deleteRecording(id);
  ui.recordings = ui.recordings.filter((item) => item.id !== id);
  render();
}

function downloadBackup() {
  const data = exportBackup(state);
  downloadBlob(JSON.stringify(data, null, 2), `echo-backup-${localDateKey()}.json`, "application/json");
  toast("学习备份已导出");
}

async function importBackupFile(file) {
  try {
    const value = JSON.parse(await file.text());
    if (!window.confirm("导入会覆盖当前学习进度，确认继续吗？")) return;
    state = validateAndImportBackup(value);
    ui.nav = "today";
    toast("学习进度已恢复");
  } catch (error) {
    toast(error.message || "备份文件无法读取");
  }
}

async function addCalendarReminder() {
  const [hour, minute] = state.profile.reminderTime.split(":").map(Number);
  const chosenStart = state.profile.startDate || state.course.startDate || localDateKey();
  let courseDay = Math.max(0, Number(state.course.currentDay) || 0);
  let start = scheduledDateForDay(chosenStart, state.profile.studyDays, courseDay) || new Date(`${chosenStart}T12:00:00`);
  start.setHours(hour, minute, 0, 0);
  while (start < new Date() && courseDay < state.course.currentDay + 800) {
    courseDay += 1;
    start = scheduledDateForDay(chosenStart, state.profile.studyDays, courseDay);
    start.setHours(hour, minute, 0, 0);
  }
  const end = new Date(start.getTime() + (state.profile.dailyMinutes || 40) * 60000);
  const byDays = state.profile.studyDays.map((day) => ["SU", "MO", "TU", "WE", "TH", "FR", "SA"][day % 7]).join(",");
  const formatICS = (date) => `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}T${String(date.getHours()).padStart(2, "0")}${String(date.getMinutes()).padStart(2, "0")}00`;
  const ics = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Echo//Study Plan//ZH", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", "X-WR-CALNAME:Echo",
    "BEGIN:VEVENT", `UID:echo-${Date.now()}@local`, `DTSTART:${formatICS(start)}`, `DTEND:${formatICS(end)}`,
    `RRULE:FREQ=WEEKLY;BYDAY=${byDays}`, "SUMMARY:Echo · 今日计划", "DESCRIPTION:打开 Echo，完成今天的学习行动和复盘。",
    "BEGIN:VALARM", "TRIGGER:-PT5M", "ACTION:DISPLAY", "DESCRIPTION:今天的学习时间到了", "END:VALARM", "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  const file = new File([ics], "echo-reminder.ics", { type: "text/calendar;charset=utf-8" });
  try {
    if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
      await navigator.share({ title: "Echo 学习提醒", files: [file] });
    } else {
      downloadBlob(ics, file.name, file.type);
    }
    state.profile.calendarAddedAt = new Date().toISOString();
    saveState(state);
    toast("已生成日历事件，请在系统日历中确认");
  } catch (error) {
    if (error?.name !== "AbortError") toast("无法打开系统日历，请稍后重试");
  }
}

async function installApp() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    ui.installable = false;
    render();
    return;
  }
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  window.alert(isIOS ? "在 Safari 底部点“分享”，再选择“添加到主屏幕”。" : "在浏览器菜单中选择“添加到主屏幕”或“安装应用”。");
}

async function resetProgress() {
  if (!window.confirm("确认清除所有学习进度和本机录音吗？建议先导出备份。")) return;
  state = resetState();
  await clearRecordings();
  ui.recordings = [];
  ui.onboardingStep = 0;
  ui.placementAnswers = {};
  ui.placementResult = null;
  history.replaceState(null, "", location.pathname);
  render();
}

function changeGoal() {
  const next = window.prompt("输入路线：daily（日常）、travel（旅行）或 work（职场）", state.profile.goal);
  if (!GOALS[next] || next === state.profile.goal) return;
  if (!window.confirm(`切换到“${GOALS[next].name}”后，课程回到第 1 天。原路线记录仍会保留在备份数据中。继续吗？`)) return;
  state.profile.goal = next;
  state.course.currentDay = 0;
  state.course.completedDays = [];
  state.course.lastCompletionDate = "";
  saveState(state); render();
}

function toggleLearningMode() {
  const next = state.profile.learningMode === "self" ? "course" : "self";
  switchLearningMode(next);
}

function switchLearningMode(next) {
  if (next === state.profile.learningMode) return;
  const label = next === "self" ? "自学打卡模式" : "内置训练模式";
  if (!window.confirm(`切换到“${label}”吗？两种模式的学习进度会分别保存，下次切回来可以继续。`)) return;
  const current = state.profile.learningMode || "course";
  if (!state.course.modeProgress) state.course.modeProgress = {};
  state.course.modeProgress[current] = {
    currentDay: state.course.currentDay,
    completedDays: [...state.course.completedDays],
    lastCompletionDate: state.course.lastCompletionDate,
  };
  const restored = state.course.modeProgress[next] || { currentDay: 0, completedDays: [], lastCompletionDate: "" };
  state.profile.learningMode = next;
  state.course.currentDay = restored.currentDay;
  state.course.completedDays = [...restored.completedDays];
  state.course.lastCompletionDate = restored.lastCompletionDate;
  saveState(state); render();
}

function changeStartDate() {
  const next = window.prompt("输入开始日期，格式为 YYYY-MM-DD", state.profile.startDate || state.course.startDate || localDateKey());
  if (next === null) return;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(next)) return toast("日期格式应为 YYYY-MM-DD，例如 2026-08-13");
  state.profile.startDate = next;
  state.course.startDate = next;
  saveState(state); render();
}

function editProfile() {
  const name = window.prompt("怎么称呼你？", state.profile.name);
  if (name === null) return;
  state.profile.name = name.trim().slice(0, 20);
  saveState(state); render();
}

function normalizeQuizQuestion(raw) {
  if (raw.type === "choice" && raw.answer === undefined) return { ...raw, answer: raw.choices.indexOf(raw.answerText) };
  return raw;
}

function isQuizCorrect(question, answer) {
  if (question.type === "text") return normalizeText(answer) === normalizeText(question.answerText);
  return Number(answer) === question.answer;
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase().replace(/[.,!?']/g, "").replace(/\s+/g, " ");
}

function findWordExample(lesson, term) {
  const match = lesson.week.samples.find((sample) => sample.en.toLowerCase().includes(term.toLowerCase()));
  return match ? `${match.en} · ${match.zh}` : lesson.sample.en;
}

function currentLesson() {
  return getLesson(state.profile.goal, state.training.currentDay, state.profile.level);
}

function taskProgress() {
  if (ui.activeTask === "words") {
    const lesson = currentLesson();
    return ((ui.wordIndex + (ui.wordRevealed ? 0.5 : 0)) / lesson.words.length) * 100;
  }
  if (ui.activeTask === "listen") {
    const lesson = currentLesson();
    const total = (lesson.listeningSet || [lesson.listening]).length;
    const index = Number(ui.taskTemp.listenIndex) || 0;
    return ((index + (ui.taskTemp.listenChecked?.[index] ? 1 : 0)) / total) * 100;
  }
  if (ui.activeTask === "quiz") {
    const lesson = currentLesson();
    return ((ui.quizIndex + 1) / lesson.quiz.length) * 100;
  }
  return 40;
}

function taskIcon(task) {
  return { listen: "headphones", shadow: "repeat", words: "cards", speak: "mic", quiz: "check-circle" }[task];
}

function speak(text, rate = 0.86) {
  if (!state.settings.sound || !window.speechSynthesis) {
    if (!window.speechSynthesis) toast("当前浏览器不支持语音播放");
    return;
  }
  stopSpeech();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = rate;
  const voices = speechSynthesis.getVoices();
  const voice = voices.find((item) => item.lang === "en-US") || voices.find((item) => item.lang.startsWith("en"));
  if (voice) utterance.voice = voice;
  speechSynthesis.speak(utterance);
}

function stopSpeech() {
  if (window.speechSynthesis?.speaking) window.speechSynthesis.cancel();
}

function syncHash() {
  if (!state.onboarded) return;
  const nav = location.hash.replace("#", "");
  const migrated = { plan: "today", review: "records", progress: "records" }[nav] || nav;
  if (["home", "today", "training", "records", "profile"].includes(migrated)) ui.nav = migrated;
}

function toast(message) {
  ui.toast = message;
  render();
  window.setTimeout(() => {
    if (ui.toast === message) { ui.toast = ""; render(); }
  }, 2600);
}

function downloadBlob(content, filename, type) {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = filename; link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function registerServiceWorker() {
  if (import.meta.env.PROD && "serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch((error) => console.warn("离线服务注册失败", error)));
  }
}

function greetingForHour() {
  const hour = new Date().getHours();
  return hour < 6 ? "夜深了" : hour < 11 ? "早上好" : hour < 14 ? "中午好" : hour < 18 ? "下午好" : "晚上好";
}

function navTitle(nav) {
  return { home: "学习首页", today: "今日自学计划", training: "专项训练", records: "学习记录", profile: "设置与数据" }[nav] || "Echo";
}

function levelName(level) {
  return { A1: "基础起步", A2: "日常进阶", B1: "独立表达" }[level] || "基础起步";
}

function waveBars(count) {
  return Array.from({ length: count }, (_, index) => `<i style="height:${22 + ((index * 17) % 62)}%"></i>`).join("");
}

function formatSeconds(seconds) {
  const value = Math.max(0, Number(seconds) || 0);
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
}

function formatDateTime(value) {
  try { return new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value)); }
  catch { return value; }
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character]);
}

function escapeAttr(value) {
  return escapeHTML(value).replace(/'/g, "&#39;");
}

function leafIllustration() {
  return `<svg viewBox="0 0 170 130" aria-hidden="true"><path d="M85 122c5-44 24-75 60-101"/><path d="M101 86c25-6 45 2 57 22-28 7-49-1-57-22Z"/><path d="M117 58c-2-24 8-41 30-51 4 25-6 43-30 51Z"/><path d="M80 108c-20-20-42-25-66-13 18 23 41 27 66 13Z"/><path d="M94 91c-8-23-24-35-48-36 4 25 20 37 48 36Z"/></svg>`;
}

function icon(name) {
  const paths = {
    "arrow-left": `<path d="m15 18-6-6 6-6"/><path d="M9 12h10"/>`,
    "arrow-right": `<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>`,
    "chevron-right": `<path d="m9 18 6-6-6-6"/>`,
    chevron: `<path d="m8 10 4 4 4-4"/>`,
    check: `<path d="m5 12 4 4L19 6"/>`,
    close: `<path d="M18 6 6 18M6 6l12 12"/>`,
    home: `<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/>`,
    map: `<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"/><path d="M9 3v15M15 6v15"/>`,
    layers: `<path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/>`,
    chart: `<path d="M4 19V9M10 19V5M16 19v-8M22 19V2"/>`,
    user: `<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>`,
    headphones: `<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><path d="M4 14h3v6H5a1 1 0 0 1-1-1v-5ZM20 14h-3v6h2a1 1 0 0 0 1-1v-5Z"/>`,
    target: `<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>`,
    shield: `<path d="M12 22s8-3.7 8-10V5l-8-3-8 3v7c0 6.3 8 10 8 10Z"/><path d="m9 12 2 2 4-5"/>`,
    volume: `<path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8 8 0 0 1 0 12"/>`,
    repeat: `<path d="m17 2 4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/>`,
    cards: `<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M8 9h8M8 13h5"/>`,
    mic: `<rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v4M8 22h8"/>`,
    "check-circle": `<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>`,
    bolt: `<path d="m13 2-9 12h7l-1 8 10-13h-7V2Z"/>`,
    award: `<circle cx="12" cy="8" r="6"/><path d="m8 13-2 9 6-3 6 3-2-9"/>`,
    rotate: `<path d="M20 7v5h-5"/><path d="M4 17v-5h5"/><path d="M7.5 7.5A7 7 0 0 1 20 12M4 12a7 7 0 0 0 12.5 4.5"/>`,
    play: `<path d="m8 5 11 7-11 7V5Z"/>`,
    trash: `<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6"/>`,
    save: `<path d="M4 4h14l2 2v14H4V4Z"/><path d="M8 4v6h8V4M8 20v-6h8v6"/>`,
    sprout: `<path d="M12 22V12M12 15C7 15 4 12 4 7c5 0 8 3 8 8ZM12 11c0-5 3-8 8-8 0 5-3 8-8 8Z"/>`,
    lightbulb: `<path d="M9 18h6M10 22h4M8 14a7 7 0 1 1 8 0c-1 .8-1 2-1 2H9s0-1.2-1-2Z"/>`,
    info: `<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>`,
    calendar: `<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>`,
    download: `<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>`,
    upload: `<path d="M12 15V3M7 8l5-5 5 5M5 21h14"/>`,
    phone: `<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M10 18h4"/>`,
    edit: `<path d="m4 20 4-1 11-11-3-3L5 16l-1 4ZM14 7l3 3"/>`,
    refresh: `<path d="M20 6v6h-6M4 18v-6h6"/><path d="M6.5 8A7 7 0 0 1 20 12M4 12a7 7 0 0 0 13.5 4"/>`,
    spark: `<path d="m12 2 1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2ZM19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z"/>`,
  };
  return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.spark}</svg>`;
}
