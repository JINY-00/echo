const WEEK_SKILLS = [
  ["建立基线", "看清当前水平，建立能长期执行的学习习惯"],
  ["声音与发音", "辨认英语的重音、连读和语调，并开始模仿"],
  ["高频表达块", "积累完整搭配和句块，而不是孤立背单词"],
  ["听力抓重点", "从真实材料中抓人物、场景、动作和结论"],
  ["精听与拆解", "反复处理一小段材料，查清没听懂的部分"],
  ["阅读与结构", "找到主旨、段落作用和支撑信息"],
  ["复述与转述", "离开原文，用自己的话重组信息"],
  ["提问与回应", "围绕材料提出问题，并给出有内容的回答"],
  ["写作表达", "把零散想法组织成短段落并自行检查"],
  ["真实场景任务", "用英语完成一个与目标相关的现实任务"],
  ["弱项专项突破", "根据前面记录，集中处理最常出现的问题"],
  ["综合作品与复盘", "完成一个可保存的作品，评估本周期的变化"],
];

const GOAL_GUIDES = {
  daily: [
    "自我介绍、日常安排或兴趣", "生活类短视频或播客片段", "家庭、朋友或社区", "点餐、购物或问路",
    "健康、情绪或生活服务", "人物故事或生活文章", "讲述一次个人经历", "闲聊、邀请或表达偏好",
    "写日记、留言或个人介绍", "完成一次生活场景对话", "从记录中选择最弱的生活场景", "录制一段 2—3 分钟的个人表达",
  ],
  travel: [
    "一次真实或想象中的旅行计划", "机场、车站或酒店实录", "交通、住宿与景点高频表达", "旅行广播或路线说明",
    "旅行视频中的 30—60 秒片段", "目的地攻略或景点介绍", "复述一天的旅行安排", "问路、求助或咨询服务",
    "写一份简短英文行程", "完成从出发到入住的情景演练", "从记录中选择最弱的旅行环节", "录制一份完整旅行计划说明",
  ],
  work: [
    "自己的岗位、职责与工作目标", "会议、汇报或职场播客片段", "协作、进度与反馈高频表达", "工作对话或会议重点",
    "演示或会议中的 30—60 秒片段", "行业文章、邮件或产品说明", "复述项目进展或会议结论", "澄清、确认或表达观点",
    "写一封邮件或一段工作更新", "完成一次汇报或协商演练", "从记录中选择最弱的工作任务", "录制一段 2—3 分钟工作汇报",
  ],
};

const DAY_ACTIONS = [
  {
    title: "基础课程与核心词汇",
    purpose: "用结构化课程建立知识框架，再把当天词汇带入真实语境。",
    material: "优先使用自己已有的学习 App；不同工具任选其一，不要求全部安装。",
    tasks: [
      ["courseLesson", "完成一段系统课程", "沿当前进度连续完成 1—2 个小节，不跳级刷题；把错题重新做一遍。", 0.22, "完成小节且错题已订正", "多邻国、扇贝口语或正在使用的主课程"],
      ["vocabulary", "复习旧词并学习新词", "先清完到期复习，再学 8—12 个与本周主题相关的词组；优先学习例句中的完整搭配。", 0.28, "复习正确率达到 80%，并收藏 5 个词组", "不背单词、墨墨背单词、Anki 或欧路词典"],
      ["contextListen", "听一段真实语境", "选择 2—4 分钟短对话，第一遍不看文本，第二遍核对关键词和场景。", 0.24, "写出大意和 5 个关键词", "轻听英语、每日英语听力或可可英语"],
      ["dailyOutput", "把新内容说出来", "用今天的句型和词组说 5 句自己的话，再连成 45—60 秒表达。", 0.26, "至少使用 3 个新表达并保留录音", "手机录音或 Echo 专项训练"],
    ],
  },
  {
    title: "精听与跟读",
    purpose: "通过盲听、听写、核对和跟读，处理真正听不清的声音细节。",
    material: "选择 1—3 分钟、有英文原文的材料；难度以第一遍能听懂约 50%—70% 为宜。",
    tasks: [
      ["blindListen", "盲听三遍并记录", "第一遍抓主题，第二遍记关键词，第三遍补人物、数字、动作和结论。", 0.24, "写出一句大意和至少 6 个关键词", "轻听英语或每日英语听力的无文本模式"],
      ["dictation", "听写 5 个关键句", "逐句循环播放，先完整写下听到的内容，再对照原文修改。", 0.28, "5 句均已核对，并标出听错位置", "轻听英语逐句精听、每日英语听力听写模式"],
      ["soundNotes", "分析声音卡点", "从听错处找出连读、弱读、吞音或陌生搭配，不需要抄整篇原文。", 0.20, "解释 3 个具体卡点", "欧路词典、有道词典或材料原文"],
      ["shadow", "跟读并录音 1 分钟", "先逐句模仿，再跟着原声连续说；重点模仿重音、停顿和语气。", 0.28, "完成两轮跟读并保留最后一轮录音", "原材料跟读功能或手机录音"],
    ],
  },
  {
    title: "影视场景学习",
    purpose: "通过一个短场景学习真实对话、语气和常用表达，而不是只追剧情。",
    material: "选择一段 5—8 分钟的剧集、电影或生活视频；不建议一次学习多集。",
    tasks: [
      ["watchNoCn", "无中文字幕观看一遍", "先不暂停，根据画面、语气和已知词判断人物关系与事件。", 0.22, "能说明人物、场景和主要事件", "哔哩哔哩、腾讯视频、优酷、爱奇艺或已有会员平台"],
      ["watchEn", "打开英文字幕精看", "重复观看同一片段，只查影响理解的句子，不做逐句翻译。", 0.25, "补充 5 个此前遗漏的信息", "平台英文字幕或外挂英文字幕"],
      ["sceneLines", "整理 5 句场景表达", "记录完整台词、真实含义和适用场景，特别留意缩读与语气。", 0.25, "5 句都能脱离字幕读出并解释", "不背单词生词本、欧路词典或自己的笔记"],
      ["rolePlay", "角色模仿与改编", "选择一个角色跟读，再把人物、地点或目的换成自己的信息演一遍。", 0.28, "完成 60—90 秒录音", "原视频与手机录音"],
    ],
  },
  {
    title: "阅读、语法与短写作",
    purpose: "在完整文章中理解结构和语法，再用自己的话输出一段文字。",
    material: "选择 300—600 词的分级读物、新闻或故事；第一遍能理解约 70% 最合适。",
    tasks: [
      ["skim", "限时通读抓结构", "不逐词查字典，先找主题、段落作用、观点和结论。", 0.22, "用 1 句话概括主旨并列出段落结构", "China Daily、扇贝阅读、分级读物或英文原版书"],
      ["closeRead", "精读两个关键段落", "只查影响理解的词组，区分事实、例子、转折和作者观点。", 0.26, "写出 4 个关键信息", "欧路词典、有道词典或纸质词典"],
      ["grammar", "掌握一个句型或语法点", "从原文选一个代表句，分析结构，再仿写 3 个与自己有关的句子。", 0.24, "能解释结构并完成 3 个仿写句", "多邻国错题、语法书或可靠课程"],
      ["summary", "写 80—120 词短文", "离开原文写摘要或观点，完成后检查时态、主谓一致和拼写。", 0.28, "完成一稿和一次自查", "备忘录、文档或纸笔"],
    ],
  },
  {
    title: "周复习与综合输出",
    purpose: "复测本周的词汇和听力，完成一份能与以后比较的口语或写作成果。",
    material: "今天通常不需要寻找新材料，使用本周的词组、演讲或播客、影视片段和文章记录。",
    tasks: [
      ["wordTest", "完成本周词汇复测", "清完到期复习，再随机测试 20 个本周表达；错词立即回到例句中重学。", 0.24, "记录正确率和最多 5 个易错词", "不背单词、墨墨背单词或 Anki"],
      ["listenTest", "重听最难的一段材料", "先盲听，再核对原文；对比第一次记录，确认哪些声音已经能听出来。", 0.22, "写出进步点和仍未解决的 2 个卡点", "轻听英语、每日英语听力或本周原材料"],
      ["courseReview", "完成一次错题复习", "集中处理本周系统课程中的错题，不开启大量新课程。", 0.18, "错题重新作答并说明错误原因", "多邻国练习区或主课程错题本"],
      ["weeklyOutput", "完成一份周成果", "围绕本周主题做 2—3 分钟口语，或写 120—180 词短文，并用上至少 5 个新表达。", 0.36, "保存成果并写下一条下周调整", "手机录音、文档或 Echo 周成果"],
    ],
  },
];

export function getSelfStudyPlan(courseDay = 0, goal = "daily", dailyMinutes = 40) {
  const day = Math.max(0, Number(courseDay) || 0);
  const cycleIndex = Math.floor(day / 60);
  const dayInCycle = day % 60;
  const weekIndex = Math.floor(dayInCycle / 5);
  const dayIndex = dayInCycle % 5;
  const [weekTitle, weekOutcome] = WEEK_SKILLS[weekIndex];
  const guide = GOAL_GUIDES[goal]?.[weekIndex] || GOAL_GUIDES.daily[weekIndex];
  const action = DAY_ACTIONS[dayIndex];
  const minutes = Math.max(15, Number(dailyMinutes) || 40);
  return {
    id: `self-${cycleIndex + 1}-${dayInCycle + 1}`,
    courseDay: day,
    cycleNumber: cycleIndex + 1,
    dayInCycle: dayInCycle + 1,
    weekNumber: weekIndex + 1,
    dayInWeek: dayIndex + 1,
    weekTitle,
    weekOutcome,
    guide,
    title: action.title,
    purpose: action.purpose,
    materialGuide: action.material,
    tasks: action.tasks.map(([key, title, detail, ratio, evidence, tools]) => ({
      key,
      title,
      detail,
      evidence,
      tools,
      minutes: Math.max(3, Math.round(minutes * ratio)),
    })),
  };
}

export function getSelfStudyCycle(goal = "daily", cycleNumber = 1) {
  return WEEK_SKILLS.map(([title, outcome], index) => ({
    weekNumber: index + 1,
    title,
    outcome,
    guide: GOAL_GUIDES[goal]?.[index] || GOAL_GUIDES.daily[index],
    cycleNumber,
  }));
}

export function evaluateOutcome({ text = "", link = "", expressions = [], checks = {} } = {}) {
  const cleanText = String(text).trim();
  const cleanLink = String(link).trim();
  const cleanExpressions = (Array.isArray(expressions) ? expressions : String(expressions).split(/\n|,|，/)).map((item) => item.trim()).filter(Boolean);
  const wordCount = cleanText ? cleanText.split(/\s+/).filter(Boolean).length : 0;
  const selfScore = Object.values(checks).filter(Boolean).length;
  const evidenceCount = [cleanText, cleanLink, cleanExpressions.length ? "expressions" : ""].filter(Boolean).length;
  const lengthPass = wordCount >= 60 || Boolean(cleanLink);
  const expressionPass = cleanExpressions.length >= 5;
  const objectiveScore = Math.round(([Boolean(cleanText || cleanLink), lengthPass, expressionPass, evidenceCount >= 2].filter(Boolean).length / 4) * 100);
  const feedback = objectiveScore === 100
    ? "提交材料完整：有作品、有足够长度、有新表达，也有多种学习证据。下一步请人工检查语言准确性。"
    : `当前完成度 ${objectiveScore}%。${!lengthPass ? "建议补充至少 60 个英文词或成果链接。" : ""}${!expressionPass ? " 建议列出至少 5 个本周真正使用的新表达。" : ""}`.trim();
  return { wordCount, selfScore, evidenceCount, lengthPass, expressionPass, objectiveScore, feedback, expressions: cleanExpressions };
}

export function scheduledDateForDay(startDate, selectedWeekdays, courseDay) {
  const start = parseLocalDate(startDate);
  if (!start) return null;
  const wanted = new Set((selectedWeekdays || []).map(Number));
  let found = -1;
  const cursor = new Date(start);
  for (let guard = 0; guard < 8000; guard += 1) {
    const isFirst = guard === 0;
    const jsDay = cursor.getDay();
    const appDay = jsDay === 0 ? 7 : jsDay;
    if (isFirst || wanted.size === 0 || wanted.has(appDay)) found += 1;
    if (found === courseDay) return cursor;
    cursor.setDate(cursor.getDate() + 1);
  }
  return null;
}

export function weekDateRange(startDate, selectedWeekdays, weekIndex) {
  const first = scheduledDateForDay(startDate, selectedWeekdays, Math.max(0, weekIndex) * 5);
  if (!first) return "未设置开始日期";
  const last = new Date(first);
  last.setDate(last.getDate() + 6);
  return `${formatShortDate(first)}—${formatShortDate(last)}`;
}

export function formatScheduledDate(startDate, selectedWeekdays, courseDay) {
  const date = scheduledDateForDay(startDate, selectedWeekdays, courseDay);
  if (!date) return "待安排";
  const weekDay = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][date.getDay()];
  return `${formatShortDate(date)} ${weekDay}`;
}

function parseLocalDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatShortDate(date) {
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}
