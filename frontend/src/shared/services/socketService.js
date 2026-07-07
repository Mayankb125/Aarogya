import { io } from 'socket.io-client'

const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

let socket = null

function getSocket() {
  if (!socket) {
    // One browser tab should own one connection even as React routes change.
    socket = io(socketUrl, {
      autoConnect: false,
    })
  }

  return socket
}

function emitWithAck(eventName, payload = {}) {
  const activeSocket = getSocket()

  return new Promise((resolve, reject) => {
    activeSocket.timeout(5000).emit(eventName, payload, (error, response) => {
      if (error) {
        reject(new Error('Backend did not respond. Check server connection.'))
        return
      }

      if (!response?.ok) {
        reject(new Error(response?.error?.message || 'Queue action failed'))
        return
      }

      resolve(response.state)
    })
  })
}

export { emitWithAck, getSocket }
