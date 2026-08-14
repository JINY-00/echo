import test from "node:test";
import assert from "node:assert/strict";
import { evaluateOutcome, formatScheduledDate, getSelfStudyCycle, getSelfStudyPlan, weekDateRange } from "../src/planner.js";

test("自学打卡每 60 天进入新周期但不会结束", () => {
  const first = getSelfStudyPlan(0, "daily", 40);
  const last = getSelfStudyPlan(59, "daily", 40);
  const next = getSelfStudyPlan(60, "daily", 40);
  const far = getSelfStudyPlan(600, "work", 60);
  assert.equal(first.cycleNumber, 1);
  assert.equal(last.weekNumber, 12);
  assert.equal(next.cycleNumber, 2);
  assert.equal(next.weekNumber, 1);
  assert.equal(far.cycleNumber, 11);
  assert.equal(first.tasks.length, 4);
  assert.equal(first.title, "基础课程与核心词汇");
  assert.equal(getSelfStudyPlan(1).title, "精听与跟读");
  assert.equal(getSelfStudyPlan(2).title, "影视场景学习");
  assert.equal(getSelfStudyPlan(3).title, "阅读、语法与短写作");
  assert.equal(getSelfStudyPlan(4).title, "周复习与综合输出");
  assert.ok(first.tasks.every((task) => task.tools));
  assert.equal(getSelfStudyCycle("travel", 2).length, 12);
});

test("周区间从实际开始日计算，不强制从周一开始", () => {
  assert.equal(weekDateRange("2026-08-13", [1, 2, 3, 4, 5], 0), "8月13日—8月19日");
  assert.equal(formatScheduledDate("2026-08-13", [1, 2, 3, 4, 5], 0), "8月13日 周四");
  assert.equal(formatScheduledDate("2026-08-13", [1, 2, 3, 4, 5], 1), "8月14日 周五");
  assert.equal(formatScheduledDate("2026-08-13", [1, 2, 3, 4, 5], 2), "8月17日 周一");
});

test("周期成果只评估可客观检查的完整度", () => {
  const complete = evaluateOutcome({ text: Array(70).fill("word").join(" "), expressions: ["one", "two", "three", "four", "five"], checks: { clear: true } });
  assert.equal(complete.objectiveScore, 100);
  assert.equal(complete.wordCount, 70);
  assert.equal(complete.selfScore, 1);
  const partial = evaluateOutcome({ text: "too short", expressions: ["one"] });
  assert.equal(partial.objectiveScore, 50);
  assert.match(partial.feedback, /60 个英文词/);
});
