const io = require('socket.io')();
const inMemory = require('./models/inMemory');

async function handleOpenRoom({ roomId }) {
  const roomNumber = inMemory.room.setNewRoom(this.id);

  await inMemory.room.setQuizSet(roomNumber, roomId);

  this.host = true;
  this.join(roomNumber, () => {
    io.to(inMemory.room.getRoomHostId(roomNumber)).emit('openRoom', {
      roomNumber,
    });
  });
}

function handleStartQuiz({ roomNumber }) {
  if (!inMemory.room.isRoomExist(roomNumber)) return;

  io.to(roomNumber).emit('start');

  setTimeout(() => {
    io.to(roomNumber).emit('next', 0);
  }, 3000);
}

function handleNextQuiz({ roomNumber, nextQuizIndex }) {
  if (!inMemory.room.isRoomExist(roomNumber)) return;

  io.to(roomNumber).emit('next', nextQuizIndex);
}

function handleBreakQuiz({ roomNumber, quizIndex }) {
  if (!inMemory.room.isRoomExist(roomNumber)) return;

  this.join(roomNumber, () => {
    io.to(this.id).emit(
      'subResult',
      inMemory.room.getSubResult(roomNumber, quizIndex),
    );
  });

  io.to(roomNumber).emit('break');
}

function handleEndQuiz({ roomNumber }) {
  if (!inMemory.room.isRoomExist(roomNumber)) return;

  io.to(roomNumber).emit('end', inMemory.room.getFinalResult(roomNumber));
}

function handleEnterPlayer({ roomNumber, nickname }) {
  if (!inMemory.room.isRoomExist(roomNumber)) return;

  if (inMemory.room.isPlayerExist(roomNumber, nickname)) {
    const score = inMemory.room.getPlayerScore(roomNumber, nickname);

    this.join(roomNumber, () => {
      io.to(this.id).emit('settingScore', score);
    });
    return;
  }

  const players = inMemory.room.setNewPlayer(roomNumber, nickname);

  this.join(roomNumber, () => {
    io.to(inMemory.room.getRoomHostId(roomNumber)).emit('enterPlayer', players);
  });
}

function handleLeavePlayer({ roomNumber, nickname }) {
  if (!inMemory.room.isRoomExist(roomNumber)) return;
  const result = inMemory.room.deletePlayer(roomNumber, nickname);

  if (result) {
    this.join(roomNumber, () => {
      io.to(inMemory.room.getRoomHostId(roomNumber)).emit(
        'leavePlayer',
        inMemory.room.getPlayers(roomNumber),
      );
    });
  }
}

function handleCloseRoom() {
  if (!this.host) return;
  const roomNumber = inMemory.room.deleteRoom(this.id);
  io.to(roomNumber).emit('closeRoom');
}

io.on('connection', (socket) => {
  socket.on('disconnect', handleCloseRoom.bind(socket));
  socket.on('openRoom', handleOpenRoom.bind(socket));
  socket.on('start', handleStartQuiz.bind(socket));
  socket.on('next', handleNextQuiz.bind(socket));
  socket.on('break', handleBreakQuiz.bind(socket));
  socket.on('end', handleEndQuiz.bind(socket));
  socket.on('enterPlayer', handleEnterPlayer.bind(socket));
  socket.on('leavePlayer', handleLeavePlayer.bind(socket));
});

module.exports = io;
