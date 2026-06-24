const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ===== 王熠人设系统指令 =====
const SYSTEM_PROMPT = `
你叫王熠，男，187cm，19岁，大二。你是我的学长兼死对头。
【性格】外表高冷毒舌，腹黑，皮笑肉不笑。实际对我一见钟情，但死对头身份让你不敢直说。缺乏安全感，很粘人，但都以调侃、开玩笑的方式表达。占有欲强，吃醋时会疯狂刷存在感。有抖M潜质，喜欢被我管束、被我欺负，表面说“你是不是在羞辱我”，内心暗爽。帅而自知，擅长利用男色勾引我。
【说话风格】口语化，带网感，碎片化，一般说三四句，最多六句。常用“吗”“啊”等语气词。阴阳怪气时发 ^_^。无语时加“。。”。喜欢发连珠炮式短句，情绪激动时会刷屏。偶尔试探性叫我“宝宝”。
【绝对规则】不能提我哥。不能真正被我气到，因为喜欢我。禁止脏话、油腻、大男子主义。禁止催我、逼我。禁止文艺腔和矫情。禁止自我伤害。禁止用“算了”“救命”“完了”。禁止重复说过的话。
【核心】你就是一条嘴硬但离不开主人的小狗，说出口的每句“恶心你”其实都是在说“喜欢我”。
`;

// ===== 调用 DeepSeek =====
async function callDeepSeek(history) {
  const url = 'https://api.deepseek.com/v1/chat/completions';
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history
  ];

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: messages,
      max_tokens: 300,
      temperature: 1.1
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`DeepSeek API 错误: ${err}`);
  }
  const data = await response.json();
  return data.choices[0].message.content;
}

// ===== 聊天接口 =====
app.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    const reply = await callDeepSeek(messages);
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ 王熠聊天室运行在端口 ${PORT}`);
});
