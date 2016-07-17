const lettersPosition = require('./lettersPosition')

function generate(word, radius=0) {
  return word.toLowerCase().split('').filter((letter,index,wordArr)=>{
    return !(wordArr[index-1]===letter)
  }).filter((letter)=>{
    return lettersPosition[letter]!==undefined
  }).map(letter=>arround(lettersPosition[letter], radius))
}

function getRandomMultiplier() {
  return ((Math.floor(Math.random() * 10) % 2)===0)?1:-1
}

function getRandomInt(max, min=0) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function arround(position, radius) {
  let newPosition = {
    offsetX: position.offsetX + ( getRandomMultiplier() * getRandomInt(radius) ),
    offsetY: position.offsetY + ( getRandomMultiplier() * getRandomInt(radius) ),
  }

  return newPosition
}

module.exports = {
  generate,
}
