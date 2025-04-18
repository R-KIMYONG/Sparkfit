import dayjs from 'dayjs';

export const getDeadlineStatus = (deadlineDate) => {
  if (!deadlineDate) return;

  const today = dayjs().startOf('day');
  const deadline = dayjs(deadlineDate).startOf('day');

  if (today.isBefore(deadline)) {
    return 'dayFuture';
  } else if (today.isSame(deadline)) {
    return 'dayToday';
  } else {
    return 'dayPast';
  }
};
