var app = require('express')()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var axios = require('axios')

var userArray = []
var messageArray = []

io.on('connection', function (socket) {

  socket.on('user join game', (data) => {
    userArray.push(data)
    io.emit('user list', userArray)
    console.log("ARRAY OF USERS: " + userArray)
  })

  socket.on('submit message', (data) => {
    messageArray.push(data)
    if (messageArray.length > 10) {
      messageArray.shift()
    }
    console.log("MESSAGE ARRAY: " + messageArray)
    io.emit('message list', messageArray)
  })
  socket.on('new question', function(question) {

    var randomQuestion = "http://jservice.io/api/random"
    axios.get(randomQuestion).then((response) => {
      question = response.data[0]
      io.emit('new question', question)
      console.log("server has received new question")
      console.log(question)
    }).catch(function (error) {
        console.log(error);
    });
  })
  socket.on('correct guess', (data) => {
    console.log(data)
    messageArray.push(data.announcer)
    if (messageArray.length > 10) {
      messageArray.shift()
    }
    var index = userArray.findIndex(
      function (obj) {
        return obj.id === socket.id
      }
    )

    userArray[index].score = userArray[index].score + data.value
    console.log(userArray[index].score)
    io.emit('user list', userArray)
    io.emit('message list', messageArray)
    io.emit('end round')
  })
  socket.on('incorrect guess', (data) => {
    messageArray.push(data)
    if (messageArray.length > 10) {
      messageArray.shift()
    }
    console.log("MESSAGE ARRAY: " + messageArray)
    io.emit('message list', messageArray)
  })
  socket.on('disconnect', () => {

    var index = userArray.findIndex(
      function (obj) {
        return obj.id === socket.id
      }
    )
    if (index !== -1) {
      userArray.splice(index, 1)
    }
    io.emit('user list', userArray)
    console.log(socket.id + " disconnected")
    console.log("ARRAY OF USERS: " + userArray)
  })
})

app.set('port', process.env.PORT || 3001)

http.listen(app.get('port'), function () {
  console.log(`✅ PORT: ${app.get('port')} 🌟`)
})
