const STORAGE_KEY = "echo-english-state-v1";
const DB_NAME = "echo-english-media";
const DB_VERSION = 1;
const RECORDING_STORE = "recordings";

export function createDefaultState() {
  return {
    version: 1,
    onboarded: false,
    profile: {
      name: "",
      learningMode: "self",
      goal: "daily",
      level: "A1",
      dailyMinutes: 40,
      studyDays: [1, 2, 3, 4, 5],
      reminderTime: "20:30",
      startDate: "",
      placement: null,
      assessmentHistory: [],
      calendarAddedAt: "",
    },
    course: {
      currentDay: 0,
      startDate: "",
      completedDays: [],
      dayProgress: {},
      minimumLog: [],
      weeklyTests: {},
      lastCompletionDate: "",
      selfStudyRecords: {},
      modeProgress: {},
      outcomes: {},
    },
    training: {
      currentDay: 0,
      completedDays: [],
      dayProgress: {},
      minimumLog: [],
      weeklyTests: {},
      lastCompletionDate: "",
    },
    review: {
      items: {},
      mistakes: [],
    },
    stats: {
      totalMinutes: 0,
      studyDates: [],
      streak: 0,
      longestStreak: 0,
      xp: 0,
    },
    settings: {
      sound: true,
      voiceRate: 0.86,
      reducedMotion: false,
    },
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultState();
    return mergeState(createDefaultState(), JSON.parse(raw));
  } catch (error) {
    console.warn("无法读取本地学习数据", error);
    return createDefaultState();
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return state;
}

export function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  return createDefaultState();
}

export function exportBackup(state) {
  return {
    app: "Echo",
    formatVersion: 1,
    exportedAt: new Date().toISOString(),
    state,
  };
}

export function validateAndImportBackup(value) {
  if (!value || !["Echo", "Echo English"].includes(value.app) || !value.state || typeof value.state !== "object") {
    throw new Error("这不是有效的 Echo 备份文件");
  }
  const state = mergeState(createDefaultState(), value.state);
  saveState(state);
  return state;
}

export function markStudyDate(state, dateKey = localDateKey()) {
  if (!state.stats.studyDates.includes(dateKey)) state.stats.studyDates.push(dateKey);
  state.stats.studyDates = [...new Set(state.stats.studyDates)].sort();
  state.stats.streak = calculateStreak(state.stats.studyDates, dateKey);
  state.stats.longestStreak = Math.max(state.stats.longestStreak, calculateLongestStreak(state.stats.studyDates));
  return state;
}

export function addReviewItem(state, { key, term, meaning, example, correct = false }) {
  const existing = state.review.items[key] || {
    key,
    term,
    meaning,
    example,
    stage: 0,
    due: localDateKey(),
    seen: 0,
    correct: 0,
  };
  const intervals = [0, 1, 3, 7, 14, 30];
  existing.seen += 1;
  if (correct) {
    existing.correct += 1;
    existing.stage = Math.min(existing.stage + 1, intervals.length - 1);
  } else {
    existing.stage = 0;
  }
  existing.due = addDays(localDateKey(), intervals[existing.stage]);
  state.review.items[key] = existing;
  return existing;
}

export function addMistake(state, mistake) {
  const now = new Date().toISOString();
  state.review.mistakes.unshift({ ...mistake, at: now });
  state.review.mistakes = state.review.mistakes.slice(0, 80);
}

export function dueReviewItems(state, today = localDateKey()) {
  return Object.values(state.review.items)
    .filter((item) => item.due <= today)
    .sort((a, b) => a.due.localeCompare(b.due));
}

export function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(dateKey, count) {
  const date = new Date(`${dateKey}T12:00:00`);
  date.setDate(date.getDate() + count);
  return localDateKey(date);
}

export function calculateStreak(dates, throughDate = localDateKey()) {
  const set = new Set(dates);
  const cursor = new Date(`${throughDate}T12:00:00`);
  if (!set.has(localDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!set.has(localDateKey(cursor))) return 0;
  }
  let streak = 0;
  while (set.has(localDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function calculateLongestStreak(dates) {
  if (!dates.length) return 0;
  const sorted = [...new Set(dates)].sort();
  let longest = 1;
  let current = 1;
  for (let index = 1; index < sorted.length; index += 1) {
    const previous = new Date(`${sorted[index - 1]}T12:00:00`);
    const next = new Date(`${sorted[index]}T12:00:00`);
    const difference = Math.round((next - previous) / 86400000);
    current = difference === 1 ? current + 1 : 1;
    longest = Math.max(longest, current);
  }
  return longest;
}

function mergeState(base, saved) {
  const savedProfile = saved.profile || {};
  const previousMode = Object.prototype.hasOwnProperty.call(savedProfile, "learningMode") ? savedProfile.learningMode : "course";
  const savedCourse = saved.course || {};
  const modeProgress = savedCourse.modeProgress || {};
  const trainingSource = saved.training || (previousMode === "course" ? savedCourse : modeProgress.course || {});
  const selfProgress = previousMode === "self" ? savedCourse : modeProgress.self || {};
  const mergedCourse = {
    ...base.course,
    ...savedCourse,
    currentDay: selfProgress.currentDay ?? 0,
    completedDays: selfProgress.completedDays || [],
    lastCompletionDate: selfProgress.lastCompletionDate || "",
  };
  return {
    ...base,
    ...saved,
    profile: { ...base.profile, ...savedProfile, learningMode: "self" },
    course: mergedCourse,
    training: { ...base.training, ...trainingSource },
    review: { ...base.review, ...(saved.review || {}) },
    stats: { ...base.stats, ...(saved.stats || {}) },
    settings: { ...base.settings, ...(saved.settings || {}) },
  };
}

function openDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("当前浏览器不支持录音存储"));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(RECORDING_STORE)) {
        const store = db.createObjectStore(RECORDING_STORE, { keyPath: "id" });
        store.createIndex("createdAt", "createdAt");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveRecording({ id, blob, label, courseDay, kind = "practice" }) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(RECORDING_STORE, "readwrite");
    tx.objectStore(RECORDING_STORE).put({
      id,
      blob,
      label,
      courseDay,
      kind,
      createdAt: new Date().toISOString(),
    });
    tx.oncomplete = () => resolve(id);
    tx.onerror = () => reject(tx.error);
  }).finally(() => db.close());
}

export async function listRecordings() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(RECORDING_STORE, "readonly");
    const request = tx.objectStore(RECORDING_STORE).getAll();
    request.onsuccess = () => resolve(request.result.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    request.onerror = () => reject(request.error);
  }).finally(() => db.close());
}

export async function deleteRecording(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(RECORDING_STORE, "readwrite");
    tx.objectStore(RECORDING_STORE).delete(id);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  }).finally(() => db.close());
}

export async function clearRecordings() {
  try {
    const db = await openDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(RECORDING_STORE, "readwrite");
      tx.objectStore(RECORDING_STORE).clear();
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch (error) {
    console.warn("无法清除录音", error);
  }
}
