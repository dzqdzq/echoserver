# Echo Server

[English](./README.md) | [中文](./README.zh-CN.md)

一个简单的跨环境调试和日志记录工具，支持在不同环境（Node.js、web、微信小程序等）中进行远程日志记录和调试。主要用于不方便查看日志的情况， 比如破解其他app，需要辅助查看日志

## 特点
- 支持多种运行环境：Node.js、web、微信小程序， 或者其他应用程序支持js的场景。 
- 如果你要破解的应用不支持js, 你可以使用AI智能体，让它翻译生成你的破解环境的请求代码。比如lua, python等

## 安装

```bash
npm install -g hecho
```

## 使用方法
### 启动服务器
```bash
hecho server
```
默认情况下，服务器将在端口9191上启动。您可以通过指定端口号来更改默认端口：

```bash
hecho server 8080
```

### 客户端使用
#### 拷贝客户端代码到剪切板, 后续粘贴到你要嵌入的地方
```bash
hecho client 
```

或

```bash
hecho cli
```



- 客户端默认的ip和端口
```bash
(function hookConsole(ipPort){
    ...
})({
    ip: '127.0.0.1',
    port: 9191
});
```

- 如果你破解环境不支持ip访问，你可以自己设置url. 通过域名访问,域名设置为app受信任的域名， 然后反向代理(charles, proxyman etc)到你的服务器
```bash
(function hookConsole(ipPort){
    ...
})({
    url: ': 'https://xxxx.xxxx.com/echo'
});
```

## 许可证

MIT