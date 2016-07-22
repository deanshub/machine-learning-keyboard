const synaptic = require('synaptic')
const fs = require('fs')
const Rx = require('rxjs')
const arrayPad = require('array-pad')
const wordGenerator = require('./wordGenerator')

const pointLimit = 10
const wordLettersLimit = 4
const hiddenLayersCount = 5
const letterRadius = 62
const learningRate = 0.3
let wordCount = 0

let allTheWords = {}

let readFileAsObservable = Rx.Observable.bindNodeCallback(fs.readFile)
let result = readFileAsObservable('./words.txt', 'utf8')

let wordSubject = new Rx.Observable.create((subscriber)=>{
  result.subscribe(text => {
    text.split('\n').forEach(w=>subscriber.next(w))
  }, e => console.error(e), ()=>{
    return subscriber.complete()
  })
})

let trainingData = wordSubject.filter(word=>word.length<=wordLettersLimit)

// console.log(wordGenerator.generate('book', letterRadius))
// console.log(wordGenerator.generate('world', letterRadius))

const pad = (n, width, z) => {
  z = z || '0'
  n = n + ''
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n
}

let swypeNetwork
trainingData.reduce((words,word)=>words.concat([word]),[]).subscribe(allWords=>{
  allTheWords.arr = allWords
  const wordsCount = allWords.length

  console.log(`Counted ${wordsCount} words`)
  allTheWords.obj = allWords.reduce((wordsObj, word, index)=>{
    wordsObj[word]=index
    return wordsObj
  },{})
  console.log('Words mapped')

  let inputLayer = new synaptic.Layer(pointLimit)
  let hiddenLayer = new synaptic.Layer(hiddenLayersCount)
  let outputLayer = new synaptic.Layer(wordsCount)
  inputLayer.project(hiddenLayer)
  hiddenLayer.project(outputLayer)

  swypeNetwork = new synaptic.Network()
  swypeNetwork.set({
    input: inputLayer,
    hidden: [hiddenLayer],
    output: outputLayer,
  })
  console.log('Network created')

// TODO: repeat this process
  trainingData.subscribe((word)=>{
    process.stdout.clearLine()
    process.stdout.cursorTo(0)
    process.stdout.write(`Training done ${Math.floor(wordCount/wordsCount*100)}%`)
    wordCount++
    let points = wordGenerator.generate(word, letterRadius)
    if (points.length<=pointLimit){
      const trainPointsArr = points.map(point=>{
        return parseInt(pad(point.offsetX, 4) + pad(point.offsetY, 4))
      })
      const trainArr = arrayPad(trainPointsArr,10,0)
      const leftPartOfOutput = arrayPad([1], -1 * allTheWords.obj[word], 0)
      const wholeOutput = arrayPad(leftPartOfOutput, wordsCount,0)
      swypeNetwork.activate(trainArr)
      swypeNetwork.propagate(learningRate, wholeOutput)
    }
  },(err)=>console.error(err),()=>{
    fs.writeFile('model.json',JSON.stringify(swypeNetwork.toJSON()))
    const testData =[{
      offsetX: 362,
      offsetY: 343,
    },{
      offsetX: 897,
      offsetY: 484,
    },{
      offsetX: 1266,
      offsetY: 358,
    }]
    const testDataNormalized = testData.map(point=>{
      return parseInt(pad(point.offsetX, 4) + pad(point.offsetY, 4))
    })
    const testRes = swypeNetwork.activate(arrayPad(testDataNormalized, 10, 0))
    const wordIndex = testRes.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0)
    console.log()
    console.log('done2', allTheWords.arr[wordIndex])
  })
},(err)=>console.error(err),()=>{
  console.log('done')
})
// training process
