import supabase from '@/supabase/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import { AiFillThunderbolt, AiOutlineThunderbolt } from 'react-icons/ai';
import { RiGroupLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import ClubInfo, { STDeadline } from './ClubInfo';
import { STSection } from './MyPage';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
const ClubList = () => {
  const navigate = useNavigate();
  const [userId, setUserData] = useState(null);
  const getMyGathering = async () => {
    const { data, error } = await supabase.from('Contracts').select('place_id').eq('user_id', userId);
    if (error) {
      console.log(error);
    }
    return data;
  };

  useEffect(() => {
    const authToken = localStorage.getItem('sb-muzurefacnghaayepwdd-auth-token');

    if (authToken) {
      try {
        const parsedToken = JSON.parse(authToken);
        const userId = parsedToken?.user?.id;
        setUserData(userId);
      } catch (error) {
        console.error('Token parsing error:', error);
      }
    } else {
      console.log('No auth token found in localStorage');
    }
  }, []);

  const { data: theGatherings } = useQuery({
    queryKey: ['myGathering', userId],
    queryFn: getMyGathering,
    enabled: !!userId
  });
  const getMyCreateGathering = async () => {
    if (!userId) return null;
    const { data: CreateGathering, error: CreateGatheringError } = await supabase
      .from('Places')
      .select('region, sports_name, gather_name, deadline, id')
      .eq('created_by', userId);
    if (CreateGatheringError) {
      console.error(CreateGatheringError);
    }
    const sortedGatherings = CreateGathering?.sort((a, b) => {
      const dateA = new Date(a.deadline);
      const dateB = new Date(b.deadline);
      return dateB - dateA; // 내림차순 정렬
    });
    return sortedGatherings;
  };

  const { data: MyCreateGathering } = useQuery({
    queryKey: ['myCreateGathering', userId],
    queryFn: getMyCreateGathering,
    enabled: !!userId
  });
  const getDeadlineStatus = (deadlineDate) => {
    // if (!MyCreateGathering || MyCreateGathering.length === 0 || !deadlineDate) {
    //   return;
    // }
    if (!deadlineDate) {
      return;
    }

    const today = dayjs().startOf('day');
    const deadline = dayjs(deadlineDate).startOf('day');

    if (today.isBefore(deadline)) {
      return 'dayFuture';
    } else if (today.isSame(deadline, 'day')) {
      return 'dayToday';
    } else {
      return 'dayPast';
    }
  };
  // 모든 모임의 deadline 배열 추출
  const MyCreateGatheringWithStatus = MyCreateGathering?.map((gathering) => {
    const $status = getDeadlineStatus(gathering.deadline);
    return { ...gathering, $status }; // 상태 추가
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

  return (
    <>
      <STSection>
        <h3 className="flex gap-2 mt-2 text-xl items-center">
          <RiGroupLine />내 번개 모임
        </h3>
        <div className="min-[320px]:block min-[320px]:mb-[10%] sm:mb-0 lg:flex justify-between gap-5">
          {/* 내가 가입한 모임 */}
          <div className="flex flex-col gap-4 w-full">
            {theGatherings && theGatherings.length > 0 ? (
              <ul className="truncate">
                <span className="flex border-b-2 border-slate-300 mb-5 text-lg items-center">
                  <AiFillThunderbolt />
                  내가 가입한 번개
                </span>
                {theGatherings.map(({ place_id }, index) => (
                  <li key={index + 1} onClick={() => handleMoveToDetail(place_id)} className="cursor-pointer truncate">
                    <ClubInfo placeID={place_id} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col gap-4 w-full">
                <span className="flex border-b-2 border-slate-300 mb-5 text-lg items-center">
                  <AiFillThunderbolt />
                  내가 가입한 번개
                </span>
                <div className="flex mx-auto text-slate-400">
                  가입한 번개 <AiFillThunderbolt /> 모임이 없어요!
                </div>
              </div>
            )}
          </div>
          {/* 내가 만든 모임 */}
          <div className="flex flex-col gap-4 w-full">
            {MyCreateGathering && MyCreateGathering.length > 0 ? (
              <ul>
                <span className="flex border-b-2 border-slate-300 mb-5 text-lg items-center">
                  <AiOutlineThunderbolt />
                  내가 만든 번개
                </span>
                {MyCreateGatheringWithStatus.map(
                  ({ region, sports_name, gather_name, deadline, id, $status }, index) => (
                    <li
                      key={index + 1}
                      onClick={() => handleMoveToDetail(id)}
                      className="cursor-pointer p-4 min-h-35 border border-teal-100 rounded-lg mb-5 hover:shadow-xl transition-all duration-300 ease-in-out"
                    >
                      <div className="flex justify-between items-center">
                        <div className="bg-[#efefef] rounded-md px-3 py-2 text-center w-[120px] text-sm">
                          {sports_name}
                        </div>
                        <STDeadline $status={$status}>{deadline}</STDeadline>
                      </div>
                      <div className="flex flex-col">
                        <div className="pb-2 text-base mt-4 font-black truncate">{gather_name}</div>
                        <div className="text-sm">{region}</div>
                      </div>
                    </li>
                  )
                )}
              </ul>
            ) : (
              <div className="flex flex-col gap-4">
                <span className="flex border-b-2 border-slate-300 mb-5 text-lg items-center">
                  <AiOutlineThunderbolt />
                  내가 만든 번개
                </span>
                <div className="flex mx-auto text-slate-400">
                  만든 번개 <AiOutlineThunderbolt /> 모임이 없어요!
                </div>
              </div>
            )}
          </div>
        </div>
      </STSection>
    </>
  );
};

export default ClubList;
