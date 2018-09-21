'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

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

var _warning = require('warning');

var _warning2 = _interopRequireDefault(_warning);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _matchPath = require('./matchPath');

var _matchPath2 = _interopRequireDefault(_matchPath);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var isEmptyChildren = function isEmptyChildren(children) {
  return _react2.default.Children.count(children) === 0;
};
var NORMAL_RENDER_MATCHED = 'normal matched render';
var NORMAL_RENDER_UNMATCHED = 'normal unmatched render (unmount)';
var NORMAL_RENDER_ON_INIT = 'normal render (matched or unmatched)';
var HIDE_RENDER = 'hide route when livePath matched';
/**
 * The public API for matching a single path and rendering.
 */

var Route = function (_React$Component) {
  (0, _inherits3.default)(Route, _React$Component);

  function Route() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, Route);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = Route.__proto__ || (0, _getPrototypeOf2.default)(Route)).call.apply(_ref, [this].concat(args))), _this), _this.state = {
      match: _this.computeMatch(_this.props, _this.context.router)
    }, _this.liveState = NORMAL_RENDER_ON_INIT, _this.scrollPosBackup = null, _this.previousDisplayStyle = null, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(Route, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return {
        router: (0, _extends3.default)({}, this.context.router, {
          route: {
            location: this.props.location || this.context.router.route.location,
            match: this.state.match
          }
        })
      };
    }
  }, {
    key: 'componentWillMount',
    value: function componentWillMount() {
      (0, _warning2.default)(!(this.props.component && this.props.render), 'You should not use <Route component> and <Route render> in the same route; <Route render> will be ignored');

      (0, _warning2.default)(!(this.props.component && this.props.children && !isEmptyChildren(this.props.children)), 'You should not use <Route component> and <Route children> in the same route; <Route children> will be ignored');

      (0, _warning2.default)(!(this.props.render && this.props.children && !isEmptyChildren(this.props.children)), 'You should not use <Route render> and <Route children> in the same route; <Route children> will be ignored');
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      // backup router and get DOM when mounting
      if (this.doesRouteEnableLive() && this.state.match) {
        this._latestMatchedRouter = this.context.router;
        this.getRouteDom();
      }
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps, nextContext) {
      (0, _warning2.default)(!(nextProps.location && !this.props.location), '<Route> elements should not change from uncontrolled to controlled (or vice versa). You initially used no "location" prop and then provided one on a subsequent render.');

      (0, _warning2.default)(!(!nextProps.location && this.props.location), '<Route> elements should not change from controlled to uncontrolled (or vice versa). You provided a "location" prop initially but omitted it on a subsequent render.');

      var match = this.computeMatch(nextProps, nextContext.router);
      var computedMatch = match;

      // recompute match if enable live
      if (this.doesRouteEnableLive()) {
        computedMatch = this.computeMatchWithLive(this.props, nextProps, nextContext, match);
      }

      this.setState({
        match: computedMatch
      });
    }

    // 获取 Route 对应的 DOM

  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      if (!this.doesRouteEnableLive()) {
        return;
      }

      // restore display when matched normally
      if (this.liveState === NORMAL_RENDER_MATCHED) {
        this.showRoute();
        this.restoreScrollPosition();
        this.clearScroll();
      }

      // get DOM if match and render
      if (this.state.match) {
        this.getRouteDom();
      }
    }

    // clear on unmounting

  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.clearScroll();
    }
  }, {
    key: 'doesRouteEnableLive',
    value: function doesRouteEnableLive() {
      return this.props.livePath || this.props.alwaysLive;
    }

    /**
     * @param {*} props: this.props
     * @param {*} nextProps: nextProps
     * @param {*} nextContext: nextContext
     * @param {*} match: computed `match` of current path
     * @returns
     * the returned object will be computed by following orders:
     * If path matched (no matter livePath matched or not), return normal computed `match`
     * If livePath matched, return latest normal render `match`
     * If livePath unmatched, return normal computed `match`
     * @memberof Route
     * Back up current router every time it is rendered normally, backing up to the next livePath rendering
     */

  }, {
    key: 'computeMatchWithLive',
    value: function computeMatchWithLive(props, nextProps, nextContext, match) {
      // compute if livePath match
      var livePath = nextProps.livePath;
      var nextPropsWithLivePath = (0, _extends3.default)({}, nextProps, { paths: livePath });
      var prevMatch = this.computeMatch(props, this.context.router);
      var livePathMatch = this.computePathsMatch(nextPropsWithLivePath, nextContext.router);
      if (match) {
        // normal matched render
        // console.log('--- NORMAL MATCH FLAG ---')
        this.liveState = NORMAL_RENDER_MATCHED;
        return match;
      } else if ((livePathMatch || props.alwaysLive) && this.routeDom) {
        // backup router when from normal match render to hide render
        if (prevMatch) {
          this._latestMatchedRouter = this.context.router;
        }
        // hide render
        // console.log('--- HIDE FLAG ---')
        this.liveState = HIDE_RENDER;
        this.saveScrollPosition();
        this.hideRoute();
        return prevMatch;
      } else {
        // normal unmatched unmount
        // console.log('--- NORMAL UNMATCH FLAG ---')
        this.liveState = NORMAL_RENDER_UNMATCHED;
        this.clearScroll();
        this.clearDomData();
      }
    }
  }, {
    key: 'computePathsMatch',
    value: function computePathsMatch(_ref2, router) {
      var computedMatch = _ref2.computedMatch,
          location = _ref2.location,
          paths = _ref2.paths,
          strict = _ref2.strict,
          exact = _ref2.exact,
          sensitive = _ref2.sensitive;

      (0, _invariant2.default)(router, 'You should not use <Route> or withRouter() outside a <Router>');
      var route = router.route;

      var pathname = (location || route.location).pathname;

      // livePath could accept a string or an array of string
      if (Array.isArray(paths)) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = (0, _getIterator3.default)(paths), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var path = _step.value;

            if (typeof path !== 'string') {
              continue;
            }
            var currPath = (0, _matchPath2.default)(pathname, { path: path, strict: strict, exact: exact, sensitive: sensitive }, router.match);
            // return if one of the livePaths is matched
            if (currPath) {
              return currPath;
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        return null;
      } else {
        return (0, _matchPath2.default)(pathname, { path: paths, strict: strict, exact: exact, sensitive: sensitive }, router.match);
      }
    }
  }, {
    key: 'computeMatch',
    value: function computeMatch(_ref3, router) {
      var computedMatch = _ref3.computedMatch,
          location = _ref3.location,
          path = _ref3.path,
          strict = _ref3.strict,
          exact = _ref3.exact,
          sensitive = _ref3.sensitive;

      // DO NOT use the computedMatch from Switch!
      // react-live-route: ignore match from <Switch>, actually LiveRoute should not be wrapped by <Switch>.
      // if (computedMatch) return computedMatch // <Switch> already computed the match for us
      (0, _invariant2.default)(router, 'You should not use <Route> or withRouter() outside a <Router>');

      var route = router.route;

      var pathname = (location || route.location).pathname;

      return (0, _matchPath2.default)(pathname, { path: path, strict: strict, exact: exact, sensitive: sensitive }, route.match);
    }

    // get DOM of Route

  }, {
    key: 'getRouteDom',
    value: function getRouteDom() {
      var routeDom = _reactDom2.default.findDOMNode(this);
      this.routeDom = routeDom;
    }

    // backup scroll and hide DOM

  }, {
    key: 'hideRoute',
    value: function hideRoute() {
      if (this.routeDom && this.routeDom.style.display !== 'none') {
        // console.log('--- hide route ---')
        this.previousDisplayStyle = this.routeDom.style.display;
        this.routeDom.style.display = 'none';
      }
    }

    // reveal DOM display

  }, {
    key: 'showRoute',
    value: function showRoute() {
      if (this.routeDom && this.previousDisplayStyle !== null) {
        this.routeDom.style.display = this.previousDisplayStyle;
      }
    }

    // save scroll position before hide DOM

  }, {
    key: 'saveScrollPosition',
    value: function saveScrollPosition() {
      if (this.routeDom && this.scrollPosBackup === null) {
        var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
        // console.log(`saved top = ${scrollTop}, left = ${scrollLeft}`)
        this.scrollPosBackup = { top: scrollTop, left: scrollLeft };
      }
    }

    // restore the scroll position before hide

  }, {
    key: 'restoreScrollPosition',
    value: function restoreScrollPosition() {
      var scroll = this.scrollPosBackup;
      // console.log(scroll)
      if (scroll && this.routeDom) {
        window.scrollTo(scroll.left, scroll.top);
      }
    }

    // clear scroll position

  }, {
    key: 'clearDomData',
    value: function clearDomData() {
      if (this.doesRouteEnableLive()) {
        this.routeDom = null;
        this.previousDisplayStyle = null;
      }
    }

    // clear scroll position

  }, {
    key: 'clearScroll',
    value: function clearScroll() {
      if (this.doesRouteEnableLive()) {
        this.scrollPosBackup = null;
      }
    }

    // normally render or unmount Route

  }, {
    key: 'renderRoute',
    value: function renderRoute(component, render, props, match) {
      if (component) return match ? _react2.default.createElement(component, props) : null;
      if (render) return match ? render(props) : null;
    }
  }, {
    key: 'render',
    value: function render() {
      var match = this.state.match;
      var _props = this.props,
          children = _props.children,
          component = _props.component,
          render = _props.render,
          livePath = _props.livePath,
          alwaysLive = _props.alwaysLive;
      var _context$router = this.context.router,
          history = _context$router.history,
          route = _context$router.route,
          staticContext = _context$router.staticContext;

      var location = this.props.location || route.location;
      var props = { match: match, location: location, history: history, staticContext: staticContext };
      if ((livePath || alwaysLive) && (component || render)) {
        // console.log('=== RENDER FLAG: ' + this.liveState + ' ===')
        if (this.liveState === NORMAL_RENDER_MATCHED || this.liveState === NORMAL_RENDER_UNMATCHED || this.liveState === NORMAL_RENDER_ON_INIT) {
          // normal render
          return this.renderRoute(component, render, props, match);
        } else if (this.liveState === HIDE_RENDER) {
          // hide render
          var prevRouter = this._latestMatchedRouter;
          // load properties from prevRouter and fake props of latest normal render
          var _history = prevRouter.history,
              _route = prevRouter.route,
              _staticContext = prevRouter.staticContext;

          var _location = this.props.location || _route.location;
          var liveProps = { match: match, location: _location, history: _history, staticContext: _staticContext };
          return this.renderRoute(component, render, liveProps, true);
        }
      }

      // the following is the same as Route of react-router, just render it normally
      if (component) return match ? _react2.default.createElement(component, props) : null;

      if (render) return match ? render(props) : null;

      if (typeof children === 'function') return children(props);

      if (children && !isEmptyChildren(children)) return _react2.default.Children.only(children);

      return null;
    }
  }]);
  return Route;
}(_react2.default.Component);

Route.propTypes = {
  computedMatch: _propTypes2.default.object, // private, from <Switch>
  path: _propTypes2.default.string,
  exact: _propTypes2.default.bool,
  strict: _propTypes2.default.bool,
  sensitive: _propTypes2.default.bool,
  component: _propTypes2.default.func,
  render: _propTypes2.default.func,
  children: _propTypes2.default.oneOfType([_propTypes2.default.func, _propTypes2.default.node]),
  location: _propTypes2.default.object,
  livePath: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.array]),
  alwaysLive: _propTypes2.default.bool,
  name: _propTypes2.default.string // for LiveRoute debug
};
Route.contextTypes = {
  router: _propTypes2.default.shape({
    history: _propTypes2.default.object.isRequired,
    route: _propTypes2.default.object.isRequired,
    staticContext: _propTypes2.default.object
  })
};
Route.childContextTypes = {
  router: _propTypes2.default.object.isRequired
};
exports.default = Route;