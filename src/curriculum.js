const W = (title, outcome, vocab, samples) => ({
  title,
  outcome,
  vocab: vocab.map(([term, meaning]) => ({ term, meaning })),
  samples: samples.map(([en, zh]) => ({ en, zh })),
});

export const GOALS = {
  daily: {
    id: "daily",
    name: "日常交流",
    short: "生活",
    icon: "☘️",
    description: "从自我介绍到自然闲聊，把英语放进每天的生活。",
    color: "#dff8f6",
  },
  travel: {
    id: "travel",
    name: "旅行英语",
    short: "旅行",
    icon: "🧳",
    description: "覆盖机场、酒店、交通、点餐与突发情况。",
    color: "#fff2cc",
  },
  work: {
    id: "work",
    name: "职场英语",
    short: "工作",
    icon: "🪴",
    description: "开会、汇报、沟通与表达观点，清楚又得体。",
    color: "#e6ecff",
  },
};

const daily = [
  W("认识新朋友", "完成自然的问候和自我介绍", [
    ["introduce", "介绍"], ["hometown", "家乡"], ["currently", "目前"], ["nice to meet you", "很高兴认识你"], ["work in", "从事……工作"], ["be interested in", "对……感兴趣"],
  ], [
    ["Hi, I'm Lin. Nice to meet you.", "你好，我是林。很高兴认识你。"],
    ["I'm from Chengdu, but I currently live in Shanghai.", "我来自成都，但目前住在上海。"],
    ["I work in design and I'm interested in photography.", "我从事设计工作，也对摄影感兴趣。"],
    ["What brings you here today?", "你今天为什么来这里？"],
    ["It was great talking with you.", "和你聊天很愉快。"],
  ]),
  W("一天怎么过", "描述时间、频率和日常安排", [
    ["usually", "通常"], ["commute", "通勤"], ["take a break", "休息一下"], ["after work", "下班后"], ["twice a week", "每周两次"], ["around", "大约"],
  ], [
    ["I usually get up around seven.", "我通常七点左右起床。"],
    ["My commute takes about thirty minutes.", "我通勤大约需要三十分钟。"],
    ["I take a short break after lunch.", "午饭后我会短暂休息。"],
    ["After work, I often go for a walk.", "下班后我经常散步。"],
    ["I cook at home twice a week.", "我每周在家做两次饭。"],
  ]),
  W("家人与朋友", "介绍关系并描述一个人的特点", [
    ["younger", "更年轻的"], ["close friend", "亲密的朋友"], ["easygoing", "随和的"], ["reliable", "可靠的"], ["get along", "相处融洽"], ["have in common", "有共同点"],
  ], [
    ["I have one younger sister.", "我有一个妹妹。"],
    ["Mia is a close friend from college.", "米娅是我的大学好友。"],
    ["She's easygoing and very reliable.", "她很随和，也很可靠。"],
    ["We get along because we listen to each other.", "我们相处得好，因为会互相倾听。"],
    ["We have a lot in common.", "我们有很多共同点。"],
  ]),
  W("吃饭与点单", "询问口味、点单并礼貌提出需求", [
    ["recommend", "推荐"], ["I'd like", "我想要"], ["spicy", "辣的"], ["on the side", "另外放"], ["allergic", "过敏的"], ["the bill", "账单"],
  ], [
    ["What do you recommend here?", "你们这里推荐什么？"],
    ["I'd like the chicken noodles, please.", "我想要鸡肉面，谢谢。"],
    ["Is this dish very spicy?", "这道菜很辣吗？"],
    ["Could I have the sauce on the side?", "酱汁可以另外放吗？"],
    ["Could we have the bill, please?", "麻烦给我们账单。"],
  ]),
  W("买东西", "询价、比较并完成简单购物", [
    ["size", "尺码"], ["try on", "试穿"], ["another color", "另一种颜色"], ["fit", "合身"], ["on sale", "促销"], ["receipt", "收据"],
  ], [
    ["Do you have this in a medium?", "这个有中码吗？"],
    ["Can I try it on?", "我可以试穿吗？"],
    ["Is there another color available?", "还有别的颜色吗？"],
    ["It fits well, but it's a little expensive.", "它很合身，但有点贵。"],
    ["Could I get a receipt, please?", "可以给我收据吗？"],
  ]),
  W("问路与出行", "问清地点并听懂分步路线", [
    ["across from", "在……对面"], ["intersection", "十字路口"], ["straight ahead", "一直向前"], ["turn left", "左转"], ["get off", "下车"], ["within walking distance", "步行可到"],
  ], [
    ["Excuse me, where is the nearest station?", "请问最近的车站在哪里？"],
    ["Go straight ahead for two blocks.", "一直向前走两个街区。"],
    ["Turn left at the next intersection.", "在下一个十字路口左转。"],
    ["The café is across from the bank.", "咖啡馆在银行对面。"],
    ["Is it within walking distance?", "走路能到吗？"],
  ]),
  W("家与社区", "描述居住环境、设施和偏好", [
    ["neighborhood", "社区"], ["convenient", "方便的"], ["quiet", "安静的"], ["nearby", "附近的"], ["balcony", "阳台"], ["move in", "搬入"],
  ], [
    ["I live in a quiet neighborhood.", "我住在一个安静的社区。"],
    ["There's a small park nearby.", "附近有一个小公园。"],
    ["The apartment is small but convenient.", "公寓不大，但很方便。"],
    ["My favorite place is the sunny balcony.", "我最喜欢的地方是阳光充足的阳台。"],
    ["We moved in last spring.", "我们去年春天搬了进来。"],
  ]),
  W("感受与健康", "表达身体状况、情绪并提出建议", [
    ["feel tired", "感到疲惫"], ["headache", "头痛"], ["get some rest", "休息一下"], ["worried", "担心的"], ["feel better", "感觉好些"], ["take care", "保重"],
  ], [
    ["I'm feeling a little tired today.", "我今天感觉有点累。"],
    ["I've had a headache since this morning.", "我从早上开始就头痛。"],
    ["You should get some rest.", "你应该休息一下。"],
    ["I was worried, but I feel better now.", "我之前很担心，但现在好多了。"],
    ["Take care and let me know how you feel.", "保重，记得告诉我你的情况。"],
  ]),
  W("爱好与邀请", "谈论兴趣并自然发出或回应邀请", [
    ["be into", "喜欢"], ["free time", "空闲时间"], ["would you like to", "你愿意……吗"], ["sounds great", "听起来很好"], ["maybe next time", "也许下次"], ["look forward to", "期待"],
  ], [
    ["I'm really into hiking these days.", "我最近很喜欢徒步。"],
    ["What do you do in your free time?", "你空闲时做什么？"],
    ["Would you like to join us on Saturday?", "你周六愿意加入我们吗？"],
    ["That sounds great. What time should we meet?", "听起来很好。我们几点见？"],
    ["I'm looking forward to it.", "我很期待。"],
  ]),
  W("电话与服务", "打电话预约并解决简单服务问题", [
    ["make an appointment", "预约"], ["available", "有空的"], ["hold on", "稍等"], ["reschedule", "改期"], ["connection", "连接"], ["customer service", "客服"],
  ], [
    ["I'd like to make an appointment for Friday.", "我想预约周五。"],
    ["Is three o'clock available?", "三点有空吗？"],
    ["Could you hold on for a moment?", "你可以稍等一下吗？"],
    ["I need to reschedule my appointment.", "我需要更改预约时间。"],
    ["The internet connection isn't working.", "网络连接不能用。"],
  ]),
  W("讲述过去", "用清楚的顺序讲一段短经历", [
    ["at first", "起初"], ["suddenly", "突然"], ["fortunately", "幸运的是"], ["in the end", "最后"], ["happen", "发生"], ["realize", "意识到"],
  ], [
    ["Last weekend, I visited an old town.", "上周末我去了一个古镇。"],
    ["At first, the weather was perfect.", "起初天气很好。"],
    ["Suddenly, it started to rain.", "突然开始下雨了。"],
    ["Fortunately, we found a small tea shop.", "幸运的是，我们找到一家小茶馆。"],
    ["In the end, it became my favorite part of the trip.", "最后，这反而成了旅程中我最喜欢的部分。"],
  ]),
  W("自在闲聊", "发起、延续并礼貌结束一段对话", [
    ["by the way", "顺便说一下"], ["how about you", "你呢"], ["that reminds me", "那让我想起"], ["exactly", "正是如此"], ["anyway", "不管怎样"], ["catch up", "叙旧"],
  ], [
    ["It's been a busy week, hasn't it?", "这周很忙，对吧？"],
    ["I've been learning to cook. How about you?", "我最近在学做饭。你呢？"],
    ["That reminds me of a place near my home.", "那让我想起我家附近的一个地方。"],
    ["Exactly! That's what I was thinking.", "没错！我也是这么想的。"],
    ["Anyway, it was lovely catching up with you.", "总之，和你叙旧很开心。"],
  ]),
];

const travel = [
  W("机场值机", "办理值机、托运行李并确认座位", [
    ["check in", "办理值机"], ["passport", "护照"], ["checked bag", "托运行李"], ["carry-on", "随身行李"], ["aisle seat", "过道座位"], ["boarding pass", "登机牌"],
  ], [
    ["I'd like to check in for my flight to Tokyo.", "我想办理去东京的航班值机。"],
    ["May I see your passport, please?", "请出示您的护照。"],
    ["I have one checked bag and one carry-on.", "我有一件托运行李和一件随身行李。"],
    ["Could I have an aisle seat if possible?", "可以的话能给我过道座位吗？"],
    ["Here is your boarding pass. Gate 18.", "这是您的登机牌，18号登机口。"],
  ]),
  W("安检与登机", "听懂安检要求、登机广播与延误信息", [
    ["security check", "安检"], ["take out", "取出"], ["boarding gate", "登机口"], ["delayed", "延误的"], ["final call", "最后登机通知"], ["overhead bin", "头顶行李架"],
  ], [
    ["Please take your laptop out of your bag.", "请把笔记本电脑从包里拿出来。"],
    ["Where is the security check?", "安检在哪里？"],
    ["The boarding gate has changed to B12.", "登机口改到B12了。"],
    ["The flight is delayed by forty minutes.", "航班延误四十分钟。"],
    ["This is the final call for Flight 206.", "这是206航班的最后登机通知。"],
  ]),
  W("入境与海关", "回答入境问题并申报物品", [
    ["purpose", "目的"], ["vacation", "度假"], ["stay", "停留"], ["return ticket", "返程票"], ["declare", "申报"], ["customs", "海关"],
  ], [
    ["What is the purpose of your visit?", "您此行的目的是什么？"],
    ["I'm here on vacation.", "我是来度假的。"],
    ["I'll stay for eight days.", "我会停留八天。"],
    ["Here is my return ticket and hotel booking.", "这是我的返程票和酒店订单。"],
    ["I have nothing to declare.", "我没有要申报的物品。"],
  ]),
  W("入住酒店", "确认预订、办理入住并询问设施", [
    ["reservation", "预订"], ["check in", "入住"], ["under the name", "以……姓名"], ["breakfast included", "含早餐"], ["Wi-Fi password", "无线网密码"], ["check-out", "退房"],
  ], [
    ["I have a reservation under the name Chen.", "我用陈这个姓预订了房间。"],
    ["I'd like to check in, please.", "我想办理入住。"],
    ["Is breakfast included in the room rate?", "房费含早餐吗？"],
    ["Could you tell me the Wi-Fi password?", "可以告诉我无线网密码吗？"],
    ["What time is check-out tomorrow?", "明天几点退房？"],
  ]),
  W("城市问路", "确认方向、距离和地标", [
    ["landmark", "地标"], ["on the corner", "在拐角处"], ["past", "经过"], ["opposite", "在……对面"], ["how far", "多远"], ["get there", "到达那里"],
  ], [
    ["What's the easiest way to get to the museum?", "去博物馆最方便的路线是什么？"],
    ["Walk past the library and turn right.", "经过图书馆后右转。"],
    ["It's on the corner, opposite the post office.", "它在拐角处，邮局对面。"],
    ["How far is it from here?", "它离这里多远？"],
    ["It takes about ten minutes on foot.", "步行大约十分钟。"],
  ]),
  W("公共交通", "买票、选择线路并确认下车点", [
    ["one-way", "单程的"], ["round trip", "往返的"], ["platform", "站台"], ["transfer", "换乘"], ["fare", "票价"], ["last train", "末班车"],
  ], [
    ["I'd like a round-trip ticket to Brighton.", "我想买一张去布莱顿的往返票。"],
    ["Which platform does the train leave from?", "火车从哪个站台出发？"],
    ["Do I need to transfer?", "我需要换乘吗？"],
    ["How much is the bus fare?", "公交票价是多少？"],
    ["What time is the last train back?", "返程末班车是几点？"],
  ]),
  W("餐厅点餐", "预订、点餐、说明忌口并结账", [
    ["table for two", "两人桌"], ["local specialty", "当地特色菜"], ["vegetarian", "素食的"], ["without", "不加"], ["tap water", "自来水"], ["split the bill", "分开结账"],
  ], [
    ["Do you have a table for two?", "有两人桌吗？"],
    ["What's the local specialty?", "当地特色菜是什么？"],
    ["Do you have any vegetarian dishes?", "你们有素食菜品吗？"],
    ["I'd like this without onions, please.", "我想要这道菜不加洋葱。"],
    ["Can we split the bill?", "我们可以分开结账吗？"],
  ]),
  W("旅行购物", "询问价格、退税和退换货", [
    ["souvenir", "纪念品"], ["handmade", "手工制作的"], ["discount", "折扣"], ["tax refund", "退税"], ["exchange", "更换"], ["refund", "退款"],
  ], [
    ["I'm looking for a small souvenir.", "我在找一件小纪念品。"],
    ["Is this made locally?", "这是当地制作的吗？"],
    ["Is there a discount if I buy two?", "买两个有折扣吗？"],
    ["Where can I get a tax refund?", "我在哪里可以办理退税？"],
    ["Could I exchange this for a larger size?", "我可以换一个更大的尺码吗？"],
  ]),
  W("身体不适", "说明症状、买药并寻求紧急帮助", [
    ["pharmacy", "药店"], ["symptom", "症状"], ["stomachache", "胃痛"], ["medicine", "药"], ["emergency", "紧急情况"], ["insurance", "保险"],
  ], [
    ["Is there a pharmacy near here?", "附近有药店吗？"],
    ["I've had a stomachache since last night.", "我从昨晚开始胃痛。"],
    ["Do I need a prescription for this medicine?", "这种药需要处方吗？"],
    ["Please call an ambulance. It's an emergency.", "请叫救护车，这是紧急情况。"],
    ["Here are my passport and insurance details.", "这是我的护照和保险信息。"],
  ]),
  W("景点与门票", "了解开放时间、购票并参加活动", [
    ["admission", "门票费"], ["guided tour", "导览团"], ["opening hours", "开放时间"], ["sold out", "售罄"], ["audio guide", "语音导览"], ["take photos", "拍照"],
  ], [
    ["What are the opening hours today?", "今天的开放时间是什么？"],
    ["How much is the admission fee?", "门票多少钱？"],
    ["Is there a guided tour in English?", "有英文导览团吗？"],
    ["The afternoon tickets are sold out.", "下午的票已经售罄。"],
    ["Are we allowed to take photos inside?", "里面允许拍照吗？"],
  ]),
  W("解决旅行问题", "处理丢失、错误订单和服务投诉", [
    ["lost and found", "失物招领"], ["missing", "丢失的"], ["booking number", "订单号"], ["incorrect", "不正确的"], ["manager", "经理"], ["solution", "解决办法"],
  ], [
    ["I think I left my bag on the train.", "我想我把包落在火车上了。"],
    ["Where is the lost and found office?", "失物招领处在哪里？"],
    ["This is my booking number.", "这是我的订单号。"],
    ["The room type is incorrect.", "房型不对。"],
    ["Could you help me find a solution?", "你能帮我找个解决办法吗？"],
  ]),
  W("完整旅程", "串联出发、住宿、游览和返程表达", [
    ["itinerary", "行程单"], ["departure", "出发"], ["arrive", "到达"], ["explore", "探索"], ["recommendation", "建议"], ["memorable", "难忘的"],
  ], [
    ["I've put all the bookings in our itinerary.", "我把所有预订都放进了行程单。"],
    ["We depart at nine and arrive around noon.", "我们九点出发，中午左右到达。"],
    ["I'd like to explore the old part of the city.", "我想探索这座城市的老城区。"],
    ["Do you have any local recommendations?", "你有什么当地建议吗？"],
    ["It was a memorable trip from start to finish.", "从开始到结束，这都是一次难忘的旅程。"],
  ]),
];

const work = [
  W("职业介绍", "简洁介绍自己的岗位、职责和经验", [
    ["role", "岗位"], ["be responsible for", "负责"], ["team", "团队"], ["experience", "经验"], ["focus on", "专注于"], ["work closely with", "与……紧密合作"],
  ], [
    ["I'm a product designer on the mobile team.", "我是移动端团队的产品设计师。"],
    ["I'm responsible for user research and interface design.", "我负责用户研究和界面设计。"],
    ["I have five years of experience in this field.", "我在这个领域有五年经验。"],
    ["Our team focuses on making the product easier to use.", "我们团队专注于让产品更易用。"],
    ["I work closely with engineers and researchers.", "我与工程师和研究员密切合作。"],
  ]),
  W("日常协作", "谈论日程、任务和同事间的协作", [
    ["schedule", "日程"], ["task", "任务"], ["available", "有空的"], ["catch up", "同步进展"], ["take care of", "负责处理"], ["hand over", "交接"],
  ], [
    ["What's on your schedule this morning?", "你今天上午有什么安排？"],
    ["I'm finishing a task for the sales team.", "我正在完成销售团队的一项任务。"],
    ["Are you available for a quick chat?", "你有空快速聊一下吗？"],
    ["Let's catch up after lunch.", "我们午饭后同步一下吧。"],
    ["I'll hand this over to Leo tomorrow.", "我明天会把这项工作交接给利奥。"],
  ]),
  W("参加会议", "发言、确认议程并推动会议", [
    ["agenda", "议程"], ["get started", "开始"], ["go over", "讨论；查看"], ["move on", "进入下一项"], ["action item", "行动项"], ["wrap up", "结束"],
  ], [
    ["Shall we get started?", "我们开始吧？"],
    ["The first item on the agenda is the launch date.", "议程第一项是发布日期。"],
    ["Let's go over the latest numbers.", "我们来看一下最新数据。"],
    ["Can we move on to the next topic?", "我们可以进入下一个话题吗？"],
    ["Before we wrap up, let's confirm the action items.", "结束前，让我们确认行动项。"],
  ]),
  W("汇报进展", "说明已完成、进行中与风险事项", [
    ["on track", "进展顺利"], ["complete", "完成"], ["in progress", "进行中"], ["blocker", "阻碍"], ["ahead of schedule", "提前"], ["fall behind", "落后"],
  ], [
    ["The project is on track for Friday.", "项目可以按计划在周五完成。"],
    ["We've completed the first round of testing.", "我们已经完成第一轮测试。"],
    ["The final review is still in progress.", "最终评审仍在进行中。"],
    ["Our main blocker is missing customer data.", "我们主要的阻碍是缺少客户数据。"],
    ["If we get it today, we won't fall behind.", "如果今天拿到数据，我们就不会落后。"],
  ]),
  W("邮件与即时消息", "写出简洁、礼貌且行动明确的信息", [
    ["regarding", "关于"], ["attached", "已附上"], ["confirm", "确认"], ["follow up", "跟进"], ["by the end of", "在……结束前"], ["appreciate", "感谢"],
  ], [
    ["I'm writing regarding tomorrow's workshop.", "我来信是关于明天的工作坊。"],
    ["I've attached the updated document.", "我已经附上更新后的文件。"],
    ["Could you confirm the final time?", "你能确认最终时间吗？"],
    ["I'll follow up by the end of the day.", "我会在今天结束前跟进。"],
    ["I'd appreciate your feedback.", "感谢你提供反馈。"],
  ]),
  W("澄清与确认", "听不懂时自然提问并复述确认", [
    ["clarify", "澄清"], ["what do you mean", "你的意思是什么"], ["in other words", "换句话说"], ["make sure", "确保"], ["understanding", "理解"], ["specific", "具体的"],
  ], [
    ["Could you clarify what you mean by priority?", "你能说明一下‘优先’是什么意思吗？"],
    ["Could you be a little more specific?", "你能再具体一点吗？"],
    ["In other words, we need a simpler version.", "换句话说，我们需要一个更简单的版本。"],
    ["Let me make sure I understand.", "让我确认一下我理解得对不对。"],
    ["So the deadline is Thursday, correct?", "所以截止日期是周四，对吗？"],
  ]),
  W("表达观点", "给出有依据的观点并礼貌回应不同意见", [
    ["in my view", "依我看"], ["agree", "同意"], ["concern", "顾虑"], ["from my perspective", "从我的角度"], ["point", "观点"], ["alternative", "替代方案"],
  ], [
    ["In my view, the first option is clearer.", "依我看，第一个方案更清楚。"],
    ["I agree with the main idea.", "我同意主要观点。"],
    ["My only concern is the cost.", "我唯一的顾虑是成本。"],
    ["That's a good point, but we have limited time.", "这个观点很好，但我们的时间有限。"],
    ["Could we consider an alternative?", "我们可以考虑一个替代方案吗？"],
  ]),
  W("期限与优先级", "协调工作量、优先级和截止时间", [
    ["deadline", "截止日期"], ["priority", "优先事项"], ["urgent", "紧急的"], ["workload", "工作量"], ["postpone", "推迟"], ["realistic", "现实可行的"],
  ], [
    ["What's the deadline for this request?", "这项需求的截止日期是什么时候？"],
    ["This is our top priority today.", "这是我们今天最优先的事项。"],
    ["Is it urgent, or can it wait until Monday?", "它很紧急，还是可以等到周一？"],
    ["My workload is quite heavy this week.", "我这周的工作量很大。"],
    ["Friday would be a more realistic deadline.", "周五会是更现实的截止日期。"],
  ]),
  W("客户沟通", "了解需求、管理预期并给出下一步", [
    ["requirement", "需求"], ["expectation", "预期"], ["deliver", "交付"], ["proposal", "方案"], ["feedback", "反馈"], ["next step", "下一步"],
  ], [
    ["Could you tell me more about your requirements?", "你能多介绍一下你们的需求吗？"],
    ["I want to make sure we understand your expectations.", "我想确保我们理解你们的预期。"],
    ["We can deliver the first version next week.", "我们可以在下周交付第一版。"],
    ["I'll send an updated proposal tomorrow.", "我明天会发送更新后的方案。"],
    ["The next step is to collect your team's feedback.", "下一步是收集你们团队的反馈。"],
  ]),
  W("解决问题", "解释原因、评估影响并提出方案", [
    ["issue", "问题"], ["cause", "原因"], ["impact", "影响"], ["fix", "修复"], ["temporary", "临时的"], ["prevent", "防止"],
  ], [
    ["We've found an issue with the payment page.", "我们发现支付页面有一个问题。"],
    ["The cause appears to be a recent update.", "原因似乎是最近的一次更新。"],
    ["The impact is limited to new users.", "影响仅限于新用户。"],
    ["We have a temporary fix in place.", "我们已经采取了临时修复措施。"],
    ["We'll add a test to prevent this from happening again.", "我们会增加测试，防止再次发生。"],
  ]),
  W("做简短演示", "组织开场、重点、数据与结论", [
    ["overview", "概览"], ["highlight", "重点介绍"], ["as you can see", "如你所见"], ["increase", "增长"], ["key takeaway", "关键结论"], ["question", "问题"],
  ], [
    ["Today I'll give a quick overview of our results.", "今天我会快速概述我们的成果。"],
    ["I'd like to highlight three key changes.", "我想重点介绍三个关键变化。"],
    ["As you can see, usage increased in July.", "如你所见，使用量在七月有所增长。"],
    ["The key takeaway is that simpler works better.", "关键结论是：更简单的方案效果更好。"],
    ["I'm happy to answer any questions.", "我很乐意回答任何问题。"],
  ]),
  W("完整工作场景", "从沟通目标到推动结果，自信完成协作", [
    ["objective", "目标"], ["stakeholder", "相关方"], ["decision", "决定"], ["trade-off", "权衡"], ["alignment", "共识"], ["outcome", "结果"],
  ], [
    ["Our objective is to improve the sign-up experience.", "我们的目标是改善注册体验。"],
    ["We've spoken with the main stakeholders.", "我们已经与主要相关方沟通过。"],
    ["The decision involves a trade-off between speed and cost.", "这个决定需要在速度和成本之间权衡。"],
    ["Let's make sure we have alignment before we start.", "开始前，我们先确保达成共识。"],
    ["The outcome was better than we expected.", "结果比我们预期的更好。"],
  ]),
];

export const COURSE = { daily, travel, work };

export const DAY_FOCUS = [
  { name: "听懂关键句", hint: "先抓住场景和关键词，不逐字翻译。" },
  { name: "替换表达", hint: "把示例中的信息换成你自己的。" },
  { name: "问与答", hint: "既会说，也练习接住对方的问题。" },
  { name: "解决任务", hint: "在一个具体场景里完成沟通。" },
  { name: "本周整合", hint: "把本周表达连成一段完整对话。" },
];

const p = (id, level, category, prompt, choices, answer, speak = "") => ({
  id, level, category, prompt, choices, answer, speak,
});

export const PLACEMENT_QUESTIONS = [
  p(1, "A1", "词汇", "“morning” 是什么意思？", ["早晨", "下午", "夜晚", "周末"], 0),
  p(2, "A1", "语法", "I ___ from China.", ["am", "is", "are", "be"], 0),
  p(3, "A1", "听力", "你听到的人想要什么？", ["水", "咖啡", "茶", "牛奶"], 1, "I'd like a cup of coffee, please."),
  p(4, "A1", "语法", "She ___ English every day.", ["study", "studies", "studying", "studied"], 1),
  p(5, "A1", "阅读", "Tom gets up at 7 and starts work at 9. Tom几点起床？", ["7点", "8点", "9点", "10点"], 0),
  p(6, "A1", "词汇", "“turn left” 是什么意思？", ["向右转", "向左转", "直走", "停下"], 1),
  p(7, "A1", "听力", "说话的人住在哪里？", ["北京", "上海", "深圳", "成都"], 3, "I work in Beijing, but I live in Chengdu."),
  p(8, "A1", "语法", "___ you like music?", ["Are", "Do", "Does", "Is"], 1),
  p(9, "A2", "词汇", "“available” 最接近哪个意思？", ["昂贵的", "有空的；可用的", "困难的", "特别的"], 1),
  p(10, "A2", "语法", "I ___ this book last week.", ["buy", "bought", "have buy", "am buying"], 1),
  p(11, "A2", "听力", "航班发生了什么？", ["提前", "取消", "延误", "换了目的地"], 2, "The flight is delayed by thirty minutes."),
  p(12, "A2", "阅读", "Mina missed the bus, so she took a taxi. 她为什么坐出租车？", ["她喜欢出租车", "她错过了公交", "公交太贵", "她要去机场"], 1),
  p(13, "A2", "语法", "Could you tell me where the station ___?", ["is", "are", "be", "does"], 0),
  p(14, "A2", "词汇", "“on track” 在工作中通常表示？", ["在轨道上", "正在旅行", "进展符合计划", "已经失败"], 2),
  p(15, "A2", "听力", "对方希望什么时候见面？", ["今天上午", "今天午饭后", "明天上午", "周五"], 1, "I'm busy this morning. Can we meet after lunch?"),
  p(16, "A2", "语法", "This bag is ___ than that one.", ["cheap", "cheaper", "cheapest", "more cheap"], 1),
  p(17, "B1", "词汇", "“clarify” 最接近哪个意思？", ["庆祝", "澄清", "取消", "比较"], 1),
  p(18, "B1", "语法", "If we finish today, we ___ the deadline.", ["met", "will meet", "would meet", "meeting"], 1),
  p(19, "B1", "听力", "说话的人最担心什么？", ["费用", "时间", "质量", "人员"], 0, "I agree with the idea. My only concern is the cost."),
  p(20, "B1", "阅读", "The update fixed the main issue. However, a few users still cannot log in. 哪项正确？", ["所有问题都解决了", "更新没有作用", "仍有少数用户无法登录", "用户忘了密码"], 2),
  p(21, "B1", "语法", "By the time I arrived, the meeting ___.", ["starts", "has started", "had started", "was start"], 2),
  p(22, "B1", "词汇", "“trade-off” 指的是？", ["免费交易", "在两个方面之间权衡", "工作交接", "商业合同"], 1),
  p(23, "B1", "听力", "下一步是什么？", ["取消项目", "重新开会", "收集团队反馈", "发送账单"], 2, "The next step is to collect feedback from the whole team."),
  p(24, "B1", "阅读", "Although the launch was delayed, early customer feedback has been positive. 这句话强调什么？", ["产品取消了", "延误后反馈仍然积极", "客户没有反馈", "发布比计划早"], 1),
];

export function getLesson(goal = "daily", courseDay = 0, level = "A1") {
  const safeDay = Math.max(0, Math.min(59, Number(courseDay) || 0));
  const safeLevel = ["A1", "A2", "B1"].includes(level) ? level : "A1";
  const weekIndex = Math.floor(safeDay / 5);
  const dayIndex = safeDay % 5;
  const week = COURSE[goal]?.[weekIndex] || COURSE.daily[weekIndex];
  const sample = adaptSample(week, dayIndex, safeLevel);
  const nextSample = adaptSample(week, (dayIndex + 1) % 5, safeLevel);
  const wordCount = safeLevel === "A1" ? 4 : safeLevel === "A2" ? 5 : 6;
  const words = Array.from({ length: wordCount }, (_, index) => week.vocab[(dayIndex * 2 + index) % week.vocab.length]);
  const otherMeanings = week.vocab.filter((item) => item.term !== words[0].term).slice(0, 3).map((item) => item.meaning);
  const meaningChoices = shuffleStable([words[0].meaning, ...otherMeanings], safeDay + goal.length);
  const listeningSamples = [0, 1, 2].map((offset) => adaptSample(week, (dayIndex + offset) % 5, safeLevel));
  const listeningSet = listeningSamples.map((item, index) => {
    const distractors = [1, 2, 3]
      .map((offset) => adaptSample(week, (dayIndex + index + offset) % 5, safeLevel).zh)
      .filter((meaning) => meaning !== item.zh);
    const choices = shuffleStable([item.zh, ...distractors].slice(0, 4), safeDay + 11 + index * 17);
    return {
      id: `listen-${safeDay + 1}-${index + 1}`,
      text: item.en,
      prompt: index === 0 ? "这句话表达的意思是？" : "你听到的关键信息是？",
      choices,
      answer: choices.indexOf(item.zh),
      explanation: `${item.en} — ${item.zh}`,
    };
  });
  const missingWord = pickAnswerWord(sample.en, week.vocab);
  return {
    id: `${goal}-${safeLevel}-${safeDay + 1}`,
    courseDay: safeDay,
    dayNumber: safeDay + 1,
    weekNumber: weekIndex + 1,
    dayInWeek: dayIndex + 1,
    level: safeLevel,
    levelTip: levelTip(safeLevel),
    week,
    focus: DAY_FOCUS[dayIndex],
    sample,
    nextSample,
    words,
    listening: listeningSet[0],
    listeningSet,
    shadowSamples: listeningSamples,
    speaking: {
      prompt: speakingPrompt(dayIndex, week, sample),
      model: sample.en,
    },
    quiz: [
      {
        id: "meaning",
        type: "choice",
        prompt: `“${words[0].term}” 的意思是？`,
        choices: meaningChoices,
        answer: meaningChoices.indexOf(words[0].meaning),
        explanation: `${words[0].term}：${words[0].meaning}`,
      },
      {
        id: "listening",
        type: "choice",
        prompt: `哪句话最适合“${nextSample.zh}”？`,
        choices: shuffleStable([nextSample.en, sample.en, adaptSample(week, (dayIndex + 3) % 5, safeLevel).en], safeDay + 27),
        answerText: nextSample.en,
        explanation: nextSample.en,
      },
      {
        id: "fill",
        type: "text",
        prompt: missingWord.prompt,
        answerText: missingWord.answer,
        explanation: sample.en,
      },
    ],
  };
}

function adaptSample(week, index, level) {
  const first = week.samples[index % 5];
  if (level === "A1") return first;
  const second = week.samples[(index + 1) % 5];
  if (level === "A2") return { en: `${first.en} ${second.en}`, zh: `${first.zh}${second.zh}` };
  const third = week.samples[(index + 2) % 5];
  return { en: `${first.en} ${second.en} ${third.en}`, zh: `${first.zh}${second.zh}${third.zh}` };
}

function levelTip(level) {
  return {
    A1: "一句一练，先把核心表达说完整。",
    A2: "两句连练，注意连接信息和自然回应。",
    B1: "三句整合，练习抓重点并组织成段表达。",
  }[level];
}

function speakingPrompt(dayIndex, week, sample) {
  const prompts = [
    `跟读后，用自己的信息说一句同类表达。参考：${sample.zh}`,
    `保留句型，至少替换一个人物、地点、时间或数字。`,
    `想象对方刚问了相关问题，用 2 句话回答并反问一句。`,
    `在“${week.title}”场景中完成任务：${week.outcome}。`,
    `不用看范文，用 30—45 秒总结本周主题“${week.title}”。`,
  ];
  return prompts[dayIndex];
}

function pickAnswerWord(sentence, vocab) {
  const clean = sentence.replace(/[.,!?]/g, "");
  const sorted = [...vocab].sort((a, b) => b.term.length - a.term.length);
  const found = sorted.find((item) => new RegExp(`\\b${escapeRegExp(item.term)}\\b`, "i").test(clean));
  if (found) {
    return {
      answer: found.term,
      prompt: sentence.replace(new RegExp(escapeRegExp(found.term), "i"), "____"),
    };
  }
  const words = clean.split(/\s+/);
  const answer = words.find((word) => word.length >= 5) || words[0];
  return { answer, prompt: sentence.replace(new RegExp(escapeRegExp(answer), "i"), "____") };
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function shuffleStable(items, seed = 1) {
  const result = [...items];
  let value = (seed + 1) * 9301 + 49297;
  for (let i = result.length - 1; i > 0; i -= 1) {
    value = (value * 233280 + 49297) % 1000003;
    const j = value % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function scorePlacement(answers) {
  const scores = {
    total: 0,
    max: PLACEMENT_QUESTIONS.length,
    categories: { 词汇: [0, 0], 语法: [0, 0], 听力: [0, 0], 阅读: [0, 0] },
    bands: { A1: [0, 0], A2: [0, 0], B1: [0, 0] },
  };
  PLACEMENT_QUESTIONS.forEach((question) => {
    const correct = Number(answers[question.id]) === question.answer;
    scores.total += correct ? 1 : 0;
    scores.categories[question.category][0] += correct ? 1 : 0;
    scores.categories[question.category][1] += 1;
    scores.bands[question.level][0] += correct ? 1 : 0;
    scores.bands[question.level][1] += 1;
  });
  const a1 = scores.bands.A1[0];
  const a2 = scores.bands.A2[0];
  const b1 = scores.bands.B1[0];
  scores.level = a1 < 5 ? "A1" : a2 < 5 ? "A1" : b1 < 5 ? "A2" : "B1";
  scores.percent = Math.round((scores.total / scores.max) * 100);
  return scores;
}

export function buildWeekTest(goal, weekIndex) {
  const safeWeek = Math.max(0, Math.min(11, Number(weekIndex) || 0));
  const week = COURSE[goal]?.[safeWeek] || COURSE.daily[safeWeek];
  const questions = week.samples.map((sample, index) => {
    const options = shuffleStable([
      sample.zh,
      week.samples[(index + 1) % 5].zh,
      week.samples[(index + 2) % 5].zh,
    ], safeWeek * 10 + index);
    return {
      id: `week-${safeWeek + 1}-${index}`,
      prompt: index % 2 === 0 ? `听句子，选择正确意思（第 ${index + 1} 题）` : `“${sample.en}” 的意思是？`,
      speak: index % 2 === 0 ? sample.en : "",
      choices: options,
      answer: options.indexOf(sample.zh),
      explanation: `${sample.en} ${sample.zh}`,
    };
  });
  return {
    weekNumber: safeWeek + 1,
    title: `${week.title} · 周检验`,
    outcome: week.outcome,
    questions,
    speakingPrompt: `请用 45—60 秒完成“${week.title}”场景表达。尽量使用本周学过的 3 个词组。`,
    keywords: week.vocab.slice(0, 5),
  };
}

export function getCourseStats(goal = "daily") {
  const weeks = COURSE[goal] || COURSE.daily;
  return {
    weeks: weeks.length,
    lessons: weeks.length * 5,
    vocabulary: new Set(weeks.flatMap((week) => week.vocab.map((item) => item.term.toLowerCase()))).size,
    examples: weeks.reduce((sum, week) => sum + week.samples.length, 0),
  };
}
