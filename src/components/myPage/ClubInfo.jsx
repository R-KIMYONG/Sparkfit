import supabase from '@/supabase/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import Loading from '../common/Loading';
import Error from '../common/Error';
import { ApprovalResults, STDeadline } from '../common/commonStyle';
import { getDeadlineStatus } from '@/utils/dateUtils';
const ClubInfo = ({ placeID, status }) => {
  const MyClubLists = async () => {
    const { data: mylist, isError } = await supabase
      .from('Places')
      .select('region, sports_name, gather_name, deadline')
      .eq('id', placeID);

    if (isError) {
      throw new Error('데이터 가져오기 실패');
    }

    return mylist;
  };
  const {
    data: theClubs,
    isPending,
    isError: theClubsError
  } = useQuery({
    queryKey: ['myClubs', placeID],
    queryFn: MyClubLists,
    enabled: !!placeID
  });

  const $status = theClubs && theClubs.length > 0 ? getDeadlineStatus(theClubs[0].deadline) : null;
  if (theClubsError) {
    return <Error message="모임 정보를 불러오는 중 오류가 발생했습니다. 다시 시도해주세요!" />;
  }

  if (isPending) {
    return <Loading />;
  }

  return (
    <>
      <div className="p-4 min-h-35 border border-sky-100 cursor-pointer min-h-35   rounded-lg mb-5 hover:shadow-xl transition-all duration-300 ease-in-out">
        <div className="flex justify-between items-center">
          <div className="bg-[#efefef] rounded-md px-3 py-2 box-border text-center text-[0.5rem]">
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

export default ClubInfo;
