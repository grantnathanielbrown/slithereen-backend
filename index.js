var app = require('express')()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var axios = require('axios')

// app.get('/', function (req, res) {
//   res.sendFile(__dirname + '/index.html')
// })

var userArray = []

io.on('connection', function (socket) {

  socket.on('user join game', (data) => {
    userArray.push(data)
    io.emit('user list', userArray)
    console.log("ARRAY OF USERS: " + userArray)
  })
  // socket.on('connect', () => {
  //   userArray.push(socket.id)
  //   console.log(userArray)
  
  //   socket.emit('user id', userArray)

  // } )

  socket.on('chat message', function (msg) {
    io.emit('chat message', msg)
  })
  // 2
  socket.on('new question', function(question) {

    var randomQuestion = "http://jservice.io/api/random"
    axios.get(randomQuestion).then((response) => {
      question = response.data[0]
      // 3
      io.emit('new question', question)
      console.log("server has received new question")
      console.log(question)
    }).catch(function (error) {
        console.log(error);
    });
  })
  socket.on('correct', (data) => {
    var currentScores = data
    io.emit('update scores', currentScores)
  })
  socket.on('incorrect', function(incorrectGuess) {
    io.emit('incorrect', incorrectGuess)
  })
  socket.on('disconnect', () => {
    var index = userArray.indexOf(socket.id)
    if (index !== -1) {
      userArray.splice(index, 1)
    }
    io.emit('user list', userArray)
    console.log(socket.id + " disconnected")
    console.log("ARRAY OF USERS: " + userArray)
  })
})

app.set('port', 3001)

http.listen(app.get('port'), function () {
  console.log(`✅ PORT: ${app.get('port')} 🌟`)
})
