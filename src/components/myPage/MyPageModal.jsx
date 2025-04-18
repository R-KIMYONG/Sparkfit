import supabase from '@/supabase/supabaseClient';
import { useRef, useState } from 'react';
import useOutsideClick from '../DetailPage/useOutsideClick';
import useUserId from '@/hooks/useUserId';
import Swal from 'sweetalert2';
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
const MyPageModal = ({ close, nickname, setNickname, setImage, introduce, setIntroduce }) => {
  const [newNickname, setNewNickname] = useState(nickname);
  const [newIntroduce, setNewIntroduce] = useState(introduce);
  const [file, setFile] = useState(null);
  const myModalRef = useRef(null);

  const userId = useUserId();

  const handleCloseModal = () => {
    setFile(null);
    close?.();
  };

  useOutsideClick(myModalRef, handleCloseModal);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    if (!ALLOWED_IMAGE_TYPES.includes(selectedFile.type)) {
      Swal.fire({
        icon: 'warning',
        title: '지원하지 않는 파일 형식입니다',
        text: 'JPG, JPEG, PNG, GIF 파일만 업로드할 수 있어요.',
        confirmButtonColor: '#3085d6',
        confirmButtonText: '확인'
      });
      event.target.value = '';
      return;
    }
    setFile(selectedFile);
  };

  const uploadImageToSupabase = async (file, userId) => {
    const fileName = `image_${userId}_${Date.now()}`;

    const { error: uploadError } = await supabase.storage.from('imagefile').upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage.from('imagefile').getPublicUrl(fileName);
    return publicUrlData.publicUrl;
  };

  const updateUserInfo = async ({ userId, nickname, introduce, imageUrl }) => {
    const updates = {
      username: nickname,
      introduce
    };
    if (imageUrl) updates.profile_image = imageUrl;

    const { error } = await supabase.from('Userinfo').update(updates).eq('id', userId);
    if (error) throw error;
  };

  const handleProfile = async () => {
    if (!userId) {
      console.error('유저 정보를 찾을 수 없습니다.');
      return;
    }
    Swal.fire({
      title: '업로드 중...',
      text: '잠시만 기다려주세요.',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    try {
      let publicUrl = null;
      if (file) {
        publicUrl = await uploadImageToSupabase(file, userId);
        setImage(publicUrl);
      }
      await updateUserInfo({
        userId,
        nickname: newNickname,
        introduce: newIntroduce,
        imageUrl: publicUrl
      });

      setNickname(newNickname);
      setIntroduce(newIntroduce);
      Swal.fire({
        icon: 'success',
        title: '변경 완료!',
        text: '정보가 성공적으로 수정되었어요.',
        confirmButtonColor: '#3085d6',
        confirmButtonText: '확인'
      });
      handleCloseModal();
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: 'error',
        title: '오류 발생',
        text: '다시 시도해주세요.',
        confirmButtonText: '확인'
      });
    } finally {
      Swal.close();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
      <div className={`h-auto rounded-lg bg-white w-2/3 md:w-auto`} ref={myModalRef}>
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
              maxLength={10}
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
                (introduce?.length || 0) > 0
                  ? '자기소개를 수정하세요 (최대 100자)'
                  : '자기소개를 추가하세요 (최대 100자)'
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
              className="px-5 py-2.5 rounded-md m-1.5 font-semibold border text-xs"
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
              onClick={handleCloseModal}
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
