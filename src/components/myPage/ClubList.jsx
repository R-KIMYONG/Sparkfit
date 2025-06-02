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
import { STSection } from '../common/commonStyle';
import ClubInfo from './ClubInfo';
import { usePlacesCount } from '@/zustand/placescount.store';
import NewBadge from '../common/NewBadge';

const ClubList = () => {
  const [activeTab, setActiveTab] = useState('joined');
  const navigate = useNavigate();
  const userId = useUserId();
  const creatorContractAlerts = usePlacesCount((state) => state.creatorContractAlerts);
  const userContractAlerts = usePlacesCount((state) => state.userContractAlerts);

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
    data: placesData,
    isPending: isPlacesPending,
    isError: isPlacesError
  } = useQuery({
    queryKey: ['placesData'],
    queryFn: async () => {
      const { data, error } = await supabase.from('Places').select('id, region, sports_name, gather_name, deadline');

      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    enabled: !!userId
  });

  const {
    data: MyCreateGathering,
    isPending: isMyCreateGatheringPending,
    isError: isMyCreateGatheringError
  } = useQuery({
    queryKey: ['myCreateGathering', userId],
    queryFn: getMyCreateGathering,
    enabled: !!userId
  });

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

  if (isTheGatheringsPending || isMyCreateGatheringPending || isPlacesPending) {
    return <Loading />;
  }

  if (isMyCreateGatheringError || isTheGatheringsError || isPlacesError) {
    return <Error message="모임 목록을 불러오는 중 오류가 발생했습니다. 다시 시도해주세요!" />;
  }
  return (
    <>
      <STSection>
        <h3 className="flex gap-2 mt-2 text-xl items-center">
          <RiGroupLine />내 번개 모임
        </h3>
        <div className="flex box-border w-full">
          <button
            className={`px-5 py-2 w-1/2 text-sm font-bold transition-all border-b-2 ${
              activeTab === 'joined'
                ? 'border-blue-500 text-blue-500 bg-customBackground rounded-t-xl'
                : 'text-gray-400'
            }`}
            onClick={() => setActiveTab('joined')}
          >
            {/* {userContractAlerts.length > 0 ? <NewBadge className="mr-1" /> : ''} */}
            {userContractAlerts.some(
              (alert) => alert.userId === userId && ['approved', 'rejected'].includes(alert.type)
            ) && <NewBadge className="mr-1" />}
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
            {creatorContractAlerts.length > 0 ? <NewBadge className="mr-1" /> : ''}
            <AiOutlineThunderbolt className="inline-block mr-1" />
            My 번개
          </button>
        </div>
        {/* 내가 가입한 모임 리스트 */}
        {activeTab === 'joined' &&
          (theGatherings && theGatherings.length > 0 ? (
            <ul className="grid sm:grid-cols-[repeat(auto-fill,_minmax(200px,1fr))] justify-start gap-4 grid-cols-1">
              {theGatherings.map(({ place_id, status }, _) => {
                const club = placesData.find((p) => p.id === place_id);
                const hasAlert = userContractAlerts.some(
                  (alert) => alert.placeId === place_id && ['approved', 'rejected'].includes(alert.type)
                );

                return (
                  <li key={place_id} onClick={() => handleMoveToDetail(place_id)} className="h-[120px] box-border">
                    <ClubInfo
                      sportsName={club?.sports_name}
                      deadline={club?.deadline}
                      gatherName={club?.gather_name}
                      region={club?.region}
                      status={status}
                      hasAlert={hasAlert}
                    />
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex mx-auto text-slate-400 items-center">
              가입한 번개 <AiFillThunderbolt /> 모임이 없어요!
            </div>
          ))}
        {/* 내가 만든 모임 리스트 */}
        {activeTab === 'created' &&
          (MyCreateGathering && MyCreateGathering.length > 0 ? (
            <ul className="grid sm:grid-cols-[repeat(auto-fill,_minmax(200px,1fr))] justify-start gap-4 grid-cols-1">
              {MyCreateGathering.map(({ id, sports_name, deadline, gather_name, region, isReviewed }) => {
                const hasAlert = creatorContractAlerts.some(
                  (alert) => alert.placeId === id && alert.placeCreatorId === userId
                );
                return (
                  <li key={id} onClick={() => handleMoveToDetail(id)} className="h-[120px] box-border">
                    <ClubInfo
                      sportsName={sports_name}
                      deadline={deadline}
                      gatherName={gather_name}
                      region={region}
                      hasAlert={hasAlert}
                      isReviewed={isReviewed}
                    />
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex mx-auto text-slate-400 items-center">
              만든 번개 <AiOutlineThunderbolt /> 모임이 없어요!
            </div>
          ))}
      </STSection>
    </>
  );
};

export default ClubList;
