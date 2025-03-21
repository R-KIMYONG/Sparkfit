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
  const [activeTab, setActiveTab] = useState('joined');

  const navigate = useNavigate();
  const [userId, setUserData] = useState(null);
  const getMyGathering = async () => {
    const { data, error } = await supabase.from('Contracts').select('*').eq('user_id', userId);
    if (error) {
      console.log(error);
    }
    const sortedGatherings = data?.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return dateB - dateA; // 내림차순 정렬
    });
    return sortedGatherings;
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
            {MyCreateGatheringWithStatus.map(({ region, sports_name, gather_name, deadline, id, $status }, index) => (
              <li
                key={index + 1}
                onClick={() => handleMoveToDetail(id)}
                className="cursor-pointer p-4 border border-teal-100 rounded-lg hover:shadow-xl  flex-auto"
              >
                <div className="flex justify-between items-center">
                  <div className="bg-[#efefef] rounded-md px-3 py-2 text-center w-2/5 text-xs">{sports_name}</div>
                  <STDeadline $status={$status}>{deadline}</STDeadline>
                </div>
                <div className="flex flex-col text-xs">
                  <p className="pb-2 mt-4 font-black truncate">{gather_name}</p>
                  <p>{region}</p>
                </div>
              </li>
            ))}
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
