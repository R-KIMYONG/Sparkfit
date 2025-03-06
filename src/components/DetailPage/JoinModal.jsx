import { getPost } from '@/api/postsListApi';
import { checkIfUserHasJoined, loginUser } from '@/api/profileApi';
import supabase from '@/supabase/supabaseClient';
import { useQuery } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import AlertModal from './AlertModal';
import useOutsideClick from './useOutsideClick';
import Swal from 'sweetalert2';

const JoinModal = ({ close }) => {
  const { id } = useParams();
  const modalRef = useRef(null);
  const [openAlertModal, setOpenAlertModal] = useState(false);
  const { data: posts } = useQuery({ queryKey: ['posts', id], queryFn: () => getPost(id) });
  const { data: user } = useQuery({ queryKey: ['user'], queryFn: loginUser });
  const { data: hasJoined } = useQuery({
    queryKey: ['checkUser', id, user?.id],
    queryFn: () => checkIfUserHasJoined(id, user?.id),
    enabled: !!user && !!id
  });

  const handleClose = () => {
    close?.();
  };

  useOutsideClick(modalRef, handleClose);

  const joinGroup = async () => {
    if (posts.created_by === user.id) {
      Swal.fire({
        icon: 'warning',
        title: '가입불가',
        text: '본인이 만든 모임에 참가 시청할 수 없습니다.',
        confirmButtonText: '확인'
      }).then(() => close());
      return;
    }

    if (hasJoined) {
      Swal.fire({
        icon: 'error',
        title: '이미 신청됨',
        text: '두 번 신청할 수 없습니다.',
        confirmButtonText: '확인'
      }).then(() => close());
      return;
    }
    const { data, error } = await supabase
      .from('Contracts')
      .insert([{ gather_name: posts.gather_name, place_id: posts.id, user_id: user.id }])
      .select();

    if (error) {
      console.error(error.message);
      Swal.fire({
        icon: 'error',
        title: '신청 실패',
        text: '신청 중 오류가 발생했습니다.',
        confirmButtonText: '확인'
      });
      return;
    }
    Swal.fire({
      icon: 'success',
      title: '신청 완료',
      text: '모임 신청이 완료되었습니다!',
      confirmButtonText: '확인'
    }).then(() => {
      setOpenAlertModal(false);
      close();
    });
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-black bg-opacity-10 z-50">
      <div
        className="h-auto rounded-lg min-[320px]:w-[80%] md:w-[50%] sm:w-[60%] bg-white absolute top-[10%] left-1/2 transform -translate-x-1/2 - translate-y-1/2"
        ref={modalRef}
      >
        <div className="py-5">
          <div className="m-2 flex justify-center items-center flex-col">
            <p className="p-5 bg-[#EBF7FF] rounded-full text-2xl mb-5">🎉</p>
            <h3 className="flex text-2xl mb-2">모임 가입</h3>
            <h1 className="flex">버튼 클릭시 즉시 신청됩니다</h1>
          </div>

          <div className="flex justify-center items-center my-3">
            <button
              className="hover:bg-[#6FA3D4] transition-all duration-300 ease-in-out text-base px-10 py-2 border-none bg-btn-blue rounded-md text-white m-1.5 font-semibold cursor-pointer "
              type="button"
              onClick={joinGroup}
            >
              신청
            </button>

            <button
              className="hover:bg-[#ddd] transition-all duration-300 ease-in-out text-base px-10 py-2 border-none bg-[#efefef] rounded-md text-[#2e2e2e] m-1.5 font-semibold cursor-pointer "
              type="button"
              onClick={close}
            >
              닫기
            </button>
            {openAlertModal && <AlertModal close={close} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinModal;
