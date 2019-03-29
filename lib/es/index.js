/**
 * Bundle of error-monitor
 * Generated: 2019-03-29
 * Version: 1.0.0
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

/**
 * 获取地理位置
 * */
var getPosition = function () {
  var _ref = window || {},
      _ref$navigator = _ref.navigator;

  _ref$navigator = _ref$navigator === undefined ? {} : _ref$navigator;
  var _ref$navigator$geoloc = _ref$navigator.geolocation,
      geolocation = _ref$navigator$geoloc === undefined ? null : _ref$navigator$geoloc;

  var res = void 0;
  return function (callback) {
    var cb = function cb(position) {
      res = position;
      callback(position);
    };
    if (res === undefined && geolocation) {
      geolocation.getCurrentPosition(
      // success
      function (position) {
        return cb(parseObj(position));
      },
      // error
      function (e) {
        cb({ error: 'Get position failed: ' + e.message });
      }, { timeout: 1000 });
    } else {
      cb(res || null);
    }
  };
}();

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
  if (/^http/.test(url)) return url;
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
   * @param {String} config.baseUrl               服务器地址
   * @param {String} config.logsource             固定参数，值需要与运维商量约定，目前为 'http'
   * @param {String} config.dep                   服务端确定的用来分割域（不同的域
   *                                              在后台需要切换才能界面查看）的字段，值需要与运维商量约定
   * @param {String} config.project               项目名称
   * @param {Number} [config.probability]         消息发送率。当网站访问量很大(比如：百万级千万级 pv)
   *                                              错误出现的频率就会相当的大
   *                                              因此可以通过 probability 来限制错误发送的数量
   *                                              值越大，消息发送的概率就越大
   * */
  function ErrorMonitor(_ref) {
    var baseUrl = _ref.baseUrl,
        _ref$logsource = _ref.logsource,
        logsource = _ref$logsource === undefined ? 'http' : _ref$logsource,
        dep = _ref.dep,
        project = _ref.project,
        _ref$probability = _ref.probability,
        probability = _ref$probability === undefined ? 1 : _ref$probability;
    classCallCheck(this, ErrorMonitor);

    if (!baseUrl) {
      throw new Error('Param `baseUrl` is needed');
    }
    if (!dep) {
      throw new Error('Param `dep` is needed');
    }
    if (!project) {
      throw new Error('Param `project` is needed');
    }

    this.http = new Http(baseUrl);
    this.probability = probability;
    this.fields = { logsource: logsource, dep: dep, project: project, logtype: window.location.host };
    this.init();
  }

  createClass(ErrorMonitor, [{
    key: 'init',
    value: function init() {
      var _this = this;

      window.addEventListener('error', function (ev) {
        var error = parseObj(ev);
        if (ev.message) {
          // 脚本错误
          _this.postMsg({ type: 'error-runtime', message: ev.message, details: { error: error } });
        } else {
          // 资源加载错误
          _this.postMsg({ type: 'error-resource', message: error.target, details: { error: error } });
        }
      }, true);
    }
  }, {
    key: 'postMsg',
    value: function postMsg(_ref2, probability) {
      var _this2 = this;

      var type = _ref2.type,
          message = _ref2.message,
          position = _ref2.position,
          details = _ref2.details,
          callbacks = _ref2.callbacks;

      // 判断消息是否发送
      // probability 值越大，消息发送的概率就越大
      var shouldSend = Math.random() <= (probability || this.probability);

      if (shouldSend) {
        var _ref3 = callbacks || {},
            onSuccess = _ref3.onSuccess,
            onFailed = _ref3.onFailed;

        var send = function send(pos) {
          _this2.http.post('', _this2.buildMsg({ type: type, message: message, position: pos, details: details }), {
            onResolve: function onResolve(res) {
              console.log('ErrorMonitor: Error post successed');
              if (typeof onSuccess === 'function') onSuccess(res);
            },
            onReject: function onReject(res) {
              console.log('ErrorMonitor: Error post failed(' + res.message + ')');
              if (typeof onFailed === 'function') onFailed(res);
            }
          });
        };
        if (position) {
          send(position);
        } else {
          getPosition(send);
        }
      }
    }

    /**
     * @typedef  {Object} Message                   除了下面的属性之外，可自由添加属性
     * @property {Object} Message.fields
     * @property {String} Message.fields.logsource  固定参数，值需要与运维商量约定，目前为 'http'
     * @property {String} Message.fields.dep        服务端确定的用来分割域（不同的域
     *                                              在后台需要切换才能界面查看）的字段，值需要与运维商量约定
     * @property {String} Message.fields.logtype    站点的名称或域名
     * @property {String} Message.fields.project    项目名称。前端可能使用微服务化，使得不同的页面可能
     *                                              对应不同的项目
     * @property {String} Message.type              消息类型。可选：
     *                                              [
     *                                                'error-resource',   // 资源加载报错
     *                                                'error-runtime',    // 脚本运行时报错
     *                                                'user-behavior',    // 用户行为统计
     *                                                'api-error',        // 接口错误
     *                                                'network-static',   // 网络状况
     *                                                ...                 // 等等... 可根据情况添加类型
     *                                              ]
     * @property {String} Message.url               页面 url。消息发送所在页面的 url
     * @property {String} Message.message           消息内容
     * @property {Object} Message.details           信息详情
     * @property {Object} [Message.position]        访问的地理位置
     * @property {String} [Message.userAgent]       客户端信息，比如：浏览器类型
     *
     * @return Message
     * */

  }, {
    key: 'buildMsg',
    value: function buildMsg(_ref4) {
      var type = _ref4.type,
          message = _ref4.message,
          position = _ref4.position,
          details = _ref4.details;

      return {
        fields: this.fields,
        type: type,
        url: window.location.pathname,
        message: message,
        position: position,
        userAgent: window.navigator.userAgent,
        details: details
      };
    }
  }]);
  return ErrorMonitor;
}();

export default ErrorMonitor;
