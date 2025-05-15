(function hookConsole(ipPort){
    let {ip, port, url, host} = ipPort;
    ip = ip || host || '127.0.0.1';
    port = port || 9191;
    url = url || `http://${ip}:${port}/echo`;
    function echoRequest(method, args) {
      const isWechatMiniProgram = typeof wx !== 'undefined' && typeof wx.request === 'function';
      const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;
      const isModernBrowser = typeof window !== 'undefined' &&  typeof fetch === 'function';
      const isLegacyBrowser = typeof window !== 'undefined' &&  typeof XMLHttpRequest !== 'undefined';
    
      if (isWechatMiniProgram) {
        return new Promise((resolve, reject) => {
          wx.request({
            url,
            data: { m: method, a: args },
            method: 'POST',
            header: { 'Content-Type': 'application/json' },
            success: (res) => resolve(res.data),
            fail: (err) => reject(new Error(`微信小程序请求失败: ${err.errMsg}`))
          });
        });
      }
    
      if (isNode) {
        const httpModule = require('http');
        const data = JSON.stringify({ m: method, a: args });
        const urlObj = new URL(url);
    
        return new Promise((resolve, reject) => {
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
                resolve(responseData);
            });
          });
    
          req.on('error', (error) => reject(new Error(`Node请求失败: ${error.message}`)));
          req.write(data);
          req.end();
        });
      }
    
      if (isModernBrowser) {
        return fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ m: method, a: args })
        })
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP错误: ${response.status}`);
            }
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return response.json();
            } else if (contentType && contentType.includes('text/')) {
                return response.text();
            }
          })
          .catch(error => {
            throw new Error(`Fetch请求失败: ${error.message}`);
          });
      }
    
      // 传统浏览器环境 (XMLHttpRequest)
      if (isLegacyBrowser) {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', url, true);
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.responseType = 'json';
    
          xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
              if (xhr.status === 200) {
                try {
                  const response = xhr.responseType === 'json' ? 
                    xhr.response : JSON.parse(xhr.responseText);
                  resolve(response);
                } catch (parseError) {
                  reject(new Error(`XHR响应解析失败: ${parseError.message}`));
                }
              } else {
                reject(new Error(`XHR请求失败: ${xhr.status} ${xhr.statusText}`));
              }
            }
          };
    
          xhr.onerror = function(err) {
            reject(err);
          };
    
          xhr.ontimeout = function() {
            reject(new Error('XHR timeout'));
          };
    
          try {
            xhr.send(JSON.stringify({ m: method, a: args }));
          } catch (sendError) {
            reject(new Error(`XHR发送请求失败: ${sendError.message}`));
          }
        });
      }
    }
    function hookConsole(){
      console.log = function(){
        echoRequest('log', Array.from(arguments))
      }
      console.info = function(){
        echoRequest('info', Array.from(arguments))
      }
      console.error = function(){
        echoRequest('error', Array.from(arguments))
      }
      console.warn = function(){
        echoRequest('warn', Array.from(arguments))
      }
    }
  
    if(typeof console !== 'undefined' && typeof console.log === 'function'){
      hookConsole();
    }
})({
    ip: '127.0.0.1',
    port: 9191
});