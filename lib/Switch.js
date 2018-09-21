'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _warning = require('warning');

var _warning2 = _interopRequireDefault(_warning);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _matchPath = require('./matchPath');

var _matchPath2 = _interopRequireDefault(_matchPath);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The public API for rendering the first <Route> that matches.
 */
var Switch = function (_React$Component) {
  (0, _inherits3.default)(Switch, _React$Component);

  function Switch() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, Switch);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = Switch.__proto__ || (0, _getPrototypeOf2.default)(Switch)).call.apply(_ref, [this].concat(args))), _this), _this.getRenderChildren = function () {
      var route = _this.context.router.route;
      var children = _this.props.children;

      var location = _this.props.location || route.location;
      var match = void 0,
          child = void 0;
      var result = [];
      _react2.default.Children.forEach(children, function (element) {
        if (_react2.default.isValidElement(element)) {
          var _element$props = element.props,
              pathProp = _element$props.path,
              exact = _element$props.exact,
              strict = _element$props.strict,
              sensitive = _element$props.sensitive,
              from = _element$props.from,
              alwaysLive = _element$props.alwaysLive;

          var path = pathProp || from;

          child = element;
          alwaysLive && result.push(_react2.default.cloneElement(child, { location: location }));
          // match = matchPath(
          //   location.pathname,
          //   { path, exact, strict, sensitive },
          //   route.match
          // )
        }
      });
      return result.length !== 0 ? result : null;
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(Switch, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      (0, _invariant2.default)(this.context.router, 'You should not use <Switch> outside a <Router>');
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      (0, _warning2.default)(!(nextProps.location && !this.props.location), '<Switch> elements should not change from uncontrolled to controlled (or vice versa). You initially used no "location" prop and then provided one on a subsequent render.');

      (0, _warning2.default)(!(!nextProps.location && this.props.location), '<Switch> elements should not change from controlled to uncontrolled (or vice versa). You provided a "location" prop initially but omitted it on a subsequent render.');
    }
    // alwaysLive === true 返回

  }, {
    key: 'render',
    value: function render() {
      return this.getRenderChildren();
    }
  }]);
  return Switch;
}(_react2.default.Component);

Switch.contextTypes = {
  router: _propTypes2.default.shape({
    route: _propTypes2.default.object.isRequired
  }).isRequired
};
Switch.propTypes = {
  children: _propTypes2.default.node,
  location: _propTypes2.default.object
};
exports.default = Switch;