import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;

  const badgeMap = {
    pending: {
      text: '⏳ 승인 대기중',
      style: 'bg-yellow-50 border border-yellow-300 text-yellow-800'
    },
    rejected: {
      text: '❗️ 가입이 거절되었습니다',
      style: 'bg-red-50 border border-red-300 text-red-800'
    },
    approved: {
      text: '✅ 가입 완료',
      style: 'bg-green-50 border border-green-300 text-green-800'
    }
  };

  const badge = badgeMap[status];

  if (!badge) return null;

  return (
    <p className={`${badge.style} px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm`}>
      {badge.text}
    </p>
  );
};

export default StatusBadge;
