import React, { useEffect, useContext } from 'react';
import styled from 'styled-components';
import * as colors from '../../constants/colors';
import ProgressBar from './ProgressBar';
import { fetchQuizSet } from '../../utils/fetch';
import { HostGameAction, HostGameContext } from '../../reducer/hostGameReducer';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const Main = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${colors.BACKGROUND_LIGHT_GRAY};
  flex: 1;
  align-items: center;
  padding: 0 2rem 2rem;
`;

const Notify = styled.p`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  padding: 0 2rem;
  font-size: 2rem;
  text-align: center;
  font-weight: bold;
  color: ${colors.TEXT_BLACK};
`;

function HostLoading() {
  const { roomState, dispatcher } = useContext(HostGameContext);

  useEffect(() => {
    fetchQuizSet(roomState.roomNumber).then(response => {
      dispatcher({
        type: HostGameAction.SET_ENTIRE_QUIZ,
        data: response.quizSet,
      });
    });
  }, []);

  return (
    <Container>
      <Main>
        <Notify>
          퀴즈가 준비 중이에요 <br />
          잠시 기다려주세요
        </Notify>
        <ProgressBar animationDurationSeconds={3} />
      </Main>
    </Container>
  );
}

export default HostLoading;
