(function hookConsole(baseUrl, myHook) {
  const actionUrl = `${baseUrl}/doAction`;

  // 发送HTTP请求
  function sendHttpRequest(url, cmd, params, success) {
    if (!success) {
      success = (res) => {};
    }
    return wx.request({
      url,
      data: { cmd, params },
      method: "POST",
      header: { "Content-Type": "application/json" },
      success,
      fail: (err) =>
        wx.showToast({
          icon: "error",
          title: "hookConsole http request失败:" + err,
        }),
    });
  }

  function checkCodeStatus() {
    sendHttpRequest(actionUrl, "checkCodeStatus", {}, function (res) {
      res = res.data;
      const isNeed = res.isRequestingCode;
      if (isNeed) {
        // 将code发送给服务器
        wx.login();
      }
    });
  }

  function sendLogMessage(method, args) {
    return sendHttpRequest(actionUrl, "echo", { method, args });
  }

  function hookConsole() {
    if(myHook){
        myHook();
    }
    console.log = function () {
      sendLogMessage("log", Array.from(arguments));
    };
    console.info = function () {
      sendLogMessage("info", Array.from(arguments));
    };
    console.error = function () {
      sendLogMessage("error", Array.from(arguments));
    };
    console.warn = function () {
      sendLogMessage("warn", Array.from(arguments));
    };
  }

  if (typeof console !== "undefined" && typeof console.log === "function") {
    hookConsole();

    const oldLogin = wx.login;
    wx.login = function () {
      return oldLogin.call(wx, {
        success: (res) => {
          console.log("收到wx.login数据:", res);
          sendHttpRequest(actionUrl, "saveCode", { code: res.code });
        },
      });
    };
    setInterval(checkCodeStatus, 1000);
  }
})("http://127.0.0.1:9191");
