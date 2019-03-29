/**
 * Error 封装
 * */
export function createError(data) {
  const message = data.message || data
  const error = new Error(message)
  error.data = data
  return error
}

/**
 * 解析对象
 * */
export function parseObj(target) {
  if (typeof target !== 'object') return target

  if (target === window) return 'window'

  if (target === document) return 'document'

  // 解析 DOM 元素
  if (target instanceof Element) {
    return `${target.outerHTML.split(/\\?>/)[0]}>...`
  }

  const obj = {}
  const addKey = (key) => {
    if (target[key] && !(target[key] instanceof Function)) {
      obj[key] = parseObj(target[key], true)
    }
  }
  if (target instanceof Event) {
    // 解析 Event 对象
    ['srcElement', 'path', 'currentTarget', 'target', 'type', 'timeStamp', 'message', 'lineno', 'filename']
      .forEach(addKey)
  } else {
    // 解析一般对象
    // eslint-disable-next-line no-restricted-syntax
    Object.getOwnPropertyNames(target)
      .forEach(addKey)
  }

  return obj
}

/**
 * 获取地理位置
 * */
export const getPosition = (() => {
  const {
    navigator: { geolocation = null } = {},
  } = window || {}
  let res
  return (callback) => {
    const cb = (position) => {
      res = position
      callback(position)
    }
    if (res === undefined && geolocation) {
      geolocation
        .getCurrentPosition(
          // success
          position => cb(parseObj(position)),
          // error
          (e) => {
            cb({ error: `Get position failed: ${e.message}` })
          },
          { timeout: 1000 },
        )
    } else {
      cb(res || null)
    }
  }
})()
