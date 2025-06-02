(function hookConsole(baseUrl) {
  const actionUrl = `${baseUrl}/doAction`;
  
  const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;
  const isModernBrowser = typeof window !== 'undefined' && typeof fetch === 'function';
  const isLegacyBrowser = typeof window !== 'undefined' && typeof XMLHttpRequest !== 'undefined';

  // 发送HTTP请求
  function sendHttpRequest(url, cmd, params, success) {
    if(!success){
      success = (res) => {
      }
    }

    if (isNode) {
      const httpModule = require('http');
      const data = JSON.stringify({ cmd, params });
      const urlObj = new URL(url);

      const req = httpModule.request({
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      }, (res) => {
        let responseData = '';
        res.on('data', (chunk) => responseData += chunk);
        res.on('end', () => {
          success(responseData)
        });
      });

      req.on('error', (error) => console.error(`Node请求失败: ${error.message}`));
      req.write(data);
      req.end();
      return req;
    }

    if (isModernBrowser) {
      return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cmd, params })
      })
        .then(success)
        .catch(error => {
          console.log(`hookConsole Fetch请求失败: ${error.message}`);
        });
    }

    // 传统浏览器环境 (XMLHttpRequest)
    if (isLegacyBrowser) {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.responseType = 'json';

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            success(xhr.response);
          } else {
            console.error(new Error(`XHR请求失败: ${xhr.status} ${xhr.statusText}`));
          }
        }
      };

      xhr.onerror = function (err) {
        console.error(err);
      };

      xhr.ontimeout = function () {
        console.error(new Error('XHR timeout'));
      };

      try {
        xhr.send(JSON.stringify({ cmd, params }));
      } catch (sendError) {
        console.error(new Error(`XHR发送请求失败: ${sendError.message}`));
      }
    }
  }

  // 发送日志消息
  function sendLogMessage(method, args) {
    return sendHttpRequest(actionUrl, 'echo', { method, args });
  }

  function hookConsole() {
    console.log = function () {
      sendLogMessage('log', Array.from(arguments));
    }
    console.info = function () {
      sendLogMessage('info', Array.from(arguments));
    }
    console.error = function () {
      sendLogMessage('error', Array.from(arguments));
    }
    console.warn = function () {
      sendLogMessage('warn', Array.from(arguments));
    }
  }

  if (typeof console !== 'undefined' && typeof console.log === 'function') {
    hookConsole();
  }
})("http://127.0.0.1:9191");