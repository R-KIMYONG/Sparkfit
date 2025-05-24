import { ApprovalResults, STDeadline } from '../common/commonStyle';
import NewBadge from '../common/NewBadge';
import { getDeadlineStatus } from '@/utils/dateUtils';

const ClubInfo = ({ sportsName, deadline, gatherName, region, status, hasAlert, isReviewed }) => {
  const deadlineStatus = getDeadlineStatus(deadline);
  return (
    <div className="p-3 border border-sky-100 cursor-pointer rounded-lg hover:shadow-xl transition-all duration-300 ease-in-out flex flex-col justify-between box-border h-full">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-[#efefef] rounded-md px-3 py-1 text-center text-[0.5rem] font-bold">{sportsName}</div>
          {hasAlert && <NewBadge />}
        </div>
        <STDeadline $status={deadlineStatus}>{deadline}</STDeadline>
      </div>

      <div className="flex justify-between items-end text-xs gap-2">
        <div className="flex flex-col gap-1 overflow-hidden min-h-[3.5rem]">
          <p className="font-black text-sm leading-snug break-words whitespace-normal line-clamp-2">{gatherName}</p>
          <p className="text-xs text-gray-600 break-words whitespace-normal line-clamp-2">{region}</p>
        </div>
        {status && (
          <ApprovalResults $status={status}>
            <span className="text-xs label whitespace-nowrap">
              {status === 'rejected' ? '승인거절' : status === 'pending' ? '승인대기' : '가입완료'}
            </span>
          </ApprovalResults>
        )}
        {isReviewed !== undefined && (
          <div>
            <ApprovalResults $status={!isReviewed}>
              <span className="icon">{isReviewed ? '⚠️' : '✅'}</span>
              <span className="text-[0.5rem] whitespace-nowrap">{isReviewed ? '승인 필요' : '승인 불필요'}</span>
            </ApprovalResults>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubInfo;
