import express from 'express';
import http from 'http';

function createServer(port = 9191){
    const app = express();
    // 创建HTTP服务器实例
    const server = http.createServer(app);
    
    app.use((req, res, next) => {
        // 允许所有域名跨域访问（不推荐生产环境使用）
        res.setHeader('Access-Control-Allow-Origin', '*');
        // 允许的 HTTP 方法
        res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
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
    
    let globalSequenceId = 0;
    const sequenceLineCounts = new Map();
    const codeStore = [];
    const pendingCodeRequests = [];
    const CODE_REQUEST_TIMEOUT = 10000;
    let isRequestingCode = false;
    
    function processLogMessage(method, args) {
      const messageKey = Array.isArray(args) ? JSON.stringify(args) : String(args);
      
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
        if (currentSequence.key !== null) {
          sequenceLineCounts.set(currentSequence.sequenceId, currentSequence.lineCount);
        }
        
        currentSequence = {
          key: messageKey,
          count: 1,
          sequenceId: globalSequenceId++,
          firstTimestamp: Date.now(),
          lineCount: 0
        };
      }
      
      // 添加标记信息
      const taggedArgs = [...args];
      taggedArgs.unshift(`[${currentSequence.sequenceId}] [x${currentSequence.count}]`);
      
      // 计算输出的字符串（用于确定行数）
      const consoleMethod = typeof console[method] === 'function' ? method : 'log';
      const messageString = taggedArgs.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      
      // 估算输出将占用的行数
      const lines = messageString.split('\n').length;
      currentSequence.lineCount = lines;
      
      // 输出到控制台
      console[consoleMethod](...taggedArgs);
      
      return { status: 'success' };
    }
    
    // 处理保存code的函数
    function processSaveCode(code) {
      if (isRequestingCode) {
        isRequestingCode = false;
        
        // 处理所有等待的请求
        while (pendingCodeRequests.length > 0) {
          const pendingRequest = pendingCodeRequests.shift();
          clearTimeout(pendingRequest.timeoutId);
          pendingRequest.callback({ success: true, code });
        }
      } else {
        codeStore.push(code);
        console.log(`保存code: ${code}, 总数: ${codeStore.length}`);
      }
      
      return { status: 'success' };
    }
    
    function processGetCode(cb) {
      if(codeStore.length){
        const code = codeStore.shift();
        cb({ success: true, code });
        return;
      }
      
      isRequestingCode = true;
      
      const timeoutId = setTimeout(() => {
        const index = pendingCodeRequests.findIndex(req => req.timeoutId === timeoutId);
        if (index !== -1) {
          pendingCodeRequests.splice(index, 1);
          
          if (pendingCodeRequests.length === 0) {
            isRequestingCode = false;
          }
          
          cb({ success: false, message: '获取code超时' });
        }
      }, CODE_REQUEST_TIMEOUT);
      
      pendingCodeRequests.push({
        callback: cb,
        timeoutId: timeoutId
      });
    }
    
    // 统一的命令处理函数
    function processCommand(cmd, params, cb) {
      switch(cmd) {
        case 'echo':
          if (!params || !params.method || !params.args) {
            cb({ status: 'error', message: '缺少必要参数' });
            return;
          }
          processLogMessage(params.method, params.args);
          cb({});
          break;

        case 'saveCode':
          if (!params || !params.code) {
            cb({ status: 'error', message: '缺少code参数' });
            return;
          }
          cb(processSaveCode(params.code));
          break;
          
        case 'getCode':
          processGetCode(cb);
          break;
          
        case 'checkCodeStatus':
          cb({ 
            status: 'success', 
            isRequestingCode: isRequestingCode,
          });
          break;

        default:
          cb({ status: 'error', message: `未知命令: ${cmd}` });
      }
    }
    
    app.use(express.json());
    
    // 统一的HTTP接口
    app.post('/doAction', (req, res) => {
      const { cmd, params } = req.body;
      
      if (!cmd) {
        return res.status(400).json({ status: 'error', message: '缺少cmd参数' });
      }
      
      processCommand(cmd, params, function(result){
        res.json(result);
      });
    });
    
    // 使用HTTP服务器
    server.listen(port, () => {
      console.log(`HTTP listen port: ${port}`);
    });
}

export default createServer;