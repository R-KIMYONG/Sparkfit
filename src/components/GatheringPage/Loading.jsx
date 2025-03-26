import { FadeLoader } from 'react-spinners';

const Loading = () => {
  return (
    <div className="bg-[#EBF7FF] w-[100%] h-[100dvh] absolute top-0 left-0 overflow-hidden">
      <div className="flex justify-center flex-col items-center text-[#92B6D7] text-xl font-bold absolute translate-x-[-50%] translate-y-[-50%] top-[50%] left-[50%]">
        <FadeLoader color="#82C0F9" />
        <p className="my-5 text-sm">데이터를 가지고 오고 있어요!</p>
      </div>
    </div>
  );
};

export default Loading;
