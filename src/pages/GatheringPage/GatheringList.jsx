import FilteringList from '@/components/GatheringPage/FilteringList';
import GatheringItem from '@/components/GatheringPage/GatheringItem';

const GatheringList = () => {
  return (
    <div className="bg-[#EBF7FF] w-full h-[100dvh] flex flex-col">
      <div className="max-w-screen-xl mx-auto h-full xl:w-[90%] xl:mx-auto xl:ml-[6rem] lg:w-[90%] lg:mx-auto lg:ml-[5rem] md:w-[90%] md:ml-[4.3rem] sm:w-[90%] sm:mx-auto sm:ml-[4.3rem] min-[320px]:w-[90%] flex flex-col ">
        <FilteringList />
        <GatheringItem />
      </div>
    </div>
  );
};

export default GatheringList;
