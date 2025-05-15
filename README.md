# Echo Server

[English](./README.md) | [中文](./README.zh-CN.md)

A simple cross-environment debugging and logging tool that supports remote logging and debugging in different environments (Node.js, web, WeChat Mini Program, etc.). Mainly used in situations where it's inconvenient to view logs, such as when reverse engineering other apps and needing to view logs.

## Features
- Supports multiple runtime environments: Node.js, web, WeChat Mini Program, or other scenarios where JavaScript is supported.
- If the application you're trying to reverse engineer doesn't support JavaScript, you can use AI agents to translate and generate request code for your target environment, such as Lua, Python, etc.

## Installation

```bash
npm install -g hecho
```

## Usage
### Starting the Server
```bash
hecho server
```
By default, the server will start on port 9191. You can change the default port by specifying a port number:

```bash
hecho server 8080
```

### Client Usage
#### Copy the client code to clipboard for pasting into your target environment
```bash
hecho client 
```

Or

```bash
hecho cli
```

- Default IP and port for the client
```bash
(function hookConsole(ipPort){
    ...
})({  
    ip: '127.0.0.1',
    port: 9191
});
```

- If your target environment doesn't support IP access, you can set a URL instead. Use a domain that is trusted by the app, then use reverse proxy (charles, proxyman etc.) to your server
```bash
(function hookConsole(ipPort){
    ...
})({  
    url: 'https://xxxx.xxxx.com/echo'
});
```

## License

MIT