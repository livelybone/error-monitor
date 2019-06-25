# error-monitor
![gzip with dependencies: 2kb](https://img.shields.io/badge/gzip--with--dependencies-2kb-brightgreen.svg "gzip with dependencies: 2kb")
![error-monitor](https://img.shields.io/badge/error--monitor-done-blue.svg "error-monitor")

在浏览器中运行时， 将前端产生的错误（语法错误，资源加载错误）上报（post 提交）至服务器。确保这个 js 执行优先于其他 js 脚本。支持埋点。

默认使用 Geolocation.getCurrentPosition() 来获取地理位置，你也可以在 postMsg 这个方法传入 position 来自定义位置

> 可选监控预警策略：
> 1. js 代码报错，全局监控实现
> 2. 资源加载错误，全局监控实现
> 3. 接口响应超过 2s 触发预警，需要埋点
> 4. 接口报错（status >= 300），需要埋点

项目结构使用 [npm-module-generator](https://www.npmjs.com/package/@livelybone/npm-module-generator) 生成

## Global name
`ErrorMonitor`

## Usage
> 1.Use script
```html
<html>
<head>
  <script src="./lib/umd/index.js"></script>
  <script>
  window.errorMonitor = new ErrorMonitor({
    baseUrl: 'backendUrl',
    project: 'your project',
    platform: 'the platform your project run in',
  })
  </script>
</head>
</html>
```
> 2.Internal js
```html
<html>
<head>
  <script>
  <!-- js about `./lib/umd/index.js` -->
  </script>
  <script>
  window.errorMonitor = new ErrorMonitor({
    baseUrl: 'backendUrl',
    project: 'your project',
    platform: 'the platform your project run in',
  })
  </script>
</head>
</html>
```

## 埋点

> 示例1：代码错误

```js
try{
  // code
} catch(e){
  window.errorMonitor.postMsg({
    type: 'error-runtime',
    message: e.message,
    details: {
      stack: e.stack,
    },
  })
}
```

> 示例2：接口报错

```js
http.get('/**')
  .catch((e)=>{
    window.errorMonitor.postMsg({
      type: 'api-error',
      message: e.message,
      details:{
        api: '/**',
        error: e,
      },
    })
  })
```

> 示例3：网络状况统计

```js
const start = Date.now()
http.get('/**')
  .then(()=>{
    const time = Date.now() - start
    if(time > 2000) {
      window.errorMonitor.postMsg({
        type: 'network-static',
        message: `Long response time(greater than 2 second): \`/**\``,
        details:{
          api: '/**',
          time, 
        },
      })
    }
  })
```

## App 监控方案
> 1. 对接 [bugly](https://bugly.qq.com/v2/)，然后使用 webhook 做集成。bugly 账号最好统一管理
> 2. 直接借鉴此方案，开发适用于 app 的库

## 钉钉告警对接
> 1. 对 level 为 'error', 'warn' 的日志进行告警
> 2. 对告警做数量限制，比如：每 10 次相同错误触发 1 次钉钉告警
> 3. 如何判断日志是否相同：对比 level, type, message 三个字段，相同则判断为同一个日志

```js
// 日志格式
const Message = { 
  fields: Object,
  platform: String,
  type: String,
  level: String,
  message: String,
  url: String,
  position: Object|String,
  userAgent: String,
  details: Object,
}
```
 
## To do list
> 1. 增加安全性，方案：签名（加密验证）+ 代码混淆，需要与运维商定
