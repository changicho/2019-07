import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import io from 'socket.io-client';
import PropTypes from 'prop-types';
import { Prompt } from 'react-router';

import PlayerFooter from '../../components/inGame/PlayerFooter';
import PlayerWaiting from '../../components/inGame/PlayerWaiting';
import PlayerQuizLoading from '../../components/inGame/PlayerQuizLoading';
import PlayerQuiz from '../../components/inGame/PlayerQuiz';
import PlayerSubResult from '../../components/inGame/PlayerSubResult';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

function PlayerGameRoom({ location, history }) {
  const socket = io.connect(process.env.REACT_APP_BACKEND_HOST);

  const [isQuizStart, setQuizStart] = useState(false);
  const [isLoadingOver, setLoadingOver] = useState(false);
  const [isCurrentQuizOver, setCurrentQuizOver] = useState(false);
  const [quizSet, setQuizSet] = useState({});
  const [currentIndex, setCurrentQuiz] = useState(-1);

  useEffect(() => {
    socket.emit('enterPlayer', {
      nickname: location.state.nickname,
      roomNumber: location.state.roomNumber,
    });

    return () => {
      /**
       * react-router의 Prompt를 사용하면 페이지를 나가는 것을 막을 수 있지만
       * 아래 closeRoom 수신 시 history.push가 정상동작하지 않는 문제가 있음.
       */
      socket.emit('leavePlayer', {
        nickname: location.state.nickname,
        roomNumber: location.state.roomNumber,
      });
    };
  }, []);

  socket.on('start', () => {
    setQuizStart(true);
    setCurrentQuizOver(false);
  });

  // 다음 문제 (새로운 문제) 시작;
  socket.on('next', nextQuizIndex => {
    setCurrentQuiz(nextQuizIndex);

    setCurrentQuizOver(false);
    setLoadingOver(true);
  });

  // 현제 문제 제한시간 끝, 중간 결과 페이지 출력
  socket.on('break', () => {
    setCurrentQuizOver(true);
  });

  // 현제 문제 제한시간 끝, 중간 결과 페이지 출력
  socket.on('end', () => {
    setCurrentQuizOver(true);
  });

  socket.on('closeRoom', () => {
    /**
     * 사용자에게 Modal로 방이 닫혔음을 알림
     * 사용자가 어떤 형태로든 창을 닫으면 경로를 바꾼다.
     */
    history.push({
      pathname: '/',
    });
  });

  return (
    <Container>
      <Prompt message="페이지를 이동하면 방에서 나가게 됩니다. 계속 하시겠습니까?" />
      {!isQuizStart && <PlayerWaiting />}
      {isQuizStart && !isLoadingOver && (
        <PlayerQuizLoading
          setQuizSet={setQuizSet}
          roomNumber={location.state.roomNumber}
        />
      )}
      {isQuizStart && isLoadingOver && !isCurrentQuizOver && (
        <PlayerQuiz quizSet={quizSet} currentIndex={currentIndex} />
      )}
      {isQuizStart && isLoadingOver && isCurrentQuizOver && <PlayerSubResult />}

      <PlayerFooter nickname={location.state.nickname} />
    </Container>
  );
}

PlayerGameRoom.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
    state: PropTypes.shape({
      nickname: PropTypes.string.isRequired,
      roomNumber: PropTypes.string.isRequired,
    }),
  }).isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default PlayerGameRoom;
