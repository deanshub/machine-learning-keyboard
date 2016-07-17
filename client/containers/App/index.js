import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
// import classnames from 'classnames'

import Keyboard from '../../components/Keyboard'
// import style from './style.css'

class App extends Component {
  static propTypes = {
    children: PropTypes.object,
    params: PropTypes.object,
  }

  render() {
    return (
      <Keyboard />
    )
  }
}

function mapStateToProps(state) {
  return {
    ...state.routing.locationBeforeTransitions.state,
    ...state.homePage,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators({}, dispatch),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)
