import useFilterStore from '@/zustand/filter.list';
import { useNavigate } from 'react-router-dom';

const FilteringList = () => {
  const navigate = useNavigate();
  const { selectedButton, handleButtonSelect } = useFilterStore();
  const SortButton = ['현재 사용자 위치', '마감기한', '최신순'];

  

  return (
    <div className="flex justify-between py-10">
      <ul className="flex gap-3">
        {SortButton.map((sort, idx) => (
          <li
            key={idx}
            onClick={() => handleButtonSelect(idx)}
            className={`cursor-pointer rounded-md text-xs flex flex-col justify-center text-center px-2 transition ${
              selectedButton === idx ? 'bg-[#82C0F9] text-[#ffffff] ' : 'bg-[#ffffff]'
            }`}
          >
            <p>{sort}</p>
          </li>
        ))}
      </ul>

      <button
        className="min-[320px]:hidden bg-[#82C0F9] text-[#ffffff] lg:text-xs lg:px-4 lg:py-2 sm:text-[12px] sm:px-3 sm:hidden md:block rounded-md hover:bg-[#6FA3D4] transition-all duration-300 ease-in-out"
        onClick={() => navigate('/main')}
      >
        + 새로운 모임 만들기
      </button>
    </div>
  );
};

export default FilteringList;
