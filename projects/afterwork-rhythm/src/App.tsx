"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";

type Tab = "today" | "week" | "goals" | "review";
type TaskType = "english" | "guitar" | "ae" | "rest" | "review";

type PlanTask = {
  time: string;
  end: string;
  title: string;
  minutes: number;
  type: TaskType;
  detail: string;
};

type Review = {
  win: string;
  hard: string;
  adjust: string;
  energy: number;
};

type SavedState = {
  completions: Record<string, string[]>;
  notes: Record<string, string>;
  stage: number;
  reviews: Record<string, Review>;
};

const EMPTY_STATE: SavedState = {
  completions: {},
  notes: {},
  stage: 1,
  reviews: {},
};

const plan: Record<number, PlanTask[]> = {
  1: [
    { time: "20:30", end: "21:10", title: "英语", minutes: 40, type: "english", detail: "输入与开口各留一点时间" },
    { time: "21:10", end: "21:20", title: "走动休息", minutes: 10, type: "rest", detail: "喝水、离开屏幕" },
    { time: "21:20", end: "21:55", title: "吉他", minutes: 35, type: "guitar", detail: "慢练，结束前记录一次进步" },
    { time: "21:55", end: "22:25", title: "电视 / 拼图", minutes: 30, type: "rest", detail: "放心休息，不边看边学" },
    { time: "22:25", end: "22:50", title: "AE 轻练", minutes: 25, type: "ae", detail: "只完成一个小练习" },
  ],
  2: [
    { time: "20:30", end: "21:15", title: "AE", minutes: 45, type: "ae", detail: "先模仿，再独立重做一次" },
    { time: "21:15", end: "21:25", title: "走动休息", minutes: 10, type: "rest", detail: "放松眼睛和肩颈" },
    { time: "21:25", end: "22:00", title: "英语", minutes: 35, type: "english", detail: "少量输入，加一次主动表达" },
    { time: "22:00", end: "22:35", title: "电视 / 拼图", minutes: 35, type: "rest", detail: "给大脑切换频道" },
    { time: "22:35", end: "22:50", title: "快速回顾", minutes: 15, type: "review", detail: "写下今天记住的三点" },
  ],
  3: [
    { time: "21:30", end: "22:05", title: "吉他", minutes: 35, type: "guitar", detail: "短时专注，保持手感" },
    { time: "22:05", end: "22:30", title: "英语", minutes: 25, type: "english", detail: "做一轮轻量复习" },
    { time: "22:30", end: "22:55", title: "完全放松", minutes: 25, type: "rest", detail: "看电视、拼图或什么都不做" },
  ],
  4: [
    { time: "20:30", end: "21:10", title: "英语", minutes: 40, type: "english", detail: "把本周薄弱处多练一遍" },
    { time: "21:10", end: "21:20", title: "走动休息", minutes: 10, type: "rest", detail: "喝水、活动一下" },
    { time: "21:20", end: "22:00", title: "吉他", minutes: 40, type: "guitar", detail: "巩固动作，再尝试连起来" },
    { time: "22:00", end: "22:35", title: "拼图 / 电视", minutes: 35, type: "rest", detail: "恢复精力" },
    { time: "22:35", end: "22:50", title: "学习收尾", minutes: 15, type: "review", detail: "整理桌面，写明天第一步" },
  ],
  5: [
    { time: "20:30", end: "21:15", title: "AE", minutes: 45, type: "ae", detail: "做一个能看见结果的小作品" },
    { time: "21:15", end: "22:15", title: "周五放松", minutes: 60, type: "rest", detail: "电视、拼图或与朋友聊天" },
    { time: "22:15", end: "22:35", title: "一周小结", minutes: 20, type: "review", detail: "只总结，不补欠账" },
  ],
  6: [
    { time: "10:00", end: "11:00", title: "吉他深练", minutes: 60, type: "guitar", detail: "拆分难点，中间休息一次" },
    { time: "11:15", end: "12:15", title: "英语长练", minutes: 60, type: "english", detail: "完成一轮输入、复述与记录" },
    { time: "14:30", end: "16:00", title: "AE 项目时间", minutes: 90, type: "ae", detail: "围绕一个小成品持续推进" },
    { time: "16:00", end: "18:00", title: "出门 / 午后休息", minutes: 120, type: "rest", detail: "散步、运动或晒太阳" },
    { time: "20:00", end: "21:00", title: "自由娱乐", minutes: 60, type: "rest", detail: "拼图、电视或随心安排" },
  ],
  0: [
    { time: "14:30", end: "15:15", title: "英语复习", minutes: 45, type: "english", detail: "复盘本周，补一个小缺口" },
    { time: "15:30", end: "16:15", title: "吉他复习", minutes: 45, type: "guitar", detail: "录一小段，观察稳定性" },
    { time: "16:30", end: "17:30", title: "AE 整理", minutes: 60, type: "ae", detail: "收尾作品并整理素材" },
    { time: "17:30", end: "17:50", title: "下周准备", minutes: 20, type: "review", detail: "选出下周三个最小目标" },
    { time: "18:00", end: "20:00", title: "无负担休息", minutes: 120, type: "rest", detail: "晚饭、电视、拼图或外出" },
  ],
};

const dayNames = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
const orderedDays = [1, 2, 3, 4, 5, 6, 0];
const labels: Record<TaskType, string> = { english: "英", guitar: "琴", ae: "AE", rest: "歇", review: "记" };

const stages = [
  {
    name: "阶段 1 · 建立节奏",
    weeks: "第 1–4 周",
    summary: "先把“坐下来开始”变得容易，不追求每天学很多。",
    goals: ["英语每周 5 次，至少 25 分钟", "吉他每周 4 次，动作慢而准确", "AE 每周 3 次，每次完成一个小结果"],
  },
  {
    name: "阶段 2 · 连成能力",
    weeks: "第 5–8 周",
    summary: "把零散练习连接起来，开始留下可比较的作品和记录。",
    goals: ["英语能做 2 分钟连续表达", "吉他能连贯完成一段简单演奏", "AE 每两周完成一段 15–30 秒练习"],
  },
  {
    name: "阶段 3 · 做出成果",
    weeks: "第 9–12 周",
    summary: "用小作品检验进步，再决定下一阶段重点。",
    goals: ["英语完成一篇短文与一次 3 分钟表达", "吉他完整录下一首入门曲目", "AE 完成一支 30–60 秒个人作品"],
  },
];

function dateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function weekKey(date: Date) {
  const monday = new Date(date);
  const day = monday.getDay();
  monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1));
  return dateKey(monday);
}

function taskId(task: PlanTask, index: number) {
  return `${task.time}-${task.title}-${index}`;
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("today");
  const [state, setState] = useState<SavedState>(EMPTY_STATE);
  const [loaded, setLoaded] = useState(false);
  const [today, setToday] = useState(() => new Date());
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("afterwork-rhythm-v1");
      if (saved) setState({ ...EMPTY_STATE, ...JSON.parse(saved) });
    } catch {}
    setToday(new Date());
    setLoaded(true);
    if ("serviceWorker" in navigator) {
      const workerUrl = new URL("sw.js", document.baseURI).pathname;
      navigator.serviceWorker.register(workerUrl).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem("afterwork-rhythm-v1", JSON.stringify(state));
  }, [state, loaded]);

  const key = dateKey(today);
  const thisWeek = weekKey(today);
  const tasks = plan[today.getDay()];
  const completed = state.completions[key] ?? [];
  const currentReview = state.reviews[thisWeek] ?? { win: "", hard: "", adjust: "", energy: 3 };

  const streak = useMemo(() => {
    let count = 0;
    const cursor = new Date(today);
    const todayDone = (state.completions[key]?.length ?? 0) >= tasks.length;
    if (!todayDone) cursor.setDate(cursor.getDate() - 1);
    for (let i = 0; i < 365; i++) {
      const cursorKey = dateKey(cursor);
      const expected = plan[cursor.getDay()].length;
      if ((state.completions[cursorKey]?.length ?? 0) < expected) break;
      count++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }, [state.completions, key, tasks.length, today]);

  const weekStats = useMemo(() => {
    const monday = new Date(today);
    const day = monday.getDay();
    monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1));
    let done = 0;
    let total = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const count = plan[d.getDay()].length;
      total += count;
      done += Math.min(state.completions[dateKey(d)]?.length ?? 0, count);
    }
    return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
  }, [state.completions, today]);

  function toggleTask(id: string) {
    setState((current) => {
      const list = current.completions[key] ?? [];
      const next = list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
      return { ...current, completions: { ...current.completions, [key]: next } };
    });
  }

  function updateReview(field: keyof Review, value: string | number) {
    setState((current) => ({
      ...current,
      reviews: { ...current.reviews, [thisWeek]: { ...currentReview, [field]: value } },
    }));
  }

  const dateText = new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", weekday: "long" }).format(today);
  const focusMinutes = tasks.filter((task) => task.type !== "rest").reduce((sum, task) => sum + task.minutes, 0);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">下班后的成长计划</p>
          <h1>{tab === "today" ? "今天，也前进一点点" : tab === "week" ? "一周，有张有弛" : tab === "goals" ? "十二周，看见改变" : "停下来，才看得清"}</h1>
          <p className="date">{dateText}</p>
        </div>
        <button className="streak" onClick={() => setShowInstall(true)} aria-label={`连续完成 ${streak} 天，查看保存到手机的方法`}>
          <span>连续</span><strong>{streak}</strong><span>天</span>
        </button>
      </header>

      {tab === "today" && (
        <>
          <section className="progress-card">
            <div className="progress-topline">
              <div>
                <p className="progress-kicker">今日进度</p>
                <strong>{completed.length} / {tasks.length}</strong>
              </div>
              <div className="progress-percent">{Math.round((completed.length / tasks.length) * 100)}%</div>
            </div>
            <div className="progress-track" aria-label={`今日完成度 ${Math.round((completed.length / tasks.length) * 100)}%`}>
              <span style={{ width: `${(completed.length / tasks.length) * 100}%` }} />
            </div>
            <div className="progress-foot"><span>{tasks[0].time} 开始</span><span>专注 {focusMinutes} 分钟</span><span>23:00 前收尾</span></div>
          </section>

          <section className="today-section">
            <div className="section-heading">
              <div><p className="eyebrow">TODAY</p><h2>{dayNames[today.getDay()]}安排</h2></div>
              <span className="total-time">完成比完美重要</span>
            </div>
            <div className="task-list">
              {tasks.map((task, index) => {
                const id = taskId(task, index);
                const isDone = completed.includes(id);
                return (
                  <article className={`task-card type-${task.type} ${isDone ? "is-done" : ""}`} key={id}>
                    <div className="task-mark" aria-hidden="true">{labels[task.type]}</div>
                    <div className="task-main">
                      <div className="task-title-row"><h3>{task.title}</h3><span>{task.minutes} 分钟</span></div>
                      <p className="task-time">{task.time}–{task.end}</p>
                      <p className="task-detail">{task.detail}</p>
                    </div>
                    <button className="check-button" onClick={() => toggleTask(id)} aria-pressed={isDone} aria-label={`${isDone ? "取消完成" : "完成"}${task.title}`}>
                      {isDone ? "已完成" : "打卡"}
                    </button>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="note-card">
            <label htmlFor="today-note">今天留下一句话</label>
            <textarea id="today-note" value={state.notes[key] ?? ""} onChange={(event) => setState((current) => ({ ...current, notes: { ...current.notes, [key]: event.target.value } }))} placeholder="比如：开始有点难，但练了十分钟后顺起来了。" rows={3} />
            <p>内容会自动保存在这台设备上。</p>
          </section>
        </>
      )}

      {tab === "week" && (
        <section className="week-view">
          <div className="week-summary">
            <div><p>本周已完成</p><strong>{weekStats.done}<span> / {weekStats.total}</span></strong></div>
            <div className="ring" style={{ "--value": `${weekStats.percent * 3.6}deg` } as CSSProperties}><span>{weekStats.percent}%</span></div>
          </div>
          <div className="week-guidance">
            <strong>节奏提示</strong>
            <p>周三只保留两项轻练；周五不补欠账；周末的长时间学习中间至少休息 15 分钟。</p>
          </div>
          <div className="week-days">
            {orderedDays.map((day) => (
              <details className={`day-card ${day === today.getDay() ? "current" : ""}`} key={day} open={day === today.getDay()}>
                <summary>
                  <div><span>{dayNames[day]}</span><small>{day === 3 ? "21:30 后" : day === 6 ? "全天留白式安排" : day === 0 ? "下午为主" : "20:30 后"}</small></div>
                  <strong>{plan[day].filter((item) => item.type !== "rest").reduce((sum, item) => sum + item.minutes, 0)} 分钟专注</strong>
                </summary>
                <div className="day-timeline">
                  {plan[day].map((item, index) => (
                    <div className={`timeline-row type-${item.type}`} key={`${day}-${index}`}>
                      <span className="timeline-time">{item.time}</span>
                      <span className="timeline-dot" />
                      <div><strong>{item.title}</strong><small>{item.minutes} 分钟 · {item.detail}</small></div>
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

      {tab === "goals" && (
        <section className="goals-view">
          <div className="goal-hero">
            <p>当前阶段</p>
            <h2>{stages[state.stage - 1].name}</h2>
            <span>{stages[state.stage - 1].weeks}</span>
            <p className="goal-summary">{stages[state.stage - 1].summary}</p>
          </div>
          <div className="stage-switch" role="group" aria-label="选择当前学习阶段">
            {stages.map((stage, index) => <button key={stage.name} className={state.stage === index + 1 ? "active" : ""} onClick={() => setState((current) => ({ ...current, stage: index + 1 }))}>{index + 1}</button>)}
          </div>
          <div className="stage-list">
            {stages.map((stage, index) => (
              <article className={`stage-card ${state.stage === index + 1 ? "active" : ""}`} key={stage.name}>
                <div className="stage-number">0{index + 1}</div>
                <div><p>{stage.weeks}</p><h3>{stage.name.split("· ")[1]}</h3><p className="stage-summary">{stage.summary}</p><ul>{stage.goals.map((goal) => <li key={goal}>{goal}</li>)}</ul></div>
              </article>
            ))}
          </div>
          <div className="finish-line"><p className="eyebrow">12 周完成线</p><h3>三件看得见的成果</h3><div><span>英语<br /><strong>3 分钟表达</strong></span><span>吉他<br /><strong>1 首完整录音</strong></span><span>AE<br /><strong>1 支个人作品</strong></span></div></div>
        </section>
      )}

      {tab === "review" && (
        <section className="review-view">
          <div className="review-intro"><p className="eyebrow">WEEKLY REVIEW</p><h2>本周阶段小结</h2><p>用五分钟留下线索。这里不是成绩单，而是下周更轻松的起点。</p></div>
          <div className="review-stat-grid">
            <div><span>完成项</span><strong>{weekStats.done}</strong></div><div><span>完成率</span><strong>{weekStats.percent}%</strong></div><div><span>连续完成</span><strong>{streak} 天</strong></div>
          </div>
          <form className="review-form" onSubmit={(event) => event.preventDefault()}>
            <label>这周最满意的一件事<textarea rows={3} value={currentReview.win} onChange={(event) => updateReview("win", event.target.value)} placeholder="一个小进步就够了……" /></label>
            <label>最容易卡住的地方<textarea rows={3} value={currentReview.hard} onChange={(event) => updateReview("hard", event.target.value)} placeholder="是时间、难度，还是精力？" /></label>
            <label>下周只调整一件事<textarea rows={3} value={currentReview.adjust} onChange={(event) => updateReview("adjust", event.target.value)} placeholder="让计划更容易执行……" /></label>
            <fieldset><legend>这周整体精力</legend><div className="energy-row">{[1, 2, 3, 4, 5].map((value) => <button type="button" className={currentReview.energy === value ? "active" : ""} onClick={() => updateReview("energy", value)} key={value}>{value}</button>)}</div><div className="energy-labels"><span>很疲惫</span><span>精力很好</span></div></fieldset>
          </form>
          <div className="saved-note">已自动保存 · 周五晚或周日下午填写即可</div>
        </section>
      )}

      <nav className="bottom-nav" aria-label="主要功能">
        {([[
          "today", "今", "今天"], ["week", "周", "本周"], ["goals", "标", "目标"], ["review", "记", "总结"]] as [Tab, string, string][]).map(([id, icon, label]) => (
          <button className={tab === id ? "active" : ""} onClick={() => { setTab(id); window.scrollTo({ top: 0, behavior: "smooth" }); }} key={id}><span>{icon}</span>{label}</button>
        ))}
      </nav>

      {showInstall && (
        <div className="modal-backdrop" role="presentation" onClick={() => setShowInstall(false)}>
          <section className="install-modal" role="dialog" aria-modal="true" aria-labelledby="install-title" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowInstall(false)} aria-label="关闭">×</button>
            <p className="eyebrow">保存到手机</p><h2 id="install-title">把它放到手机桌面</h2>
            <div className="install-step"><span>iPhone</span><p>用 Safari 打开网页 → 点底部“分享” → 选择“添加到主屏幕”。</p></div>
            <div className="install-step"><span>安卓</span><p>用 Chrome 打开网页 → 点右上角菜单 → 选择“添加到主屏幕”。</p></div>
            <p className="privacy-note">打卡和总结保存在当前浏览器中。更换手机或清除浏览器数据后，记录不会自动同步。</p>
          </section>
        </div>
      )}
    </main>
  );
}
