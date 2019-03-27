# error-monitor
![gzip with dependencies: kb](https://img.shields.io/badge/gzip--with--dependencies-kb-brightgreen.svg "gzip with dependencies: kb")
![pkg.module](https://img.shields.io/badge/pkg.module-supported-blue.svg "pkg.module")

> `pkg.module supported`, which means that you can apply tree-shaking in you project

在浏览器中运行时， 将前端产生的错误（语法错误，资源加载错误）上报（post 提交）至 http://192.168.3.114:5601（外网地址：http://101.68.74.170:25045），使用 Kibana 进行数据分析。 需要注入为 html 中的 js 脚本，并且确保这个 js 执行优先于其他 js 脚本。支持埋点。

## repository
git@192.168.3.165:livelybone/error-monitor.git

## Demo
http://192.168.3.165/livelybone/error-monitor

## Installation
```bash
npm i -S error-monitor
```

## Global name
`ErrorMonitor`

## Usage
```js
import * as ErrorMonitor from 'error-monitor';
```

when you want to set this module as external while you are developing another module, you should import it like this:
```js
import * as ErrorMonitor  from 'error-monitor'

// then use it by need
```

Use in html, see what your can use in [CDN: unpkg](https://unpkg.com/error-monitor/lib/umd/)
```html
<-- use what you want -->
<script src="https://unpkg.com/error-monitor/lib/umd/<--module-->.js"></script>
```
