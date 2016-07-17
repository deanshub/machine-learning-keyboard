const wordGenerator = require('./wordGenerator')
let fs = require('fs')
let Rx = require('rxjs')

let wordSubject = new Rx.Subject()
let readFileAsObservable = Rx.Observable.bindNodeCallback(fs.readFile)
let result = readFileAsObservable('./words.txt', 'utf8')

result.subscribe(text => {
  text.split('\n').forEach(w=>wordSubject.next(w))
}, e => console.error(e), ()=>{
  return wordSubject.complete()
})

wordSubject.subscribe(word=>{
  console.log(wordGenerator.generate(word, 62))
})

// console.log(wordGenerator.generate('book', 62))
// console.log(wordGenerator.generate('world', 62))
