import React, { Component } from 'react'
class Display extends Component {
  render() {
    const string = this.props.data;
    const dis = this.props.display;
    return <div className="Display" style={{display:dis}}> {string} </div>
  }
}
export default Display
