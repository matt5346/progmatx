module.exports.createMessage = (socket, io) => {
  socket.on('createMessage', (data) => {
    if (!data.text) {
      return { valid: false, text: 'текст не может быть пустым' }
    }
    // console.log(`${data.userId} - data.dialogId new message`, data.dialogId)

    io.to(data.dialogId).emit('newMessage', data)

    return { valid: true, text: 'Сообщение отправлено' }
  })
}

module.exports.userJoined = (socket, io) => {
  socket.on('userJoined', (data) => {
    if (!data.userId || !data.dialogId) {
      return { valid: false, text: 'Данные не верны' }
    }
    // console.log(`${data.userId} - data.dialogId user Join`, data.dialogId)

    socket.join(data.dialogId)

    return { valid: true }
  })
}
