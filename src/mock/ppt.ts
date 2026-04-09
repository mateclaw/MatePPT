

// 生成模拟幻灯片数据
const generateMockSlideData = (slideNo: number, totalPage: number) => {
  const titles = [
    '高校消防安全教育：预防·应对·自救',
    '消防安全基础知识',
    '火灾的危害与预防',
    '应急逃生要点',
    '灭火器的正确使用',
    '家庭火灾隐患排查',
    '工作场所消防安全',
    '学生宿舍安全须知',
    '消防疏散演练',
    '火灾案例分析',
    '互联网时代的安全隐患',
    '化学品泄漏应急处理',
    '电气火灾防范',
    '厨房用火安全',
    '楼梯间应急通道',
    '消防设施维护保养',
    '火警报警程序',
    '应急联系方式',
    '灭火工具大全',
    '消防安全承诺书',
    '知识竞赛问题',
    '总结与建议'
  ];

  return {
    "projectId": "2a7f136f-6d16-4291-8361-2d18d4ea83d2",
    "slideNo": slideNo,
    "totalPage": totalPage,
    "slideJSON": {
      "title": slideNo === 1 ? titles[0] : titles[slideNo - 1] || `幻灯片 ${slideNo}`,
      "width": 1280.0,
      "height": 720.0,
      "theme": {
        "themeColors": ["rgba(7,31,101,1)", "rgba(166,166,166,1)", "rgba(242,242,242,1)", "#FFC000", "#5B9BD5", "#70AD47"],
        "fontColor": "#333",
        "fontName": "",
        "backgroundColor": "#fff",
        "shadow": { "h": 3.0, "v": 3.0, "blur": 2.0, "color": "#808080" },
        "outline": { "width": 2.0, "color": "#525252", "style": "solid" }
      },
      "slides": [{
        "id": `slide-${slideNo}`,
        "elements": [{
          "type": "text",
          "id": `text-${slideNo}`,
          "left": 100,
          "top": 100,
          "width": 1080,
          "height": 520,
          "rotate": 0.0,
          "lock": false,
          "outline": { "width": 0.0, "color": "#000000", "style": "solid" },
          "content": `<p style="font-size: 32px; color: #071F65;"><strong>${titles[slideNo - 1] || `幻灯片 ${slideNo}`}</strong></p><p style="font-size: 18px; color: #666; margin-top: 20px;">第 ${slideNo} / ${totalPage} 页</p>`,
          "defaultFontName": "",
          "defaultColor": "#333",
          "vertical": false,
          "fill": "",
          "lineHeight": 1.0
        }]
      }]
    }
  };
};

export default {
  'POST /aippt/api/ppt/template/list': {
    "code": 0,
    "msg": "操作成功",
    "total": 3,
    "data": [
      {
        "id": 1,
        "templateId": "1",
        "templateName": "商务演示模板",
        "coverImage": "https://example.com/template1.png",
        "description": "适用于商务汇报和企业展示",
        "templateCategory": "business",
        "isFree": true,
        "price": 0,
        "downloadCount": 1250,
        "rating": 4.8,
        "author": "AI设计师",
        "createTime": "2023-05-15",
        "updateTime": "2023-05-15"
      },
      {
        "id": 2,
        "templateId": "2",
        "templateName": "教育培训模板",
        "coverImage": "https://example.com/template2.png",
        "description": "专为教育培训场景设计",
        "templateCategory": "education",
        "isFree": true,
        "price": 0,
        "downloadCount": 980,
        "rating": 4.6,
        "author": "教育模板专家",
        "createTime": "2023-06-20",
        "updateTime": "2023-06-20"
      },
      {
        "id": 3,
        "templateId": "3",
        "templateName": "创意展示模板",
        "coverImage": "https://example.com/template3.png",
        "description": "富有创意的展示模板",
        "templateCategory": "creative",
        "isFree": false,
        "price": 29.9,
        "downloadCount": 650,
        "rating": 4.9,
        "author": "创意工作室",
        "createTime": "2023-07-10",
        "updateTime": "2023-07-10"
      }
    ] as any[]
  },
  'POST /aippt/api/ppt/slide/classicGenerate': (req: any, res: any) => {
    // 模拟流式返回幻灯片数据
    const totalPage = 22;
    let slideNo = 1;
    
    const sendSlide = () => {
      if (slideNo <= totalPage) {
        const mockData = generateMockSlideData(slideNo, totalPage);
        res.write(`data: ${JSON.stringify({ role: 'SLIDE', content: JSON.stringify(mockData) })}\n\n`);
        slideNo++;
        // 模拟延迟，每个幻灯片间隔 500ms
        setTimeout(sendSlide, 500);
      } else {
        res.end();
      }
    };
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    sendSlide();
  },
  'POST /aippt/api/ppt/project/list': {
    "code": 0,
    "msg": "操作成功",
    "total": 200,
    "data": [
      {
        "id": 1,
        "projectId": "proj-001",
        "projectName": "Q1销售汇报",
        "createMode": "classic",
        "userInput": "Q1销售业绩汇报PPT",
        "status": "completed",
        "createTime": "2024-01-15 10:30:00",
        "createUserName": "admin"
      },
      {
        "id": 2,
        "projectId": "proj-002",
        "projectName": "产品发布会",
        "createMode": "creative",
        "userInput": "新产品发布会讲稿",
        "status": "completed",
        "createTime": "2024-01-10 14:20:00",
        "createUserName": "admin"
      },
      {
        "id": 3,
        "projectId": "proj-003",
        "projectName": "团队建设方案",
        "createMode": "classic",
        "userInput": "2024年团队建设计划",
        "status": "completed",
        "createTime": "2024-01-08 09:15:00",
        "createUserName": "user1"
      },
      {
        "id": 4,
        "projectId": "proj-004",
        "projectName": "市场分析报告",
        "createMode": "classic",
        "userInput": "2024年市场竞争分析",
        "status": "completed",
        "createTime": "2024-01-05 16:45:00",
        "createUserName": "user2"
      },
      {
        "id": 5,
        "projectId": "proj-005",
        "projectName": "技术分享会",
        "createMode": "creative",
        "userInput": "AI技术发展趋势分享",
        "status": "completed",
        "createTime": "2024-01-03 11:00:00",
        "createUserName": "admin"
      },
      {
        "id": 6,
        "projectId": "proj-006",
        "projectName": "年度总结大会",
        "createMode": "classic",
        "userInput": "2023年度工作总结",
        "status": "completed",
        "createTime": "2024-01-01 08:30:00",
        "createUserName": "user3"
      },
      {
        "id": 7,
        "projectId": "proj-007",
        "projectName": "客户培训课程",
        "createMode": "classic",
        "userInput": "产品使用培训PPT",
        "status": "completed",
        "createTime": "2023-12-28 13:20:00",
        "createUserName": "user4"
      },
      {
        "id": 8,
        "projectId": "proj-008",
        "projectName": "品牌宣传方案",
        "createMode": "creative",
        "userInput": "企业品牌推广策略",
        "status": "completed",
        "createTime": "2023-12-25 10:00:00",
        "createUserName": "user1"
      },
      {
        "id": 9,
        "projectId": "proj-009",
        "projectName": "投融资路演",
        "createMode": "classic",
        "userInput": "融资路演PPT",
        "status": "completed",
        "createTime": "2023-12-20 15:30:00",
        "createUserName": "user2"
      },
      {
        "id": 10,
        "projectId": "proj-010",
        "projectName": "教育培训方案",
        "createMode": "classic",
        "userInput": "在线教育课程设计",
        "status": "completed",
        "createTime": "2023-12-18 09:45:00",
        "createUserName": "admin"
      },
      {
        "id": 11,
        "projectId": "proj-011",
        "projectName": "产品演示视频脚本",
        "createMode": "creative",
        "userInput": "产品展示演示稿",
        "status": "completed",
        "createTime": "2023-12-15 14:15:00",
        "createUserName": "user3"
      },
      {
        "id": 12,
        "projectId": "proj-012",
        "projectName": "企业文化介绍",
        "createMode": "classic",
        "userInput": "公司文化和价值观",
        "status": "completed",
        "createTime": "2023-12-12 11:20:00",
        "createUserName": "user4"
      },
      {
        "id": 13,
        "projectId": "proj-013",
        "projectName": "销售技巧培训",
        "createMode": "classic",
        "userInput": "销售方法论和技巧",
        "status": "completed",
        "createTime": "2023-12-10 16:00:00",
        "createUserName": "user1"
      },
      {
        "id": 14,
        "projectId": "proj-014",
        "projectName": "项目总结报告",
        "createMode": "classic",
        "userInput": "项目完成情况总结",
        "status": "completed",
        "createTime": "2023-12-08 10:30:00",
        "createUserName": "user2"
      },
      {
        "id": 15,
        "projectId": "proj-015",
        "projectName": "市场营销策略",
        "createMode": "creative",
        "userInput": "2024年市场营销计划",
        "status": "completed",
        "createTime": "2023-12-05 13:45:00",
        "createUserName": "admin"
      },
      {
        "id": 16,
        "projectId": "proj-016",
        "projectName": "新员工入职培训",
        "createMode": "classic",
        "userInput": "员工入职培训课程",
        "status": "completed",
        "createTime": "2023-12-03 09:00:00",
        "createUserName": "user3"
      },
      {
        "id": 17,
        "projectId": "proj-017",
        "projectName": "财务分析报告",
        "createMode": "classic",
        "userInput": "季度财务数据分析",
        "status": "completed",
        "createTime": "2023-11-30 14:20:00",
        "createUserName": "user4"
      },
      {
        "id": 18,
        "projectId": "proj-018",
        "projectName": "研发成果展示",
        "createMode": "creative",
        "userInput": "技术研发成果发布",
        "status": "completed",
        "createTime": "2023-11-28 11:15:00",
        "createUserName": "user1"
      },
      {
        "id": 19,
        "projectId": "proj-019",
        "projectName": "客户案例分享",
        "createMode": "classic",
        "userInput": "成功案例和客户反馈",
        "status": "completed",
        "createTime": "2023-11-25 15:30:00",
        "createUserName": "user2"
      },
      {
        "id": 20,
        "projectId": "proj-020",
        "projectName": "竞品分析对标",
        "createMode": "classic",
        "userInput": "竞争对手分析报告",
        "status": "completed",
        "createTime": "2023-11-22 10:45:00",
        "createUserName": "admin"
      }
    ]
  },
//   'POST /aippt/api/ppt/outline/generate':`
//   data:{"role":"assistant","content":"#### ✓ 大纲生成开始\n- 正在为您生成PPT大纲，请稍候...\n\n"}

// data:{"role":"assistant","content":"#### ✓ 正在输出大纲\n"}

// data:{"role":"assistant","content":"\n<highlight-detail>\n"}

// data:{"role":"assistant","content":"### 中国新能源汽车发展现状与展望\n\n"}

// data:{"role":"assistant","content":"#### 中国新能源汽车发展现状\n"}

// data:{"role":"assistant","content":" -页面中央呈现主标题‘中国新能源汽车发展现状’，下方可添加副标题‘驶向未来的绿色引擎’。页面底部区域展示演讲者信息（如：XXX部门/分析师）及日期‘2025年12月17日’。背景可选用具有科技感或未来感的抽象线条、电路板图案或新能源汽车元素，整体风格简洁、专业。\n\n"}

// data:{"role":"assistant","content":"#### 目录\n"}

// data:heartbeat

// data:{"role":"assistant","content":" -本页为目录页，清晰列出本次汇报的三个主要章节，并简要说明各章节核心内容，引导听众了解整体框架。具体呈现如下：1.市场全景：规模与驱动因素 –概述当前市场规模、增长态势及核心驱动力。2.产业纵深：技术、品牌与生态 –深入分析关键技术进展、品牌格局及产业链生态。3.未来展望：机遇与挑战并存 –探讨未来发展面临的机遇、挑战与趋势。\n\n"}

// data:{"role":"assistant","content":"#### 市场全景：规模与驱动因素\n"}

// data:{"role":"assistant","content":" -本页旨在展示中国新能源汽车市场的宏观图景。首先，通过柱状图或折线图呈现近5年（2021-2025）中国新能源汽车销量及市场渗透率的快速增长数据，突出其已成为全球最大市场。其次，分点阐述核心驱动因素：1.政策强力支持（如双积分、购置税减免、补贴退坡但转向基础设施）；2.消费者认知与接受度提升（环保意识、使用成本优势）；3.技术进步与成本下降（电池能量密度提升、整车成本优化）。最后，总结当前市场已从政策驱动转向‘市场+政策’双轮驱动的新阶段。\n\n"}

// data:{"role":"assistant","content":"#### 产业纵深：技术、品牌与生态\n"}

// data:heartbeat

// data:{"role":"assistant","content":" -本页深入剖析产业内部核心要素。左侧区域聚焦‘技术突破’：列举电池（如固态电池研发进展）、电机、电控及智能网联（自动驾驶、座舱交互）等领域的关键技术进步。中间区域分析‘品牌格局’：通过矩阵图或品牌标识展示市场分层，包括传统车企转型（如比亚迪、吉利）、造车新势力（如蔚来、理想、小鹏）以及科技公司跨界（如华为、小米）形成的多元化竞争态势。右侧区域概述‘产业链生态’：强调从上游原材料（锂、钴、镍）到中游三电系统，再到下游充电服务、电池回收的完整产业链已初步构建，但部分环节（如芯片、高端材料）仍需加强。\n\n"}

// data:{"role":"assistant","content":"#### 充电基础设施：发展的基石\n"}

// data:heartbeat

// data:{"role":"assistant","content":" -本页专门探讨支撑新能源汽车普及的关键基础设施——充电网络。首先，展示全国公共充电桩保有量及增长数据图表，并对比快充桩与慢充桩的比例。其次，分析当前充电设施面临的挑战：1.区域分布不均（东部沿海密集，中西部及偏远地区不足）；2.节假日高速服务区排队现象；3.技术标准统一与互联互通问题。然后，介绍解决方案与发展方向：大功率超充技术推广、光储充一体化电站、换电模式探索（如蔚来、宁德时代）以及V2G（车辆到电网）技术的应用前景。强调完善的基础设施是消除用户里程焦虑、推动行业可持续发展的根本。\n\n"}

// data:{"role":"assistant","content":"#### 未来展望：机遇与挑战并存\n"}

// data:{"role":"assistant","content":" -本页转向对未来的前瞻性分析。页面分为左右两部分。左侧‘机遇与趋势’：1.市场持续渗透，向三四线城市及农村市场下沉；2.智能化、网联化深度融合，定义下一代汽车；3.出口成为新增长极，中国品牌加速全球化布局；4.绿色能源协同（新能源汽车与可再生能源发电、储能结合）。右侧‘挑战与应对’：1.供应链安全与原材料价格波动风险；2.核心技术（如高端芯片、先进电池材料）自主可控压力；3.市场竞争白热化下的盈利挑战；4.数据安全与隐私保护法规完善。总结指出，行业将在解决这些挑战的过程中迈向更高质量的发展。\n\n"}

// data:{"role":"assistant","content":"#### 总结\n"}

// data:heartbeat

// data:{"role":"assistant","content":" -本页对前述内容进行系统性总结。采用要点列表形式，提炼核心结论：1.中国新能源汽车产业已建立起全球领先的市场规模与完整的产业体系。2.发展动力成功实现从政策主导向‘市场内生动力+政策引导’的切换。3.在电动化基础上，智能化、网联化正成为产业竞争的新焦点。4.未来发展需在巩固规模优势的同时，着力攻克核心技术短板、优化基础设施布局、应对全球化竞争。最后，以一句展望性话语收尾，如‘中国新能源汽车，正从‘汽车大国’向‘汽车强国’的关键路径上加速前行’。\n\n"}

// data:{"role":"assistant","content":"#### Q&A\n"}

// data:{"role":"assistant","content":" -本页为问答环节预留页面。页面中央醒目显示‘Q&A’或‘提问与交流’字样。下方可放置简短的引导语，如‘感谢聆听，欢迎提问与交流’。页面设计保持简洁，留出充足视觉空间，便于演讲者与听众互动。背景可与封面或整体风格保持一致。\n\n"}

// data:{"role":"assistant","content":"#### 感谢聆听\n"}

// data:heartbeat

// data:{"role":"assistant","content":" -本页为结束页。页面中央显示‘感谢聆听’或‘THANK YOU’等感谢语。下方可放置机构Logo、演讲者姓名及简要联系方式（如邮箱）。整体风格庄重、简洁，与封面页形成呼应，标志本次汇报圆满结束。\n\n"}

// data:{"role":"assistant","content":"\n\n</highlight-detail>\n\n"}

// data:{"role":"OUTLINE","content":"{\"pageCount\":9,\"pptTitle\":\"中国新能源汽车发展现状与展望\",\"slides\":[{\"description\":\"页面中央呈现主标题‘中国新能源汽车发展现状’，下方可添加副标题‘驶向未来的绿色引擎’。页面底部区域展示演讲者信息（如：XXX部门/分析师）及日期‘2025年12月17日’。背景可选用具有科技感或未来感的抽象线条、电路板图案或新能源汽车元素，整体风格简洁、专业。\",\"slideNo\":1,\"slideType\":\"cover\",\"title\":\"中国新能源汽车发展现状\"},{\"description\":\"本页为目录页，清晰列出本次汇报的三个主要章节，并简要说明各章节核心内容，引导听众了解整体框架。具体呈现如下：1. 市场全景：规模与驱动因素 – 概述当前市场规模、增长态势及核心驱动力。2. 产业纵深：技术、品牌与生态 – 深入分析关键技术进展、品牌格局及产业链生态。3. 未来展望：机遇与挑战并存 – 探讨未来发展面临的机遇、挑战与趋势。\",\"slideNo\":2,\"slideType\":\"catalog\",\"title\":\"目录\"},{\"description\":\"本页旨在展示中国新能源汽车市场的宏观图景。首先，通过柱状图或折线图呈现近5年（2021-2025）中国新能源汽车销量及市场渗透率的快速增长数据，突出其已成为全球最大市场。其次，分点阐述核心驱动因素：1. 政策强力支持（如双积分、购置税减免、补贴退坡但转向基础设施）；2. 消费者认知与接受度提升（环保意识、使用成本优势）；3. 技术进步与成本下降（电池能量密度提升、整车成本优化）。最后，总结当前市场已从政策驱动转向‘市场+政策’双轮驱动的新阶段。\",\"slideNo\":3,\"slideType\":\"content\",\"title\":\"市场全景：规模与驱动因素\"},{\"description\":\"本页深入剖析产业内部核心要素。左侧区域聚焦‘技术突破’：列举电池（如固态电池研发进展）、电机、电控及智能网联（自动驾驶、座舱交互）等领域的关键技术进步。中间区域分析‘品牌格局’：通过矩阵图或品牌标识展示市场分层，包括传统车企转型（如比亚迪、吉利）、造车新势力（如蔚来、理想、小鹏）以及科技公司跨界（如华为、小米）形成的多元化竞争态势。右侧区域概述‘产业链生态’：强调从上游原材料（锂、钴、镍）到中游三电系统，再到下游充电服务、电池回收的完整产业链已初步构建，但部分环节（如芯片、高端材料）仍需加强。\",\"slideNo\":4,\"slideType\":\"content\",\"title\":\"产业纵深：技术、品牌与生态\"},{\"description\":\"本页专门探讨支撑新能源汽车普及的关键基础设施——充电网络。首先，展示全国公共充电桩保有量及增长数据图表，并对比快充桩与慢充桩的比例。其次，分析当前充电设施面临的挑战：1. 区域分布不均（东部沿海密集，中西部及偏远地区不足）；2. 节假日高速服务区排队现象；3. 技术标准统一与互联互通问题。然后，介绍解决方案与发展方向：大功率超充技术推广、光储充一体化电站、换电模式探索（如蔚来、宁德时代）以及V2G（车辆到电网）技术的应用前景。强调完善的基础设施是消除用户里程焦虑、推动行业可持续发展的根本。\",\"slideNo\":5,\"slideType\":\"content\",\"title\":\"充电基础设施：发展的基石\"},{\"description\":\"本页转向对未来的前瞻性分析。页面分为左右两部分。左侧‘机遇与趋势’：1. 市场持续渗透，向三四线城市及农村市场下沉；2. 智能化、网联化深度融合，定义下一代汽车；3. 出口成为新增长极，中国品牌加速全球化布局；4. 绿色能源协同（新能源汽车与可再生能源发电、储能结合）。右侧‘挑战与应对’：1. 供应链安全与原材料价格波动风险；2. 核心技术（如高端芯片、先进电池材料）自主可控压力；3. 市场竞争白热化下的盈利挑战；4. 数据安全与隐私保护法规完善。总结指出，行业将在解决这些挑战的过程中迈向更高质量的发展。\",\"slideNo\":6,\"slideType\":\"content\",\"title\":\"未来展望：机遇与挑战并存\"},{\"description\":\"本页对前述内容进行系统性总结。采用要点列表形式，提炼核心结论：1. 中国新能源汽车产业已建立起全球领先的市场规模与完整的产业体系。2. 发展动力成功实现从政策主导向‘市场内生动力+政策引导’的切换。3. 在电动化基础上，智能化、网联化正成为产业竞争的新焦点。4. 未来发展需在巩固规模优势的同时，着力攻克核心技术短板、优化基础设施布局、应对全球化竞争。最后，以一句展望性话语收尾，如‘中国新能源汽车，正从‘汽车大国’向‘汽车强国’的关键路径上加速前行’。\",\"slideNo\":7,\"slideType\":\"content\",\"title\":\"总结\"},{\"description\":\"本页为问答环节预留页面。页面中央醒目显示‘Q&A’或‘提问与交流’字样。下方可放置简短的引导语，如‘感谢聆听，欢迎提问与交流’。页面设计保持简洁，留出充足视觉空间，便于演讲者与听众互动。背景可与封面或整体风格保持一致。\",\"slideNo\":8,\"slideType\":\"content\",\"title\":\"Q&A\"},{\"description\":\"本页为结束页。页面中央显示‘感谢聆听’或‘THANK YOU’等感谢语。下方可放置机构Logo、演讲者姓名及简要联系方式（如邮箱）。整体风格庄重、简洁，与封面页形成呼应，标志本次汇报圆满结束。\",\"slideNo\":9,\"slideType\":\"end\",\"title\":\"感谢聆听\"}]}"}

// data:{"role":null,"content":null}

// `,

  'POST /aiavatar/api/avatarInfo/my/list':{
    "code": 0,
    "msg": "success",
    "total": 3,
    "data": [
        {
            "avatarId": 23,
            "avatarName": "绿幕默认形象1",
            "avatarType": "system",
            "createUserId": 1,
            "createUserName": "超级用户",
            "createTime": "2026-01-19 17:56:27",
            "taskStatus": 0,
            "coverUrl": "https://mateai.co:9000/mateai-studio/aiavatar/1/绿幕默认形象1/avatar_cover_1_1762323548214.jpg"
        },
        {
            "avatarId": 3,
            "avatarName": "卡通形象1",
            "avatarType": "system",
            "createUserId": 1,
            "createUserName": "超级用户",
            "createTime": "2026-01-19 17:53:47",
            "taskStatus": 1,
            "coverUrl": "https://mateai.co:9000/mateai-studio/aiavatar/1/卡通形象1/5.png"
        },
        {
            "avatarId": 7901467685937152,
            "avatarName": "ced",
            "avatarType": "user",
            "createUserId": 1,
            "createUserName": "10001@mateai.co",
            "createTime": "2026-01-21 19:17:36",
            "avatarPath": "pending:aiavatar/1/2-aBfozkm1Y.mp4",
            "taskStatus": 2,
            "errorMessage": "输入视频数据为空，无法创建数字人形象",
            "startTime": "2026-01-21 19:17:36",
            "endTime": "2026-01-21 19:17:37"
        },
        {
            "avatarId": 24,
            "avatarName": "绿幕默认形象1",
            "avatarType": "system",
            "createUserId": 1,
            "createUserName": "超级用户",
            "createTime": "2026-01-19 17:56:27",
            "taskStatus": 3,
            "coverUrl": "https://mateai.co:9000/mateai-studio/aiavatar/1/绿幕默认形象1/avatar_cover_1_1762323548214.jpg"
        },
        {
            "avatarId": 5,
            "avatarName": "卡通形象1",
            "avatarType": "system",
            "createUserId": 1,
            "createUserName": "超级用户",
            "createTime": "2026-01-19 17:53:47",
            "taskStatus": 4,
            "coverUrl": "https://mateai.co:9000/mateai-studio/aiavatar/1/卡通形象1/5.png"
        },
        {
            "avatarId": 7901467685937151,
            "avatarName": "ced",
            "avatarType": "user",
            "createUserId": 1,
            "createUserName": "10001@mateai.co",
            "createTime": "2026-01-21 19:17:36",
            "avatarPath": "pending:aiavatar/1/2-aBfozkm1Y.mp4",
            "taskStatus": 5,
            "errorMessage": "输入视频数据为空，无法创建数字人形象",
            "startTime": "2026-01-21 19:17:36",
            "endTime": "2026-01-21 19:17:37"
        },
    ]
}
};
