import React, { useContext } from 'react';
import { observer } from 'mobx-react';
import moment from 'moment';
import { RootStoreContext } from '../../../rootStore';

export const Tracker = observer(() => {
  const { userStore } = useContext(RootStoreContext);

  const convertToTime = (time: number): string => {
    const hh = moment.duration(time).asHours();
    const mmss = moment.utc(time).format(':mm:ss');
    return Math.floor(hh) + mmss;
  };

  return <p>{`${convertToTime(userStore.workTime)}`}</p>;
});
