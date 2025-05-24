// 모임장에게 온 알림만 필터링 (가입 요청)
export const hasCreatorAlert = (creatorContractAlerts, placeId, userId) => {
  // {모임장이 받아야할 알림 배열,어느 모임인지,현재 로그인된 사용자}
  return creatorContractAlerts.some(
    (alert) =>
      alert.placeId === placeId &&
      alert.placeCreatorId === userId && // 내가 만든 모임
      alert.targetUserId !== userId // 내가 요청한 게 아닌 경우 (즉, 다른 사용자의 요청)
  );
};

// 내가 받은 승인/거절 알림만 필터링
export const hasUserAlert = (userContractAlerts, placeId, userId) => {
  //멤버가 받아야할 알림 배열, 어느모임인지,현재로그인중인 사용자
  return userContractAlerts.some(
    (alert) =>
      alert.placeId === placeId &&
      alert.userId === userId && // 나를 대상으로 한 알림
      ['approved'].includes(alert.type)
  );
};
