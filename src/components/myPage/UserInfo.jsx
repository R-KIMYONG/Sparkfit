import supabase from '@/supabase/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { HiPencilSquare } from 'react-icons/hi2';
import { RiUser3Line } from 'react-icons/ri';
import Loading from '../GatheringPage/Loading';
import { STSection } from './MyPage';
import MyPageModal from './MyPageModal';

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
    console.error(usersError);
    return <div>error!</div>;
  }
  return (
    <STSection>
      <h3 className="flex gap-2 border-b-2 border-slate-300 text-lg items-center pb-2">
        <RiUser3Line />내 정보
      </h3>
      <div className="flex rounded-2xl p-4 gap-8 bg-customBackground justify-between items-center">
        <div className="flex items-center w-[80px] h-[80px]">
          <img src={image} alt="profile-img" className="rounded-full overflow-hidden w-full h-full" />
        </div>

        <div className="flex flex-col gap-2 text-xs">
          <p>{nickname} 님 반갑습니다.</p>
          <p className="text-slate-400">email : {theUser && theUser[0].email}</p>
          <p className="text-slate-400">성별 : {theUser && theUser[0].gender === 'male' ? '남' : '여'}</p>
        </div>

        <div className="flex flex-col flex-grow w-ful h-full">
          <p className="text-sm text-gray-400 h-full">
            {theUser && introduce ? introduce : '자기 소개를 추가해주세요'}
          </p>
        </div>

        <div className="cursor-pointer">
          <HiPencilSquare
            className="w-6 h-6"
            onClick={() => {
              setMyPageModal(true);
            }}
          />
          {myPageModal && (
            <MyPageModal
              close={() => {
                setMyPageModal(false);
              }}
              nickname={nickname}
              setNickname={setNickname}
              setImage={setImage}
              introduce={theUser[0].introduce}
              setIntroduce={setIntroduce}
            />
          )}
        </div>
      </div>
    </STSection>
  );
};

export default UserInfo;
