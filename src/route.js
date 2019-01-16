import warning from 'warning';
import invariant from 'invariant';
import React from 'react';
import PropTypes from 'prop-types';
import matchPath from './matchPath';
import ReactDOM from 'react-dom';

const isEmptyChildren = children => React.Children.count(children) === 0;
const NORMAL_RENDER_MATCHED = 'normal matched render';
const NORMAL_RENDER_UNMATCHED = 'normal unmatched render (unmount)';
const NORMAL_RENDER_ON_INIT = 'normal render (matched or unmatched)';
const HIDE_RENDER = 'hide route when livePath matched';

/**
 * The public API for matching a single path and rendering.
 */
class Route extends React.Component {
  static propTypes = {
    path: PropTypes.string,
    exact: PropTypes.bool,
    strict: PropTypes.bool,
    sensitive: PropTypes.bool,
    component: PropTypes.func,
    render: PropTypes.func,
    children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
    location: PropTypes.object,
    livePath: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    alwaysLive: PropTypes.bool,
    name: PropTypes.string // for LiveRoute debug
  };

  static contextTypes = {
    router: PropTypes.shape({
      history: PropTypes.object.isRequired,
      route: PropTypes.object.isRequired,
      staticContext: PropTypes.object
    })
  };

  static childContextTypes = {
    router: PropTypes.object.isRequired
  };

  getChildContext() {
    return {
      router: {
        ...this.context.router,
        route: {
          location: this.props.location || this.context.router.route.location,
          match: this.state.match
        }
      }
    };
  }

  state = {
    match: this.computeMatch(this.props, this.context.router)
  };
//  路由渲染状态
  liveState = NORMAL_RENDER_ON_INIT;
// 缓存样式
  previousDisplayStyle = null;
  /**
   * some check
   */
  componentWillMount() {
    warning(
      !(this.props.component && this.props.render),
      'You should not use <Route component> and <Route render> in the same route; <Route render> will be ignored'
    );

    warning(
      !(
        this.props.component &&
        this.props.children &&
        !isEmptyChildren(this.props.children)
      ),
      'You should not use <Route component> and <Route children> in the same route; <Route children> will be ignored'
    );

    warning(
      !(
        this.props.render &&
        this.props.children &&
        !isEmptyChildren(this.props.children)
      ),
      'You should not use <Route render> and <Route children> in the same route; <Route children> will be ignored'
    );
  }

  componentDidMount() {
    // 缓存路由 & 渲染的时候获取dom
    if (this.isKeepRoute() && this.state.match) {
      this._latestMatchedRouter = this.context.router;
      this.getRouteDom();
    }
  }

  componentWillReceiveProps(nextProps, nextContext) {
    warning(
      !(nextProps.location && !this.props.location),
      '<Route> elements should not change from uncontrolled to controlled (or vice versa). You initially used no "location" prop and then provided one on a subsequent render.'
    );

    warning(
      !(!nextProps.location && this.props.location),
      '<Route> elements should not change from controlled to uncontrolled (or vice versa). You provided a "location" prop initially but omitted it on a subsequent render.'
    );
    // next match
    let match = this.computeMatch(nextProps, nextContext.router);
    let computedMatch = match;

    // recompute match if enable live
    if (this.isKeepRoute()) {
      // prev match
      computedMatch = this.computeMatchWithLive(this.props, match);
    }

    this.setState({
      match: computedMatch
    });
  }

  // 获取 Route 对应的 DOM
  componentDidUpdate() {
    if (!this.isKeepRoute()) {
      return;
    }
    // restore display when matched normally
    if (this.liveState === NORMAL_RENDER_MATCHED) {
      this.showRoute();
    }
    // get DOM if match and render
    if (this.state.match) {
      this.getRouteDom();
    }
  }

  // clear on unmounting
  componentWillUnmount() {}

  isKeepRoute() {
    return !!this.props.alwaysLive;
  }
  computeMatchWithLive(props, match) {
    const prevMatch = this.computeMatch(props, this.context.router);
    if (match) {
      // normal matched render
      console.log('--- NORMAL MATCH FLAG ---')
      this.liveState = NORMAL_RENDER_MATCHED;
      return match;
    } else if (props.alwaysLive && this.routeDom) {
      // backup router when from normal match render to hide render
      if (prevMatch) {
        this._latestMatchedRouter = this.context.router;
      }
      console.log('--- HIDE FLAG ---')
      this.liveState = HIDE_RENDER;
      this.hideRoute();
      return prevMatch;
    } else {
      // normal unmatched unmount
      console.log('--- NORMAL UNMATCH FLAG ---')
      this.liveState = NORMAL_RENDER_UNMATCHED;
      this.clearDomData();
    }
  }
  computeMatch({ location, path, strict, exact, sensitive }, router) {
    invariant(
      router,
      'You should not use <Route> or withRouter() outside a <Router>'
    );

    const { route } = router;
    const pathname = (location || route.location).pathname;

    return matchPath(pathname, { path, strict, exact, sensitive }, route.match);
  }

  // get DOM of Route
  getRouteDom() {
    let routeDom = ReactDOM.findDOMNode(this);
    this.routeDom = routeDom;
  }

  // hide DOM & back up style
  hideRoute() {
    if (this.routeDom && this.routeDom.style.display !== 'none') {
      console.log('--- hide route --->' + this.props.path);
      this.previousDisplayStyle = this.routeDom.style.display;
      this.routeDom.style.display = 'none';
    }
  }

  // recover the root display
  showRoute() {
    console.log('invoke showRoute>' + this.props.path);
    if (this.routeDom && this.previousDisplayStyle !== null) {
      this.routeDom.style.display = this.previousDisplayStyle;
    }
  }
  // initial state
  clearDomData() {
    if (this.isKeepRoute()) {
      this.routeDom = null;
      this.previousDisplayStyle = null;
    }
  }
  // normally render or unmount Route
  renderRoute(component, render, props, match) {
    if (component) return match ? React.createElement(component, props) : null;
    if (render) return match ? render(props) : null;
  }
  shouleNormalRender = () => {
    return [NORMAL_RENDER_MATCHED, NORMAL_RENDER_UNMATCHED, NORMAL_RENDER_ON_INIT].includes(this.liveState)
  }
  shouleHideRender = () => {
    return this.liveState === HIDE_RENDER
  }
  render() {
    // console.log(`render=====>${this.props.path}`);
    // console.log(`previousDisplayStyle=====>${this.previousDisplayStyle}`);
    // console.log(`this.liveState========>${this.liveState}`);
    const { match } = this.state;
    const { children, component, render, alwaysLive } = this.props;
    const { history, route, staticContext } = this.context.router;
    const location = this.props.location || route.location;
    const props = { match, location, history, staticContext };
    if (alwaysLive && (component || render)) {
      // console.log('=== RENDER FLAG: ' + this.liveState + ' ===')
      if (this.shouleNormalRender()) {
        return this.renderRoute(component, render, props, match);
      } else if (this.shouleHideRender()) {
        const prevRouter = this._latestMatchedRouter;
        // load properties from prevRouter and fake props of latest normal render
        const { history, route, staticContext } = prevRouter;
        const location = this.props.location || route.location;
        const liveProps = { match, location, history, staticContext };
        return this.renderRoute(component, render, liveProps, true);
      }
    }

    // the following is the same as Route of react-router, just render it normally
    if (component) return match ? React.createElement(component, props) : null;

    if (render) return match ? render(props) : null;

    if (typeof children === 'function') return children(props);

    if (children && !isEmptyChildren(children))
      return React.Children.only(children);

    return null;
  }
}

export default Route;
