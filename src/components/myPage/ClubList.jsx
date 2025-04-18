import supabase from '@/supabase/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import { AiFillThunderbolt, AiOutlineThunderbolt } from 'react-icons/ai';
import { RiGroupLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useState } from 'react';
import Loading from '../common/Loading';
import Error from '../common/Error';
import useUserId from '@/hooks/useUserId';
import { ApprovalResults, STDeadline, STSection } from '../common/commonStyle';
import ClubInfo from './ClubInfo';
import { getDeadlineStatus } from '@/utils/\bdateUtils';
const ClubList = () => {
  const [activeTab, setActiveTab] = useState('joined');
  const navigate = useNavigate();
  const userId = useUserId();

  const getMyGathering = async () => {
    const { data, error } = await supabase
      .from('Contracts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    if (error) {
      console.log(error);
    }
    return data;
  };

  const {
    data: theGatherings,
    isTheGatheringsPending,
    isError: isTheGatheringsError
  } = useQuery({
    queryKey: ['myGathering', userId],
    queryFn: getMyGathering,
    enabled: !!userId
  });
  const getMyCreateGathering = async () => {
    const { data: CreateGathering, error: CreateGatheringError } = await supabase
      .from('Places')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });
    if (CreateGatheringError) {
      console.error(CreateGatheringError);
    }
    return CreateGathering;
  };

  const {
    data: MyCreateGathering,
    isPending: isMyCreateGatheringPending,
    isError: isMyCreateGatheringError
  } = useQuery({
    queryKey: ['myCreateGathering', userId],
    queryFn: getMyCreateGathering,
    enabled: !!userId
  });

  const MyCreateGatheringWithStatus = MyCreateGathering?.map((gathering) => ({
    ...gathering,
    $status: getDeadlineStatus(gathering.deadline)
  }));
  const handleMoveToDetail = (place_id) => {
    Swal.fire({
      title: '모임 상세 페이지로 이동하시겠어요?',
      icon: 'question',
      showConfirmButton: true,
      showCancelButton: true,
      confirmButtonText: '이동하기',
      cancelButtonText: '취소'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate(`/detail/${place_id}`);
      }
    });
  };

  if (isTheGatheringsPending && isMyCreateGatheringPending) {
    return <Loading />;
  }
  if (isMyCreateGatheringError || isTheGatheringsError) {
    return <Error message="모임 목록을 불러오는 중 오류가 발생했습니다. 다시 시도해주세요!" />;
  }
  return (
    <>
      <STSection>
        <h3 className="flex gap-2 mt-2 text-xl items-center">
          <RiGroupLine />내 번개 모임
        </h3>
        <div className="flex mb-5 box-border w-full">
          <button
            className={`px-5 py-2 w-1/2 text-sm font-bold transition-all border-b-2 ${
              activeTab === 'joined'
                ? 'border-blue-500 text-blue-500 bg-customBackground rounded-t-xl'
                : 'text-gray-400'
            }`}
            onClick={() => setActiveTab('joined')}
          >
            <AiFillThunderbolt className="inline-block mr-1" />
            가입한 번개
          </button>
          <button
            className={`px-5 py-2 w-1/2 text-sm font-bold transition-all border-b-2 ${
              activeTab === 'created'
                ? ' border-blue-500 text-blue-500 bg-customBackground rounded-t-xl'
                : 'text-gray-400'
            }`}
            onClick={() => setActiveTab('created')}
          >
            <AiOutlineThunderbolt className="inline-block mr-1" />
            만든 번개
          </button>
        </div>
        {activeTab === 'joined' ? (
          // 내가 가입한 번개 리스트
          theGatherings && theGatherings.length > 0 ? (
            <ul className="truncate flex items-center flex-wrap gap-2">
              {theGatherings.map(({ place_id, status }, index) => (
                <li
                  key={index + 1}
                  onClick={() => handleMoveToDetail(place_id)}
                  className="cursor-pointer truncate flex-auto"
                >
                  <ClubInfo placeID={place_id} status={status} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex mx-auto text-slate-400 items-center">
              가입한 번개 <AiFillThunderbolt /> 모임이 없어요!
            </div>
          )
        ) : // 내가 만든 번개 리스트
        MyCreateGathering && MyCreateGathering.length > 0 ? (
          <ul className="flex items-center flex-wrap gap-2">
            {MyCreateGatheringWithStatus.map(
              ({ region, sports_name, gather_name, deadline, id, isReviewed, $status }, index) => (
                <li
                  key={index + 1}
                  onClick={() => handleMoveToDetail(id)}
                  className="cursor-pointer p-4 border border-teal-100 rounded-lg hover:shadow-xl  flex-auto"
                >
                  <div className="flex justify-between items-center">
                    <div className="bg-[#efefef] rounded-md px-5 py-2 text-center text-[0.7rem] font-bold">
                      {sports_name}
                    </div>
                    <STDeadline $status={$status}>{deadline}</STDeadline>
                  </div>
                  <div className="flex justify-between items-end text-xs mt-2">
                    <div className="flex flex-col gap-2">
                      <p className="font-black truncate">{gather_name}</p>
                      <p>{region}</p>
                    </div>
                    <div>
                      <ApprovalResults $status={isReviewed}>
                        <span className="icon">{isReviewed ? '⚠️' : '✅'}</span>
                        <span className="label">{isReviewed ? '승인 필요' : '승인 필요 없음'}</span>
                      </ApprovalResults>
                    </div>
                  </div>
                </li>
              )
            )}
          </ul>
        ) : (
          <div className="flex mx-auto text-slate-400 items-center">
            만든 번개 <AiOutlineThunderbolt /> 모임이 없어요!
          </div>
        )}
      </STSection>
    </>
  );
};

export default ClubList;
