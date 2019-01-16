'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

exports.default = dynamic;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultLoadingComponent = function defaultLoadingComponent() {
  return null;
};

function asyncComponent(config) {
  var resolve = config.resolve;


  return function (_Component) {
    (0, _inherits3.default)(DynamicComponent, _Component);

    function DynamicComponent() {
      var _ref;

      (0, _classCallCheck3.default)(this, DynamicComponent);

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var _this = (0, _possibleConstructorReturn3.default)(this, (_ref = DynamicComponent.__proto__ || (0, _getPrototypeOf2.default)(DynamicComponent)).call.apply(_ref, [this].concat(args)));

      _this.LoadingComponent = config.LoadingComponent || defaultLoadingComponent;
      _this.state = {
        AsyncComponent: null
      };
      _this.load();
      return _this;
    }

    (0, _createClass3.default)(DynamicComponent, [{
      key: 'componentDidMount',
      value: function componentDidMount() {
        this.mounted = true;
      }
    }, {
      key: 'componentWillUnmount',
      value: function componentWillUnmount() {
        this.mounted = false;
      }
    }, {
      key: 'load',
      value: function load() {
        var _this2 = this;

        resolve().then(function (m) {
          var AsyncComponent = m.default || m;
          // 未渲染直接更新
          if (_this2.mounted) {
            _this2.setState({ AsyncComponent: AsyncComponent });
          } else {
            _this2.state.AsyncComponent = AsyncComponent; // eslint-disable-line
          }
        });
      }
    }, {
      key: 'render',
      value: function render() {
        var AsyncComponent = this.state.AsyncComponent;
        var LoadingComponent = this.LoadingComponent;

        if (AsyncComponent) {
          return _react2.default.createElement(AsyncComponent, this.props);
        }
        return _react2.default.createElement(LoadingComponent, this.props);
      }
    }]);
    return DynamicComponent;
  }(_react.Component);
}

function dynamic(config) {
  var component = config.component;

  return asyncComponent((0, _extends3.default)({
    resolve: config.resolve || function () {
      var _component = component();
      return new _promise2.default(function (resolve) {
        _promise2.default.all([_component]).then(function (ret) {
          return resolve(ret[0]);
        });
      });
    }
  }, config));
}

dynamic.setDefaultLoadingComponent = function (LoadingComponent) {
  defaultLoadingComponent = LoadingComponent;
};