const { Server } = require("socket.io");

const {
  addFromBooking,
  addPatient,
  callNextToken,
  getQueueState,
  resetQueue,
  updateAvgConsultTime,
} = require("../services/queueService");

let ioInstance = null;

function emitError(socket, error) {
  const payload = {
    message: error.message || "Something went wrong",
    statusCode: error.statusCode || 500,
  };

  socket.emit("queue:error", payload);
  return payload;
}

async function handleQueueAction(socket, action, onSuccess, ack) {
  try {
    const state = await action();
    onSuccess(state);

    if (typeof ack === "function") {
      ack({ ok: true, state });
    }
  } catch (error) {
    const payload = emitError(socket, error);

    if (typeof ack === "function") {
      ack({ ok: false, error: payload });
    }
  }
}

function setupSocketServer(httpServer, clientUrl) {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: clientUrl,
      credentials: true,
    },
  });

  const io = ioInstance;

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // A fresh tab asks for state immediately so refresh never shows stale data.
    socket.on("queue:sync", (ack) => {
      handleQueueAction(
        socket,
        getQueueState,
        (state) => socket.emit("queue:state", state),
        ack
      );
    });

    // Same-name patients are allowed; token number is the unique queue identity.
    socket.on("patient:add", (payload, ack) => {
      handleQueueAction(
        socket,
        () => addPatient(payload),
        (state) => io.emit("queue:updated", state),
        ack
      );
    });

    socket.on("token:callNext", (payload, ack) => {
      handleQueueAction(
        socket,
        () => callNextToken(payload?.doctorId),
        (state) => {
          io.emit("token:called", state.currentToken);
          io.emit("queue:updated", state);
        },
        ack
      );
    });

    socket.on("queue:reset", (_payload, ack) => {
      handleQueueAction(
        socket,
        resetQueue,
        (state) => {
          io.emit("queue:cleared", state);
          io.emit("queue:updated", state);
        },
        ack
      );
    });

    socket.on("queue:updateAvgConsultTime", (payload, ack) => {
      handleQueueAction(
        socket,
        () => updateAvgConsultTime(payload?.avgConsultTime),
        (state) => io.emit("queue:updated", state),
        ack
      );
    });

    socket.on("booking:confirmed", (payload, ack) => {
      handleQueueAction(
        socket,
        () => addFromBooking(payload?.bookingId),
        (state) => io.emit("queue:updated", state),
        ack
      );
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

function getIo() {
  return ioInstance;
}

module.exports = {
  getIo,
  setupSocketServer,
};
