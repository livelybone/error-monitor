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
    dep: 'your dep',
    project: 'your project',
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
    dep: 'your dep',
    project: 'your project',
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

## To do list
> 1. 增加安全性，方案：签名（加密验证）+ 代码混淆，需要与运维商定
