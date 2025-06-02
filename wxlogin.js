wx.login = function (option) {
    const url = "http://127.0.0.1:9191/doAction"
    if (!option || !option.success) {
        return;
    }
    wx.request({
        url,
        data: { cmd: 'getCode', params: {} },
        method: 'POST',
        header: { 'Content-Type': 'application/json' },
        success: (res) => {
            res = res.data;
            option.success({ code: res.code });
        },
        fail: (err) => console.error(`微信小程序请求失败:`, err)
    });
}