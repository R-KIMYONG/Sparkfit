import useFilterStore from '@/zustand/filter.list';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';

const FilteringList = () => {
  const navigate = useNavigate();
  const { selectedButton, handleButtonSelect } = useFilterStore();
  const SortButton = ['거리순', '마감기한', '최신순', '승인 필요', '승인 필요 없음'];
  const sortOptions = SortButton.map((sort, idx) => ({
    value: idx,
    label: sort
  }));
  const handleSelectChange = (selectedOption) => {
    handleButtonSelect(selectedOption.value);
  };
  return (
    <div className="flex justify-between sticky top-0 z-10 w-[90%] box-border mx-auto mt-8">
      <div>
        <Select
          options={sortOptions}
          value={sortOptions.find((option) => option.value === selectedButton)}
          onChange={handleSelectChange}
          className="w-[8rem] text-xs"
          placeholder="필터 선택"
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
