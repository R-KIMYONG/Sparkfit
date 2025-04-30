import useFilterStore from '@/zustand/filter.list';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';

const FilteringList = () => {
  const navigate = useNavigate();

  const { filterType, sortType, setFilterType, setSortType } = useFilterStore();

  const filterOptions = [
    { value: 0, label: '전체 모임' },
    { value: 1, label: '승인 필요 모임' },
    { value: 2, label: '비승인 모임' },
    { value: 3, label: '미확인 모임' }
  ];

  const sortOptions = [
    { value: 0, label: '거리순' },
    { value: 1, label: '최신순' },
    { value: 2, label: '마감임박순' }
  ];

  return (
    <div className="flex justify-between sticky top-0 z-10 w-[90%] box-border mx-auto mt-8">
      <div className="flex items-center gap-2">
        <Select
          options={filterOptions}
          value={filterOptions.find((option) => option.value === filterType)}
          onChange={(option) => setFilterType(option.value)}
          className="w-[8rem] text-xs"
          placeholder="모임 필터"
        />
        <Select
          className="w-[8rem] text-xs"
          options={sortOptions}
          value={sortOptions.find((option) => option.value === sortType)}
          onChange={(option) => setSortType(option.value)}
          placeholder="정렬 기준"
        />
      </div>
      <button
        className="min-[320px]:hidden bg-[#82C0F9] text-[#ffffff] lg:text-xs lg:px-4 lg:py-2 sm:text-[12px] sm:px-3 sm:hidden md:block rounded-md hover:bg-[#6FA3D4] transition-all duration-300 ease-in-out "
        onClick={() => navigate('/main')}
      >
        + 새 모임 만들기
      </button>
    </div>
  );
};

export default FilteringList;
