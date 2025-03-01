import supabase from '@/supabase/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import styled from 'styled-components';
import Loading from '../GatheringPage/Loading';

const ClubInfo = ({ placeID }) => {
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

  const getDeadlineStatus = (deadlineDate) => {
    const today = new Date();

    if (!theClubs || theClubs.length === 0) {
      return;
    }

    if (today < deadlineDate) {
      return 'dayFuture';
    } else if (today === deadlineDate) {
      return 'dayToday';
    } else {
      return 'dayPast';
    }
  };

  const deadlineDate = theClubs ? new Date(theClubs[0].deadline) : null;
  const $status = getDeadlineStatus(deadlineDate);
  return (
    <>
      <div className="p-4 min-h-40 border border-sky-100 cursor-pointer min-h-35   rounded-lg mb-5 hover:shadow-xl transition-all duration-300 ease-in-out">
        <div className="flex justify-between">
          <div className="bg-[#efefef] rounded-md px-3 py-2 mb-2 text-center">{theClubs[0].sports_name}</div>
          <STDeadline $status={$status}>{theClubs[0].deadline}</STDeadline>
        </div>
        <div className="flex flex-col">
          <div className="pb-2 text-xl mt-4 font-black truncate">{theClubs[0].gather_name}</div>
          <div>{theClubs[0].region}</div>
        </div>
      </div>
    </>
  );
};

export const STDeadline = styled.div`
  max-width: 120px;
  height: min-content;
  padding: 8px 10px;
  border-radius: 5px;
  color: white;
  font-weight: bold;
  text-align: center;
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

export default ClubInfo;
