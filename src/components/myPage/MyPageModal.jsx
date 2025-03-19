import supabase from '@/supabase/supabaseClient';
import { useEffect, useRef, useState } from 'react';
import useOutsideClick from '../DetailPage/useOutsideClick';

const MyPageModal = ({ close, nickname, setNickname, setImage, introduce, setIntroduce }) => {
  const [newNickname, setNewNickname] = useState(nickname);
  const [newIntroduce, setNewIntroduce] = useState(introduce);
  const [file, setFile] = useState(null);
  const [userData, setUserData] = useState(null);
  const myModalRef = useRef(null);
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

  const handleCloseModal = () => {
    close?.();
  };

  useOutsideClick(myModalRef, handleCloseModal);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };
  const handleProfile = async () => {
    try {
      if (!userData) {
        console.error('유저 정보를 찾을 수 없습니다.');
        return;
      }

      let publicUrl = null;
      if (file) {
        const fileName = `image_${userData}_${Date.now()}`;

        const { data: profileImage, error: uploadError } = await supabase.storage
          .from('imageFile')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) return;

        const { data: publicUrlData } = supabase.storage.from('imageFile').getPublicUrl(fileName);
        publicUrl = publicUrlData.publicUrl;
        console.log(publicUrl);

        const { data: updateData, error: updateError } = await supabase
          .from('userinfo')
          .update({
            profile_image: publicUrl
          })
          .eq('id', userData);

        if (updateError) {
          console.log('updateError : ', updateError);
        } else {
          setImage(publicUrl);
        }
      }

      const { data: userNameData, error: userNameError } = await supabase
        .from('userinfo')
        .update({
          username: newNickname,
          introduce: newIntroduce
        })
        .eq('id', userData);

      if (userNameError) {
        console.log('username error : ', userNameError);
      } else {
        setNickname(newNickname);
        setIntroduce(newIntroduce);
      }
    } catch (error) {
      console.log(error);
    }
    handleCloseModal();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className="h-auto rounded-lg w-[500px] bg-white" ref={myModalRef}>
        <div className="m-2 flex justify-center items-center">
          <h3>내 정보</h3>
        </div>
        <div className="my-3 mx-3">
          <div className="flex flex-col">
            <label htmlFor="newNickname" className="ml-1">
              닉네임
            </label>
            <input
              className="px-2 py-2 rounded-md m-1.5 font-semibold border"
              type="text"
              value={newNickname}
              onChange={(e) => setNewNickname(e.target.value)}
              id="newNickname"
            />
            <label htmlFor="newIntroduce" className="ml-1">
              자기소개
            </label>
            <textarea
              className="px-2 py-2 rounded-md m-1.5 font-semibold border text-sm h-full"
              type="text"
              style={{ resize: 'none' }}
              value={newIntroduce}
              placeholder={
                introduce.length > 0 ? '자기소개를 수정하세요 (최대 100자)' : '자기소개를 추가하세요 (최대 100자)'
              }
              onChange={(e) => setNewIntroduce(e.target.value)}
              id="newIntroduce"
              autoComplete="off"
              rows={4}
              maxLength={100}
            />
            <label htmlFor="profile" className="ml-1">
              프로필 사진
            </label>
            <input
              className="px-5 py-2.5 rounded-md m-1.5 font-semibold border"
              type="file"
              id="profile"
              onChange={handleFileChange}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleProfile}
              className="text-xs px-2 py-1.5 border-none bg-btn-blue rounded-md text-white m-1.5 font-semibold cursor-pointer hover:bg-blue-400 transition-all"
            >
              변경하기
            </button>
            <button
              className="text-xs px-2 py-1.5 border-none bg-btn-red rounded-md text-white m-1.5 font-semibold cursor-pointer hover:bg-red-400 transition-all"
              type="button"
              onClick={close}
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPageModal;
