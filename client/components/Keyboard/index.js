import React, { Component, PropTypes } from 'react'
import ReactDom from 'react-dom'
import classnames from 'classnames'
import { Observable } from 'rxjs'
import request from 'superagent'
import simplify from 'simplify-js'

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

    mouseup.subscribe(()=>{
      // repaint
      let points = this.path.reduce((path, point) => {
        let newPath = path
        if (!path[path.length] ||
          (path[path.length].x !== point.first.offsetX &&
          path[path.length].y !== point.first.offsetY)){
          newPath = newPath.concat([{x: point.first.offsetX,y: point.first.offsetY}])
        }
        if (!path[path.length] ||
          (path[path.length].x !== point.second.offsetX &&
          path[path.length].y !== point.second.offsetY)){
          newPath = newPath.concat([{x: point.second.offsetX,y: point.second.offsetY}])
        }
        return newPath
      },[])
      // simplify(points, tolerance, highestQuality)
      let simplifyedPath = simplify(points, 10).map(point=>{
        return {offsetX: point.x, offsetY: point.y}
      })
      // console.log(points.length, simplifyedPath.length);
      this.clearCanvas(context)
      context.beginPath()
      context.moveTo(simplifyedPath[0].offsetX, simplifyedPath[0].offsetY)
      Observable.from(simplifyedPath).skip(1).subscribe((point)=>{
        context.lineTo(point.offsetX, point.offsetY)
        context.moveTo(point.offsetX, point.offsetY)
        context.stroke()
      })

      if(this.path.length>0){
        request.post('/api/path')
        .send({path:this.path})
        .set('Accept','application/json')
        .end((err,res)=>{
          console.log(err?err:res.body)
        })
      }
    })
    mousedown.subscribe(()=>{
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
