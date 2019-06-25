import { createError } from './utils'

const XHR = (() => {
  const { XMLHttpRequest, ActiveXObject } = window
  if (!XMLHttpRequest && !ActiveXObject) {
    alert(
      `Your browser does not support XMLHTTP.
      You may not be able to send messages to the server`,
    )
    return null
  }

  return () => (
    XMLHttpRequest
      ? new XMLHttpRequest()
      : new ActiveXObject('Microsoft.XMLHTTP')
  )
})()

/**
 * 创建一个 xhr 实例
 * */
function createHttp() {
  return XHR && XHR()
}

function buildUrl(baseUrl, url) {
  if (/^https?:\/\//.test(url)) return url
  return baseUrl.replace(/\/*$/, '') + (url ? url.replace(/^\/*/, '/') : '')
}

export default class Http {
  constructor(baseUrl) {
    this.baseUrl = baseUrl
  }

  send(method, url, data, callbacks, headers) {
    const { onResolve, onReject } = callbacks
    const http = createHttp()
    if (http) {
      http.open(method, buildUrl(this.baseUrl, url))

      // 时间监听
      http.onreadystatechange = () => {
        const { readyState, status, responseText, response } = http
        if (readyState === 4 && status >= 200) {
          if (status >= 300) {
            onReject(createError(`Status: ${status}`))
          } else {
            onResolve({
              data: responseText || response,
            })
          }
        }
      }
      http.onerror = () => onReject(createError('Network Error!'))
      http.ontimeout = () => onReject(createError('Request timeout!'))

      // 设置 headers
      Object.keys(headers).forEach((key) => {
        http.setRequestHeader(key, headers[key])
      })

      http.send(data)
    }
  }

  get(url, callbacks, headers) {
    return this.send('GET', url, null, callbacks, { ...headers })
  }

  post(url, data, callbacks, headers) {
    return this.send(
      'POST',
      url,
      typeof data === 'string' ? data : JSON.stringify(data),
      callbacks,
      { 'content-type': 'application/json', ...headers },
    )
  }
}
