import supabase from '@/supabase/supabaseClient';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PlaceItem = ({ place }) => {
  const navigate = useNavigate();
  const [participantCount, setParticipantCount] = useState(0);

  useEffect(() => {
    const fetchParticipantCount = async () => {
      const { count, error } = await supabase
        .from('Contracts')
        .select('*', { count: 'exact', head: true })
        .eq('place_id', place.id)
        .eq('status', 'approved');

      if (error) {
        console.error('참여자 수 조회 오류:', error.message);
      } else {
        setParticipantCount(count);
      }
    };

    fetchParticipantCount();
  }, [place.id]);
  return (
    <div key={place.id} className="flex bg-[#ffffff] p-4 shadow-lg rounded-xl relative w-full">
      {/* 모임 설명 */}
      <div className="flex w-full">
        <div className="w-full flex flex-col gap-3">
          {/* 모임 제목/해시태그/버튼 */}

          <div className="w-full">
            <div className="flex justify-between items-center">
              <h2 className="text-lg mb-3 font-semibold">{place.gather_name}</h2>
              <div>
                <button
                  onClick={() => navigate(`/detail/${place.id}`)}
                  className="w-full transition-all duration-300 ease-in-out rounded-lg px-4 py-1.5 text-xs text-white bg-btn-blue hover:bg-[#6FA3D4]"
                >
                  상세보기
                </button>
              </div>
            </div>
            <ul className="flex gap-2.5">
              <li className="rounded-full bg-[#efefef] px-3 py-1.5 line-height-none text-xs">{place.sports_name}</li>
              <li className="py-1.5 line-height-none text-xs">{place.region}</li>
              <li className="py-1.5 line-height-none text-xs text-[#82C0F9]">{`${place.distance.toFixed(
                1
              )} km 이내`}</li>
            </ul>
          </div>

          <p className="text-sm lg:w-[80%] md:w-[100%] sm:w-full overflow-hidden text-ellipsis line-clamp-2 ">
            {place.texts}
          </p>
          <div className="flex flex-row gap-4">
            <p className="text-[#999] text-xs">{`${place.deadline} 마감`}</p>
            <p className="text-[#999] text-xs">{`인원 ${participantCount}/${place.max_participants}`}</p>
            <p className="text-[#999] text-xs">{place.isReviewed ? '승인 ⭕️' : '승인 ❌'}</p>
          </div>
        </div>
      </div>
      <svg className="absolute w-[25%] h-[25%] right-[-14%] top-[33%] fill-[#ffffff] rotate-90" viewBox="0 0 100 100">
        <polygon points="50,0 100,100 0,100" />
      </svg>
    </div>
  );
};

export default PlaceItem;
