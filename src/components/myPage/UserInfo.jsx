import supabase from '@/supabase/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { HiPencilSquare } from 'react-icons/hi2';
import { RiUser3Line } from 'react-icons/ri';
import Loading from '../common/Loading';
import { STSection } from './MyPage';
import MyPageModal from './MyPageModal';
import Error from '../common/Error';

const UserInfo = () => {
  const [myPageModal, setMyPageModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [nickname, setNickname] = useState('');
  const [image, setImage] = useState('');
  const [introduce, setIntroduce] = useState('');
  const getUserInfo = async () => {
    if (!userData) return;
    const { data, error } = await supabase.from('userinfo').select('*').eq('id', userData);

    if (error) {
      console.log(error);
    } else {
      setNickname(data[0].username);
      setImage(data[0].profile_image || (data[0].gender === 'male' ? '/Ellipse1.png' : '/Ellipse2.png'));
      setIntroduce(data[0].introduce || '');
    }
    return data;
  };
  useEffect(() => {
    const authToken = localStorage.getItem('sb-muzurefacnghaayepwdd-auth-token');

    if (authToken) {
      try {
        const parsedToken = JSON.parse(authToken);
        const userId = parsedToken?.user?.id;
        setUserData(userId);
      } catch (error) {
        console.error('토큰 파싱 실패:', error);
      }
    } else {
      console.log('토큰을 찾지 못했습니다.');
    }
  }, []);
  const {
    data: theUser,
    isPending,
    error: usersError
  } = useQuery({
    queryKey: ['Users'],
    queryFn: getUserInfo,
    enabled: !!userData
  });
  if (isPending) {
    return <Loading />;
  }

  if (usersError) {
    return <Error message="유저정보 가져오는 데 실패했습니다." />;
  }
  return (
    <STSection>
      <h3 className="flex gap-2 border-b-2 border-slate-300 text-lg items-center pb-2">
        <RiUser3Line />내 정보
      </h3>
      <div className="flex rounded-2xl p-5 gap-4 bg-customBackground justify-between items-center mt-8 box-border">
        <div className="flex flex-wrap items-center gap-8 w-[90%]">
          <div className="flex items-center gap-8">
            <div className="flex items-center w-[3rem] h-[3rem] rounded-ful overflow-hidden">
              <img src={image} alt="profile-img" className="rounded-full w-full h-full" />
            </div>

            <div className="flex flex-col gap-2 text-xs">
              <p>{nickname} 님 반갑습니다.</p>
              <p className="text-slate-400">email : {theUser && theUser[0].email}</p>
              <p className="text-slate-400">성별 : {theUser && theUser[0].gender === 'male' ? '남' : '여'}</p>
            </div>
          </div>
          <div className="flex-1 min-w-[200px]">
            <p className="text-sm text-gray-400 h-full">
              {theUser && introduce ? introduce : '자기 소개를 추가해주세요'}
            </p>
          </div>
        </div>

        <div className="cursor-pointer flex-grow relative">
          <HiPencilSquare
            className="w-6 h-6 absolute right-0 top-1/2 -translate-y-1/2"
            onClick={() => {
              setMyPageModal(true);
            }}
          />
        </div>
        {myPageModal && (
          <MyPageModal
            close={() => {
              setMyPageModal(false);
            }}
            nickname={nickname}
            setNickname={setNickname}
            setImage={setImage}
            introduce={introduce}
            setIntroduce={setIntroduce}
          />
        )}
      </div>
    </STSection>
  );
};
export default UserInfo;
