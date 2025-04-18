import ClubList from './ClubList';
import UserInfo from './UserInfo';

const MyPage = () => {
  return (
    <section className="max-w-screen-xl flex flex-col mx-auto lg:w-[80%] lg:mx-auto md:w-[80%] md:mx-0px auto; md:ml-[110px]  sm:w-[90%] sm:mx-auto sm:ml-[100px] min-[320px]:w-[90%] h-[100dvh] ">
      <div className="flex flex-col p-2 gap-1 w-full sm:p-1 mx-auto md:p-4 pb-[5rem]">
        <UserInfo />
        <ClubList />
      </div>
    </section>
  );
};

export default MyPage;
