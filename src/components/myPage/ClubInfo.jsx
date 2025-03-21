import supabase from '@/supabase/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components';
import Loading from '../GatheringPage/Loading';
import dayjs from 'dayjs';
const ClubInfo = ({ placeID, status }) => {
  const MyClubLists = async () => {
    const { data: mylist, error } = await supabase
      .from('Places')
      .select('region, sports_name, gather_name, deadline')
      .eq('id', placeID);

    if (error) {
      console.log(error);
    }

    return mylist;
  };
  const {
    data: theClubs,
    isPending,
    error: theClubsError
  } = useQuery({
    queryKey: ['myClubs', placeID],
    queryFn: MyClubLists,
    enabled: !!placeID
  });

  if (theClubsError) {
    console.log('theClubsError');
  }

  if (isPending) {
    return <Loading />;
  }

  const getDeadlineStatus = (deadlineDateString) => {
    if (!deadlineDateString) return;

    const today = dayjs().startOf('day');
    const deadline = dayjs(deadlineDateString).startOf('day');

    if (today.isBefore(deadline)) {
      return 'dayFuture';
    } else if (today.isSame(deadline)) {
      return 'dayToday';
    } else {
      return 'dayPast';
    }
  };

  const $status = theClubs && theClubs.length > 0 ? getDeadlineStatus(theClubs[0].deadline) : null;
  return (
    <>
      <div className="p-4 min-h-35 border border-sky-100 cursor-pointer min-h-35   rounded-lg mb-5 hover:shadow-xl transition-all duration-300 ease-in-out">
        <div className="flex justify-between items-center">
          <div className="bg-[#efefef] rounded-md px-3 py-2 box-border text-center w-2/5 text-xs">
            {theClubs[0].sports_name}
          </div>
          <STDeadline $status={$status}>{theClubs[0].deadline}</STDeadline>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex flex-col text-xs">
            <p className="pb-2 mt-4 font-black truncate">{theClubs[0].gather_name}</p>
            <p>{theClubs[0].region}</p>
          </div>
          <ApprovalResults $status={status}>
            {status === 'rejected' ? '승인거절' : status === 'pending' ? '승인대기' : '가입완료'}
          </ApprovalResults>
        </div>
      </div>
    </>
  );
};

export const STDeadline = styled.div`
  max-width: 50%;
  height: min-content;
  padding: 0.5rem 0.75rem;
  border-radius: 5px;
  color: white;
  font-size: 0.75rem;
  line-height: 1rem;
  text-align: center;
  box-sizing: border-box;
  @media screen and (max-width: 1024px) {
    width: 100%;
  }
  background-color: ${({ $status }) => {
    switch ($status) {
      case 'dayFuture':
        return '#82C0F9';
      case 'dayToday':
        return '#b1c3f2';
      case 'dayPast':
        return '#f7a9a9';
      default:
        return 'gray';
    }
  }};
`;

export const ApprovalResults = styled.p`
  max-width: 50%;
  height: min-content;
  padding: 0.5rem;
  border-radius: 5px;
  color: white;
  font-size: 0.75rem;
  line-height: 1rem;
  text-align: center;
  box-sizing: border-box;
  background-color: ${({ $status }) => {
    switch ($status) {
      case 'approved':
        return '#82C0F9';
      case 'peding':
        return '#b1c3f2';
      case 'rejected':
        return '#f7a9a9';
      default:
        return 'gray';
    }
  }};
`;

export default ClubInfo;
