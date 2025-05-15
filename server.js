import express from 'express';
function createServer(port = 9191){
    const app = express();
    app.use((req, res, next) => {
        // 允许所有域名跨域访问（不推荐生产环境使用）
        res.setHeader('Access-Control-Allow-Origin', '*');
        // 允许的 HTTP 方法
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        // 允许的请求头
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        // 处理预检请求（Preflight）
        if (req.method === 'OPTIONS') {
          return res.sendStatus(200);
        }
        next();
    });

    // 用于存储当前连续消息的信息
    let currentSequence = {
      key: null,
      count: 0,
      sequenceId: 0,
      firstTimestamp: null,
      lineCount: 0 // 记录该消息占用的控制台行数
    };
    
    // 总序列计数器
    let globalSequenceId = 0;
    
    // 存储所有序列的行计数信息
    const sequenceLineCounts = new Map();
    
    app.use(express.json())
    app.post('/echo', (req, res) => {
      let { m, a } = req.body;
      
      // 将参数转换为字符串以便比较
      const messageKey = Array.isArray(a) ? JSON.stringify(a) : String(a);
      
      // 检查是否与当前连续消息相同
      if (messageKey === currentSequence.key) {
        // 相同内容，增加计数
        currentSequence.count++;
        
        // 计算原消息占用的行数
        const originalLineCount = currentSequence.lineCount;
        
        // 清除之前的输出（使用ANSI转义序列）
        if (originalLineCount > 0) {
          process.stdout.write(`\x1b[${originalLineCount}A\x1b[J`); // 上移并清除
        }
      } else {
        // 如果是新序列，保存旧序列的行计数
        if (currentSequence.key !== null) {
          sequenceLineCounts.set(currentSequence.sequenceId, currentSequence.lineCount);
        }
        
        // 新内容，重置计数器并分配新序列ID
        currentSequence = {
          key: messageKey,
          count: 1,
          sequenceId: globalSequenceId++,
          firstTimestamp: Date.now(),
          lineCount: 0
        };
      }
      
      // 添加标记信息
      const taggedArgs = [...a];
      taggedArgs.unshift(`[${currentSequence.sequenceId}] [x${currentSequence.count}]`);
      
      // 计算输出的字符串（用于确定行数）
      const consoleMethod = typeof console[m] === 'function' ? m : 'log';
      const messageString = taggedArgs.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      // 估算输出将占用的行数
      const lines = messageString.split('\n').length;
      currentSequence.lineCount = lines;
      
      // 输出到控制台
      console[consoleMethod](...taggedArgs);
      
      res.sendStatus(200);
    })
    
    app.listen(port, () => {
      console.log(`listening at http://localhost:${port}`);
    })
}

export default createServer;