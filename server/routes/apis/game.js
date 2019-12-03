const express = require('express');

const router = express.Router();

const inMemory = require('../../models/rooms');

const {
  isRoomExist,
  isNicknameExist,
} = require('../../middleware/validations');

/**
 * @api {get} /room/:roomNumber/quiz 현재 방에서 진행 할 퀴즈 세트를 가져오는 API
 * @apiName quiz
 * @apiGroup room
 *
 * @apiParam {string} roomNumber 6글자 방 번호
 *
 * @apiSuccess {Object} quizDataSet 퀴즈 세트
 */
router.get('/room/:roomNumber/quiz', async (req, res) => {
  const { roomNumber } = req.params;
  let quizSet = {};
  // inMemory서 quizSet을 가져옴.
  quizSet = inMemory.getRoom(roomNumber).quizSet;
  // 받아온 quizSet을 전송
  res.json({
    quizSet,
  });
});

/**
 * 유저의 점수 총 합을 알려주는 API
 * @api {get} /room/:roomNumber/user/:nickname
 * @apiName subResult
 * @apiGroup room
 *
 * @apiParam {string} roomNumber 6글자 방 번호
 * @apiParam {string} nickname 유저의 입장 닉네임
 *
 * @apiSuccess {string} nickname 현제 유저의 닉네임 (string)
 * @apiSuccess {Integer} scores 최신 상태의 점수 (int)
 */
router.get(
  '/room/:roomNumber/player/:nickname',
  isRoomExist,
  isNicknameExist,
  async (req, res) => {
    const { roomNumber, nickname } = req.params;

    const currentRoom = inMemory.rooms.find(
      (room) => room.roomNumber === roomNumber,
    );
    const currentUser = currentRoom.players.find(
      (player) => player.nickname === nickname,
    );

    res.json({
      nickname,
      score: currentUser.score,
    });
  },
);

/**
 * 퀴즈가 끝나고 특정 유저의 결과 (등수, 점수)를 알려주는 API
 * @api {get} /room/:roomNumber/user/:nickname/result
 * @apiName subResult
 * @apiGroup room
 *
 * @apiParam {string} roomNumber 6글자 방 번호
 * @apiParam {string} nickname 유저의 입장 닉네임
 *
 * @apiSuccess {string} nickname 현제 유저의 닉네임 (string)
 * @apiSuccess {Integer} scores 최신 상태의 점수 (int)
 * @apiSuccess {Integer} 등수 (int)
 */
router.get(
  '/room/:roomNumber/player/:nickname/result',
  isRoomExist,
  isNicknameExist,
  async (req, res) => {
    const { roomNumber, nickname } = req.params;

    const currentRoom = inMemory.rooms.find(
      (room) => room.roomNumber === roomNumber,
    );
    const rank = currentRoom.players.findIndex(
      (player) => player.nickname === nickname,
    );
    const currentUser = currentRoom.players[rank];

    res.json({
      nickname,
      score: currentUser.score,
      rank,
    });
  },
);

module.exports = router;
