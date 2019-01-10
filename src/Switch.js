import React from 'react'
import PropTypes from 'prop-types'
import warning from 'warning'
import invariant from 'invariant'
import matchPath from './matchPath'

/**
 * The public API for rendering the first <Route> that matches.
 */
class Switch extends React.Component {
  static contextTypes = {
    router: PropTypes.shape({
      route: PropTypes.object.isRequired
    }).isRequired
  }

  static propTypes = {
    children: PropTypes.node,
    location: PropTypes.object
  }

  componentWillMount () {
    invariant(
      this.context.router,
      'You should not use <Switch> outside a <Router>'
    )
  }

  componentWillReceiveProps (nextProps) {
    warning(
      !(nextProps.location && !this.props.location),
      '<Switch> elements should not change from uncontrolled to controlled (or vice versa). You initially used no "location" prop and then provided one on a subsequent render.'
    )

    warning(
      !(!nextProps.location && this.props.location),
      '<Switch> elements should not change from controlled to uncontrolled (or vice versa). You provided a "location" prop initially but omitted it on a subsequent render.'
    )
  }
  // alwaysLive === true 返回
  getRenderChildren = () => {
    const { route } = this.context.router
    const { children } = this.props
    const location = this.props.location || route.location
    let match, child
    let result = []
    React.Children.forEach(children, element => {
      if (React.isValidElement(element)) {
        const {
          path: pathProp,
          exact,
          strict,
          sensitive,
          from,
          alwaysLive
        } = element.props
        const path = pathProp || from

        child = element
        alwaysLive && result.push(React.cloneElement(child, { location }))
        // match = matchPath(
        //   location.pathname,
        //   { path, exact, strict, sensitive },
        //   route.match
        // )
      }
    })
    
    // hack
    let tagNavList = JSON.parse(localStorage.getItem('tagNavList') || '[]').map((location) => location.pathname)
    result = result.filter((component) => {
      return (tagNavList.indexOf(component.props.path) >= 0)
    })

    return result.length !== 0 ? result : null
  }
  render () {
    return this.getRenderChildren()
  }
}

export default Switch
