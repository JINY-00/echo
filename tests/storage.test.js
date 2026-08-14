import test from "node:test";
import assert from "node:assert/strict";
import { addDays, calculateStreak, createDefaultState } from "../src/storage.js";

test("默认数据结构适合无账号本地使用", () => {
  const state = createDefaultState();
  assert.equal(state.onboarded, false);
  assert.equal(state.profile.goal, "daily");
  assert.equal(state.course.currentDay, 0);
  assert.deepEqual(state.course.completedDays, []);
  assert.deepEqual(state.profile.assessmentHistory, []);
  assert.equal(state.profile.calendarAddedAt, "");
});

test("连续学习天数计算正确", () => {
  assert.equal(calculateStreak(["2026-08-10", "2026-08-11", "2026-08-12"], "2026-08-12"), 3);
  assert.equal(calculateStreak(["2026-08-10"], "2026-08-12"), 0);
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
});
