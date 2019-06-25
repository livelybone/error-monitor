import Http from './Http'
import { parseObj } from './utils'

export default class ErrorMonitor {
  /**
   * @param {Object} config
   * @param {String} config.baseUrl               日志服务器地址
   * @param {String} config.project               项目名称
   * @param {String} config.platform              项目运行平台
   * @param {String} config.userAgent             项目运行平台
   * @param {Number} [config.probability]         消息发送率。当网站访问量很大(比如：百万级千万级 pv)
   *                                              错误出现的频率就会相当的大
   *                                              因此可以通过 probability 来限制错误发送的数量
   *                                              值越大，消息发送的概率就越大
   * */
  constructor({ baseUrl, project, platform, userAgent, probability = 1 }) {
    if (!baseUrl) {
      throw new Error('Param `baseUrl` is needed')
    }
    if (!project) {
      throw new Error('Param `project` is needed')
    }
    if (!platform) {
      throw new Error('Param `platform` is needed')
    }

    this.http = new Http(baseUrl)
    this.probability = probability
    this.fields = { project, hostname: window.location.host, platform, userAgent }
    this.init()
  }

  init() {
    window.addEventListener(
      'error',
      (ev) => {
        const error = parseObj(ev)
        if (ev.message) {
          // 脚本错误
          this.postMsg({ type: 'error-runtime', level: 'warn', message: ev.message, details: { error } })
        } else {
          // 资源加载错误
          this.postMsg({ type: 'error-resource', level: 'warn', message: error.target, details: { error } })
        }
      },
      true,
    )
  }

  postMsg({ url = '', type, level, message, position, details, callbacks }, probability) {
    // 判断消息是否发送
    // probability 值越大，消息发送的概率就越大
    const shouldSend = Math.random() <= (probability || this.probability)

    if (shouldSend) {
      const { onSuccess, onFailed } = callbacks || {}
      const send = (pos) => {
        this.http.post(
          url,
          this.buildMsg({ type, level, message, position: pos, details }),
          {
            onResolve: (res) => {
              console.log('ErrorMonitor: Error post successed')
              if (typeof onSuccess === 'function') onSuccess(res)
            },
            onReject: (res) => {
              console.log(`ErrorMonitor: Error post failed(${res.message})`)
              if (typeof onFailed === 'function') onFailed(res)
            },
          },
        )
      }
      // if (position) {
      //   send(position)
      // } else {
      //   getPosition(send)
      // }
      send(position)
    }
  }

  /**
   * @typedef  {Object} Message                   除了下面的属性之外，可自由添加属性
   * @property {String} Message.hostname          站点的名称或域名
   * @property {String} Message.project           项目名称。前端可能使用微服务化，使得不同的页面可能
   *                                              对应不同的项目
   * @property {String} Message.platform          项目运行平台。可选：
   *                                              [
   *                                                'web',                // 前台
   *                                                'web-admin',          // 后台
   *                                                'app-android',        // android
   *                                                'app-ios',            // ios
   *                                                'client-windows',     // windows
   *                                                'client-linux',       // linux
   *                                                ...                   // 自定义... 可根据情况添加类型
   *                                              ]
   * @property {String} Message.type              消息类型。可选：
   *                                              [
   *                                                'error-resource',     // 资源加载报错
   *                                                'error-runtime',      // 脚本运行时报错
   *                                                'user-behavior',      // 用户行为统计
   *                                                'api-error',          // 接口错误
   *                                                'network-statistics', // 网络状况
   *                                                ...                   // 等等... 可根据情况添加类型
   *                                              ]
   * @property {String} Message.level             日志等级，可选：
   *                                              [
   *                                                'error',    // 错误，比如 'error-resource',
   *                                                               'error-runtime', 'api-error' 这些
   *                                                               类型就属于错误等级，比较紧急
   *                                                'warn',     // 警告，但不是错误，不太紧急
   *                                                'normal',   // 正常，，比如 'user-behavior',
   *                                                               'network-statistics' 这些
   *                                                               类型是用来做统计，属于正常
   *                                              ]
   * @property {String} Message.url               页面 url。消息发送所在页面的 url
   * @property {String} Message.message           消息内容
   * @property {Object} [Message.details]         信息详情
   * @property {Object} [Message.position]        访问的地理位置，可不传。实际上，更推荐由后端处理
   * @property {String} [Message.userAgent]       客户端信息，比如：浏览器类型
   *
   * @return Message
   * */
  buildMsg({ type, level = 'error', message, position, details }) {
    return {
      ...this.fields,
      type,
      level,
      url: window.location.pathname,
      message,
      position,
      userAgent: this.fields.userAgent || window.navigator.userAgent,
      details,
    }
  }
}
