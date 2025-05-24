import supabase from '@/supabase/supabaseClient';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NewBadge from '../common/NewBadge';

const PlaceItem = ({ place, showBadge }) => {
  const navigate = useNavigate();
  const [participantCount, setParticipantCount] = useState(0);
  const [host, setHost] = useState(null);
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

  useEffect(() => {
    const fetchHostInfo = async () => {
      const { data, error } = await supabase.from('Userinfo').select('*').eq('id', place.created_by).single();

      if (error) {
        console.error('모임장 정보 조회 오류:', error.message);
      } else {
        setHost(data);
      }
    };

    if (place.created_by) {
      fetchHostInfo();
    }
  }, [place.created_by]);

  return (
    <div key={place.id} className="flex bg-[#ffffff] p-4 shadow-lg rounded-xl relative w-full">
      {/* 모임 설명 */}
      <div className="flex w-full">
        <div className="w-full flex flex-col gap-3">
          {/* 모임 제목/해시태그/버튼 */}
          <div className="w-full">
            <div className="flex justify-between items-center">
              <div className="flex items-center flex-1 mb-3 gap-2">
                <h2 className="text-lg font-semibold">{place.gather_name}</h2>
                {showBadge && <NewBadge />}
              </div>
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
              <li className="py-1.5 line-height-none text-xs text-[#82C0F9]">
                {typeof place.distance === 'number' ? `${place.distance.toFixed(1)} km 이내` : '거리 정보 없음'}
              </li>
            </ul>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium text-gray-600">👤 모임장:</span>
            <span className="text-gray-800">{host?.username}</span>
          </div>
          <div className="text-sm text-gray-700">
            <div className="font-medium text-gray-600 mb-1 flex items-center gap-1">
              📝 <span>모임소개:</span>
            </div>
            <p className="text-sm lg:w-[80%] md:w-[100%] sm:w-full overflow-hidden text-ellipsis whitespace-nowrap">
              {place.texts}
            </p>
          </div>
          <div className="flex flex-row gap-4">
            <p className="text-[#999] text-xs">{`${place.deadline} 마감`}</p>
            <p className="text-[#999] text-xs">{`인원 ${participantCount}/${place.max_participants}`}</p>
            <p className="flex items-center text-xs">
              <span className={`mr-1 ${place.isReviewed ? 'text-red-500' : 'text-green-500'}`}>
                {place.isReviewed ? '⚠️' : '✅'}
              </span>
              <span className={place.isReviewed ? 'text-red-500' : 'text-green-500'}>
                {place.isReviewed ? '승인 필요' : '승인 필요 없음'}
              </span>
            </p>
          </div>
        </div>
      </div>
      <svg className="absolute w-[25%] h-[25%] right-[-13%] top-[33%] fill-[#ffffff] rotate-90" viewBox="0 0 100 100">
        <polygon points="50,0 100,100 0,100" />
      </svg>
    </div>
  );
};

export default PlaceItem;
