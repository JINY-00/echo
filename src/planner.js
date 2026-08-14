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
    title: "听读热身与表达",
    purpose: "先理解一段材料，再挑少量表达开口使用。",
    material: "自己选择 3—8 分钟音视频或一篇短文，难度以能理解约 70% 为宜。",
    tasks: [
      ["firstListen", "先听或看一遍", "不停顿、不查词，先判断人物、场景和主题。", 0.24, "能用一句话说出大意"],
      ["readCheck", "对照文字找关键信息", "只查影响理解的地方，圈出人名、数字、动作或观点。", 0.26, "写下 3 个关键信息"],
      ["pickPhrases", "挑 5 个实用表达", "优先保存完整词组或句型，并弄清当前语境中的意思。", 0.22, "能解释并读出 5 个表达"],
      ["shortSpeak", "做 1 分钟口头复述", "离开原文，说出大意并至少用上 2 个新表达。", 0.28, "留下录音或文字提纲"],
    ],
  },
  {
    title: "精听与跟读",
    purpose: "处理一小段真实声音，解决听不清并模仿节奏。",
    material: "自己选择 30—90 秒、有英文字幕或原文的清晰音频。",
    tasks: [
      ["blindListen", "不看字幕听三遍", "每遍只补充新听到的关键词，不急着逐句翻译。", 0.26, "写出大意和 5 个关键词"],
      ["checkText", "核对 3 个听力卡点", "对照英文原文，找出连读、弱读或生词造成的问题。", 0.24, "标出并解释 3 个卡点"],
      ["shadow", "逐句跟读三轮", "模仿重音、停顿和语气，跟不上时缩短句子。", 0.28, "能跟上其中 20—40 秒"],
      ["retell", "关掉原文再复述", "用自己的话说出主要信息，不要求和原句一样。", 0.22, "完成 30—60 秒复述"],
    ],
  },
  {
    title: "场景输入与开口",
    purpose: "从真实对话中观察语气，并把句型换成自己的信息。",
    material: "自己选择一段 2—5 分钟的英文电视剧、电影或生活短视频，最好能切换中英文字幕。",
    tasks: [
      ["watchNoCn", "先关中文字幕看一遍", "根据人物动作和语气猜场景，不因一句没懂就暂停。", 0.20, "能说清人物在做什么"],
      ["studyLines", "打开英文字幕精看", "挑 3—5 句实用台词，查清缩读、语气和使用场景。", 0.30, "能解释 3—5 句台词"],
      ["shadow", "逐句模仿三轮", "模仿人物的重音、停顿和情绪，不只读准单词。", 0.30, "能跟上其中 20—40 秒"],
      ["rolePlay", "脱离字幕演一遍", "扮演其中一个角色，也可以把台词换成自己的信息。", 0.20, "留下 30—60 秒录音"],
    ],
  },
  {
    title: "阅读与短写作",
    purpose: "通过完整语境练阅读，再用自己的话组织成短文。",
    material: "自己选择一篇 300—800 词的英文文章、新闻、故事或分级读物，难度以能看懂约 70% 为宜。",
    tasks: [
      ["skim", "限时读完抓主旨", "第一遍不逐词查字典，找标题、人物、观点和结论。", 0.26, "用一句中文或英文概括主旨"],
      ["closeRead", "精读关键段落", "只查影响理解的词，标出段落之间的关系。", 0.28, "写出 3 个关键信息"],
      ["structure", "拆一个关键句", "从原文挑一个影响理解的句子，查清结构和句中关系。", 0.26, "能用自己的话解释句子结构"],
      ["summary", "写短总结", "离开原文写 5—8 句，再回去检查是否准确。", 0.20, "完成一段自己的总结"],
    ],
  },
  {
    title: "复测与成果整理",
    purpose: "重新测试本周输入，再留下一个可比较的输出成果。",
    material: "今天通常不需要寻找新材料，使用本周的词组、演讲或播客、影视片段和文章记录。",
    tasks: [
      ["wordTest", "复测本周词组", "不看笔记写出或说出 15 个表达，再核对答案。", 0.22, "记录正确率和易错项"],
      ["listenTest", "重听本周最难片段", "先关字幕再听，比较现在和第一次能听懂多少。", 0.22, "写下具体进步或仍听不出的地方"],
      ["speak", "完成 2—3 分钟口语", "选一个与本周主题有关的问题连续表达，尽量用上新词组。", 0.34, "保留一段完整录音"],
      ["reflect", "做周复盘", "写下本周有效的方法、最大问题和下周一个调整。", 0.22, "形成一条明确调整"],
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
    tasks: action.tasks.map(([key, title, detail, ratio, evidence]) => ({
      key,
      title,
      detail,
      evidence,
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
