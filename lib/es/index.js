/**
 * Bundle of error-monitor
 * Generated: 2019-07-02
 * Version: 1.1.0
 * License: MIT
 * Author: livelybone
 */

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

/**
 * Error 封装
 * */
function createError(data) {
  var message = data.message || data;
  var error = new Error(message);
  error.data = data;
  return error;
}

/**
 * 解析对象
 * */
function parseObj(target) {
  if ((typeof target === 'undefined' ? 'undefined' : _typeof(target)) !== 'object') return target;

  if (target === window) return 'window';

  if (target === document) return 'document';

  // 解析 DOM 元素
  if (target instanceof Element) {
    return target.outerHTML.split(/\\?>/)[0] + '>...';
  }

  var obj = {};
  var addKey = function addKey(key) {
    if (target[key] && !(target[key] instanceof Function)) {
      obj[key] = parseObj(target[key], true);
    }
  };
  if (target instanceof Event) {
    // 解析 Event 对象
    ['srcElement', 'path', 'currentTarget', 'target', 'type', 'timeStamp', 'message', 'lineno', 'filename'].forEach(addKey);
  } else {
    // 解析一般对象
    // eslint-disable-next-line no-restricted-syntax
    Object.getOwnPropertyNames(target).forEach(addKey);
  }

  return obj;
}

var XHR = function () {
  var _window = window,
      XMLHttpRequest = _window.XMLHttpRequest,
      ActiveXObject = _window.ActiveXObject;

  if (!XMLHttpRequest && !ActiveXObject) {
    alert('Your browser does not support XMLHTTP.\n      You may not be able to send messages to the server');
    return null;
  }

  return function () {
    return XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
  };
}();

/**
 * 创建一个 xhr 实例
 * */
function createHttp() {
  return XHR && XHR();
}

function buildUrl(baseUrl, url) {
  if (/^https?:\/\//.test(url)) return url;
  return baseUrl.replace(/\/*$/, '') + (url ? url.replace(/^\/*/, '/') : '');
}

var Http = function () {
  function Http(baseUrl) {
    classCallCheck(this, Http);

    this.baseUrl = baseUrl;
  }

  createClass(Http, [{
    key: 'send',
    value: function send(method, url, data, callbacks, headers) {
      var onResolve = callbacks.onResolve,
          onReject = callbacks.onReject;

      var http = createHttp();
      if (http) {
        http.open(method, buildUrl(this.baseUrl, url));

        // 时间监听
        http.onreadystatechange = function () {
          var readyState = http.readyState,
              status = http.status,
              responseText = http.responseText,
              response = http.response;

          if (readyState === 4 && status >= 200) {
            if (status >= 300) {
              onReject(createError('Status: ' + status));
            } else {
              onResolve({
                data: responseText || response
              });
            }
          }
        };
        http.onerror = function () {
          return onReject(createError('Network Error!'));
        };
        http.ontimeout = function () {
          return onReject(createError('Request timeout!'));
        };

        // 设置 headers
        Object.keys(headers).forEach(function (key) {
          http.setRequestHeader(key, headers[key]);
        });

        http.send(data);
      }
    }
  }, {
    key: 'get',
    value: function get(url, callbacks, headers) {
      return this.send('GET', url, null, callbacks, _extends({}, headers));
    }
  }, {
    key: 'post',
    value: function post(url, data, callbacks, headers) {
      return this.send('POST', url, typeof data === 'string' ? data : JSON.stringify(data), callbacks, _extends({ 'content-type': 'application/json' }, headers));
    }
  }]);
  return Http;
}();

var ErrorMonitor = function () {
  /**
   * @param {Object} config
   * @param {String} config.baseUrl               日志服务器地址
   * @param {String} config.project               项目名称
   * @param {String} config.platform              项目运行平台
   * @param {String} config.userAgent             项目运行平台
   * @param {String} [config.batch]               是否默认批量上传，全局错误的上传格式（Array or Object）依赖于这个值
   * @param {Number} [config.probability]         消息发送率。当网站访问量很大(比如：百万级千万级 pv)
   *                                              错误出现的频率就会相当的大
   *                                              因此可以通过 probability 来限制错误发送的数量
   *                                              值越大，消息发送的概率就越大
   * */
  function ErrorMonitor(_ref) {
    var baseUrl = _ref.baseUrl,
        project = _ref.project,
        platform = _ref.platform,
        userAgent = _ref.userAgent,
        batch = _ref.batch,
        _ref$probability = _ref.probability,
        probability = _ref$probability === undefined ? 1 : _ref$probability;
    classCallCheck(this, ErrorMonitor);

    if (!baseUrl) {
      throw new Error('Param `baseUrl` is needed');
    }
    if (!project) {
      throw new Error('Param `project` is needed');
    }
    if (!platform) {
      throw new Error('Param `platform` is needed');
    }

    this.http = new Http(baseUrl);
    this.probability = probability;
    this.fields = { project: project, hostname: window.location.host, platform: platform, userAgent: userAgent };
    this.batch = batch;
    this.init();
  }

  createClass(ErrorMonitor, [{
    key: 'init',
    value: function init() {
      var _this = this;

      window.addEventListener('error', function (ev) {
        var error = parseObj(ev);
        var log = void 0;
        if (ev.message) {
          // 脚本错误
          log = { type: 'error-runtime', level: 'warn', message: ev.message, details: { error: error } };
        } else {
          // 资源加载错误
          log = { type: 'error-resource', level: 'warn', message: error.target, details: { error: error } };
        }
        if (_this.batch) {
          _this.postLogBatch([log]);
        } else {
          _this.postLog(log);
        }
      }, true);
    }
  }, {
    key: 'send',
    value: function send(logObj, _ref2) {
      var _ref2$url = _ref2.url,
          url = _ref2$url === undefined ? '' : _ref2$url,
          _ref2$callbacks = _ref2.callbacks,
          callbacks = _ref2$callbacks === undefined ? {} : _ref2$callbacks,
          probability = _ref2.probability;

      // 判断消息是否发送
      // probability 值越大，消息发送的概率就越大
      var shouldSend = Math.random() <= (probability || this.probability);

      if (shouldSend) {
        var onSuccess = callbacks.onSuccess,
            onFailed = callbacks.onFailed;

        this.http.post(url, logObj, {
          onResolve: function onResolve(res) {
            console.log('ErrorMonitor: Error post successed');
            if (typeof onSuccess === 'function') onSuccess(res);
          },
          onReject: function onReject(res) {
            console.log('ErrorMonitor: Error post failed(' + res.message + ')');
            if (typeof onFailed === 'function') onFailed(res);
          }
        });
      }
    }
  }, {
    key: 'postLog',
    value: function postLog(log) {
      var _ref3 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          url = _ref3.url,
          callbacks = _ref3.callbacks,
          probability = _ref3.probability;

      this.send(this.buildLog(log), { url: url, callbacks: callbacks, probability: probability });
    }
  }, {
    key: 'postLogBatch',
    value: function postLogBatch(logs) {
      var _this2 = this;

      var _ref4 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
          url = _ref4.url,
          callbacks = _ref4.callbacks,
          probability = _ref4.probability;

      this.send(logs.map(function (log) {
        return _this2.buildLog(log);
      }), { url: url, callbacks: callbacks, probability: probability });
    }

    /**
     * @typedef  {Object} Log                   除了下面的属性之外，可自由添加属性
     * @property {String} Log.hostname          站点的名称或域名
     * @property {String} Log.project           项目名称。前端可能使用微服务化，使得不同的页面可能
     *                                              对应不同的项目
     * @property {String} Log.platform          项目运行平台。可选：
     *                                              [
     *                                                'web',                // 前台
     *                                                'web-admin',          // 后台
     *                                                'app-android',        // android
     *                                                'app-ios',            // ios
     *                                                'client-windows',     // windows
     *                                                'client-linux',       // linux
     *                                                ...                   // 自定义... 可根据情况添加类型
     *                                              ]
     * @property {String} Log.type              消息类型。可选：
     *                                              [
     *                                                'error-resource',     // 资源加载报错
     *                                                'error-runtime',      // 脚本运行时报错
     *                                                'error-api',          // 接口错误
     *                                                'user-behavior',      // 用户行为统计
     *                                                'network-statistics', // 网络状况
     *                                                ...                   // 等等... 可根据情况添加类型
     *                                              ]
     * @property {String} Log.level             日志等级，可选：
     *                                              [
     *                                                'error',    // 错误，比如 'error-resource',
     *                                                               'error-runtime', 'api-error' 这些
     *                                                               类型就属于错误等级，比较紧急
     *                                                'warn',     // 警告，但不是错误，不太紧急
     *                                                'normal',   // 正常，，比如 'user-behavior',
     *                                                               'network-statistics' 这些
     *                                                               类型是用来做统计，属于正常
     *                                              ]
     * @property {String} Log.url               页面 url。消息发送所在页面的 url
     * @property {String} Log.message           消息内容
     * @property {Object} [Log.userId]          用户 ID
     * @property {Object} [Log.api]             涉及到的 api
     * @property {Object} [Log.element]         涉及到的元素
     * @property {Object} [Log.details]         信息详情
     * @property {Object} [Log.position]        访问的地理位置，可不传。实际上，更推荐由后端处理
     * @property {String} [Log.userAgent]       客户端信息，比如：浏览器类型
     *
     * @return Log
     * */

  }, {
    key: 'buildLog',
    value: function buildLog(_ref5) {
      var type = _ref5.type,
          _ref5$level = _ref5.level,
          level = _ref5$level === undefined ? 'error' : _ref5$level,
          message = _ref5.message,
          position = _ref5.position,
          userId = _ref5.userId,
          api = _ref5.api,
          element = _ref5.element,
          details = _ref5.details;

      return _extends({}, this.fields, {
        type: type,
        level: level,
        url: window.location.pathname,
        message: message,
        position: position,
        userAgent: this.fields.userAgent || window.navigator.userAgent,
        userId: userId,
        api: api,
        element: element,
        details: details
      });
    }
  }]);
  return ErrorMonitor;
}();

export default ErrorMonitor;
