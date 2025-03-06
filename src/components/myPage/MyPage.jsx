import styled from 'styled-components';
import ClubList from './ClubList';
import UserInfo from './UserInfo';

const MyPage = () => {
  return (
    <section className="max-w-screen-xl flex flex-col mx-auto lg:w-[75%] lg:mx-auto md:w-[75%] md:mx-0px auto; md:ml-[110px]  sm:w-[80%] sm:mx-auto sm:ml-[100px] min-[320px]:w-[80%]">
      <div className="flex flex-col p-2 gap-1 w-full sm:p-1 mx-auto md:p-4 ">
        <UserInfo />
        <ClubList />
      </div>
    </section>
  );
};

export const STSection = styled.section`
  display: flex;
  flex-direction: column;
  padding: 0.8rem;
  gap: 1rem;
  width: 100%;
`;

export default MyPage;
