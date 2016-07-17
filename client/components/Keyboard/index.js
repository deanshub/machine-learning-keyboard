import React, { Component, PropTypes } from 'react'
import ReactDom from 'react-dom'
import classnames from 'classnames'
import { Observable } from 'rxjs'

import style from './style.css'
import imgPath from '../../pictures/keyboard.jpg'

const getOffset = (event) => {
  return {
    offsetX: event.offsetX === undefined ? event.layerX : event.offsetX,
    offsetY: event.offsetY === undefined ? event.layerY : event.offsetY,
  }
}

class Keyboard extends Component {
  static propTypes = {
    // children: PropTypes.object,
    // params: PropTypes.object,
    path: PropTypes.array,
  }

  static defaultProps = {
    path: [ { offsetX: 285, offsetY: 486 },
  { offsetX: 1361, offsetY: 538 },
  { offsetX: 1112, offsetY: 651 },
  { offsetX: 1075, offsetY: 355 },
  { offsetX: 814, offsetY: 481 },
  { offsetX: 898, offsetY: 472 },
  { offsetX: 677, offsetY: 294 } ],
  }

  constructor(props){
    super(props)
    this.path = []
    this.state = {
      width: 0,
      height: 0,
    }
  }

  componentDidMount() {
    let canvasElement = ReactDom.findDOMNode(this)
    let context = canvasElement.getContext('2d')

    let up = 'mouseup'
    let move = 'mousemove'
    let down = 'mousedown'
    if (window.navigator.pointerEnabled) {
      up = 'pointerup'
      move = 'pointermove'
      down = 'pointerdown'
    }
    if ('ontouchstart' in window){
      up = 'touchstart'
      move = 'touchmove'
      down = 'touchend'
      // touchcancel
    }

    let mouseup = Observable.fromEvent(canvasElement, up)
    let mousemove = Observable.fromEvent(canvasElement, move)
    let mousedown = Observable.fromEvent(canvasElement, down)
    let resize = Observable.fromEvent(window, 'resize').throttleTime(250)

    let mouseDiffs = mousemove.zip(mousemove.skip(1), (x, y) => {
      return { first: getOffset(x), second: getOffset(y) }
    })
    let mouseButton = mousedown.mapTo(true).merge(mouseup.mapTo(false))

    let painting = mouseButton.switchMap((down)=>{
      return down ? mouseDiffs : mouseDiffs.take(0)
    })

    // temp for getting letters
    // mousedown.subscribe((x)=>{
    //   console.log(getOffset(x));
    // })

    mouseButton.subscribe(()=>{
      this.clearCanvas(context)
    })
    painting.subscribe((x) => {
      this.path.push(x)
      context.beginPath()
      context.moveTo(x.first.offsetX, x.first.offsetY)
      context.lineTo(x.second.offsetX, x.second.offsetY)
      context.stroke()
    })
    this.resizeCanvas(canvasElement)

    resize.subscribe(()=>{
      this.resizeCanvas(canvasElement)
    })
  }

  resizeCanvas(canvasElement){
    setTimeout(()=>{
      const canvasSize = getComputedStyle(canvasElement)

      this.setState({
        width: parseInt(canvasSize.getPropertyValue('width'), 10),
        height: parseInt(canvasSize.getPropertyValue('height'), 10),
      })

      setTimeout(()=>{
        if (this.props.path.length>1){
          let context = canvasElement.getContext('2d')
          const x = this.props.path[0]
          context.beginPath()
          context.moveTo(x.offsetX, x.offsetY)
          Observable.from(this.props.path).skip(1).subscribe((x)=>{
            context.lineTo(x.offsetX, x.offsetY)
            context.stroke()
          })
        }
      })
    })
  }

  // componentDidUpdate() {
  //   let context = ReactDom.findDOMNode(this).getContext('2d')
  //   this.clearCanvas(context)
  // }

  clearCanvas(context){
    const { width, height } = this.state
    context.clearRect(0,0,width,height)
    this.path = []
  }

  render() {
    const { width, height } = this.state
    return (
      <canvas
          className={classnames(style.canvas)}
          height={height}
          style={{backgroundImage:`url(${imgPath})`}}
          width={width}
      >
      </canvas>
    )
  }
}

export default Keyboard
