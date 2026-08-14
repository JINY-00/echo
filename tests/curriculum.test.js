import test from "node:test";
import assert from "node:assert/strict";
import {
  COURSE,
  GOALS,
  PLACEMENT_QUESTIONS,
  buildWeekTest,
  getCourseStats,
  getLesson,
  scorePlacement,
} from "../src/curriculum.js";

test("三条路线都包含 12 周、60 个可用学习日", () => {
  assert.deepEqual(Object.keys(GOALS).sort(), ["daily", "travel", "work"]);
  for (const goal of Object.keys(GOALS)) {
    assert.equal(COURSE[goal].length, 12);
    const ids = new Set();
    for (let day = 0; day < 60; day += 1) {
      const lesson = getLesson(goal, day);
      ids.add(lesson.id);
      assert.equal(lesson.dayNumber, day + 1);
      assert.equal(lesson.week.samples.length, 5);
      assert.ok(lesson.week.vocab.length >= 6);
      assert.equal(lesson.words.length, 4);
      assert.equal(lesson.quiz.length, 3);
      assert.equal(lesson.listeningSet.length, 3);
      assert.equal(lesson.shadowSamples.length, 3);
      lesson.listeningSet.forEach((question) => assert.ok(question.answer >= 0 && question.answer < question.choices.length));
      assert.ok(lesson.sample.en.length > 8);
      for (const question of lesson.quiz) {
        if (question.type === "choice" && question.answer !== undefined) {
          assert.ok(question.answer >= 0 && question.answer < question.choices.length);
        }
      }
    }
    assert.equal(ids.size, 60);
    assert.equal(getCourseStats(goal).lessons, 60);
  }
});

test("每周检验可客观判分", () => {
  for (const goal of Object.keys(GOALS)) {
    for (let week = 0; week < 12; week += 1) {
      const weekly = buildWeekTest(goal, week);
      assert.equal(weekly.questions.length, 5);
      weekly.questions.forEach((question) => {
        assert.ok(question.answer >= 0 && question.answer < question.choices.length);
        assert.equal(question.choices[question.answer], COURSE[goal][week].samples[Number(question.id.split("-").at(-1))].zh);
      });
      assert.ok(weekly.speakingPrompt.includes("45—60 秒"));
    }
  }
});

test("A1、A2、B1 会实际改变训练长度和词汇量", () => {
  const a1 = getLesson("daily", 0, "A1");
  const a2 = getLesson("daily", 0, "A2");
  const b1 = getLesson("daily", 0, "B1");
  assert.equal(a1.words.length, 4);
  assert.equal(a2.words.length, 5);
  assert.equal(b1.words.length, 6);
  assert.ok(a2.listening.text.length > a1.listening.text.length);
  assert.ok(b1.listening.text.length > a2.listening.text.length);
  assert.notEqual(a1.id, a2.id);
});

test("24 题分级测试覆盖四项能力和三个等级", () => {
  assert.equal(PLACEMENT_QUESTIONS.length, 24);
  assert.deepEqual([...new Set(PLACEMENT_QUESTIONS.map((question) => question.category))].sort(), ["听力", "词汇", "语法", "阅读"]);
  assert.deepEqual([...new Set(PLACEMENT_QUESTIONS.map((question) => question.level))].sort(), ["A1", "A2", "B1"]);

  const perfect = Object.fromEntries(PLACEMENT_QUESTIONS.map((question) => [question.id, question.answer]));
  const perfectScore = scorePlacement(perfect);
  assert.equal(perfectScore.level, "B1");
  assert.equal(perfectScore.percent, 100);

  const empty = scorePlacement({});
  assert.equal(empty.level, "A1");
  assert.equal(empty.percent, 0);
});
