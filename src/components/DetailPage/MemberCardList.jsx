import React from 'react';
import NewBadge from '../common/NewBadge';
import dayjs from 'dayjs';
dayjs.locale('ko');
const MemberCardList = ({
  members,
  type, // 'approved' | 'pending' 두가지 리스트를 구별하기위함
  currentUserId, //현재 로그인중인 사용자
  postCreatorId,
  onAction, // (userId, actionType) => void
  placeId,
  markCreatorAlertAsRead,
  markUserAlertAsRead,
  hasAlert
}) => {
  if (!members || members.length === 0) {
    return (
      <p className="text-center text-gray-500 py-4">
        {type === 'pending' ? '승인요청 없습니다.' : '가입된 멤버가 없습니다.'}
      </p>
    );
  }
  return (
    <ul className="flex flex-wrap gap-2 justify-start">
      {members.map((info) => {
        const defaultAvatar = info.gender === 'male' ? '/Ellipse1.png' : '/Ellipse2.png';
        const avatarSrc = info.profile_image || defaultAvatar;
        return (
          <li
            key={info.id}
            onClick={() => {
              markCreatorAlertAsRead(placeId, postCreatorId, info.id);
              if (markUserAlertAsRead && info.id === currentUserId) {
                markUserAlertAsRead(currentUserId, placeId);
              }
            }}
            className="border-b py-2 bg-[#EBF7FF] p-4 rounded-md flex flex-col flex-grow basis-[240px] max-w-[24%] min-w-[240px] relative cursor-pointer"
          >
            {hasAlert && <NewBadge className="absolute left-1 top-1" />}
            <div className="flex justify-between items-center gap-3">
              <div className="flex items-center gap-2">
                <img src={avatarSrc} alt="프로필" className="w-10 h-10 rounded-full" />
                <div>
                  <p className="text-sm font-semibold">{info.username}</p>
                  <p className="text-xs text-gray-500">{info.email}</p>
                  <p className="text-xs text-gray-500">성별 : {info.gender === 'male' ? '남' : '여'}</p>
                </div>
              </div>

              {type === 'approved' && currentUserId === postCreatorId && (
                <button
                  onClick={() => onAction(info.id, 'rejected')}
                  className="text-xs px-3 py-1.5 border-none bg-btn-red rounded-md text-white m-1.5 font-semibold cursor-pointer hover:bg-red-400 transition-all"
                >
                  탈퇴
                </button>
              )}
            </div>
            {info.created_at && (
              <p className="text-xs text-gray-500 mt-2">
                신청일: {dayjs(info.contract_created_at).format('YYYY년 M월 D일 HH시 mm분 ss초')}
              </p>
            )}

            {type === 'pending' && (
              <div className="flex items-center mt-2">
                <button
                  onClick={() => onAction(info.id, 'approved')}
                  className="text-xs px-3 py-1.5 border-none bg-btn-blue rounded-md text-white m-1.5 font-semibold cursor-pointer hover:bg-blue-400 transition-all"
                >
                  승인
                </button>
                <button
                  onClick={() => {
                    onAction(info.id, 'rejected');
                    markCreatorAlertAsRead(placeId, postCreatorId, info.id);
                  }}
                  className="text-xs px-3 py-1.5 border-none bg-btn-red rounded-md text-white m-1.5 font-semibold cursor-pointer hover:bg-red-400 transition-all"
                >
                  거절
                </button>
              </div>
            )}

            <div className="mt-2 min-h-[4rem]">
              <p className="text-xs">자기 소개</p>
              <p className="text-xs break-all whitespace-pre-line w-full">
                {info.introduce || '자기 소개글이 없습니다.'}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default MemberCardList;
