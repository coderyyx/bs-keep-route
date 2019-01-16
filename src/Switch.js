import React from 'react';
import PropTypes from 'prop-types';
import warning from 'warning';
import invariant from 'invariant';

const noop = () => {};
/**
 * The public API for rendering the first <Route> that matches.
 */
class Switch extends React.Component {
  static contextTypes = {
    router: PropTypes.shape({
      route: PropTypes.object.isRequired
    }).isRequired
  };

  static propTypes = {
    children: PropTypes.node,
    location: PropTypes.object,
    filter: PropTypes.func
  };

  componentWillMount() {
    invariant(
      this.context.router,
      'You should not use <Switch> outside a <Router>'
    );
  }

  componentWillReceiveProps(nextProps) {
    warning(
      !(nextProps.location && !this.props.location),
      '<Switch> elements should not change from uncontrolled to controlled (or vice versa). You initially used no "location" prop and then provided one on a subsequent render.'
    );

    warning(
      !(!nextProps.location && this.props.location),
      '<Switch> elements should not change from controlled to uncontrolled (or vice versa). You provided a "location" prop initially but omitted it on a subsequent render.'
    );
  }
  getRenderChildren = () => {
    const { route } = this.context.router;
    const { children, filter = noop } = this.props;
    const location = this.props.location || route.location;
    let child;
    let result = [];
    React.Children.forEach(children, element => {
      if (React.isValidElement(element)) {
        const { alwaysLive } = element.props;
        child = element;
        alwaysLive && result.push(React.cloneElement(child, { location }));
      }
    });

    if (filter) {
      invariant(typeof filter === 'function', 'filter必须是一个函数');
      result = filter ? filter(result) : result;
    }

    return result.length ? result : null;
  };
  render() {
    return this.getRenderChildren();
  }
}

export default Switch;
