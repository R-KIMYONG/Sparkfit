import { getPost } from '@/api/postsListApi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CreateGroupModal from '../../components/DetailPage/CreateGroupModal';
import JoinModal from '../../components/DetailPage/JoinModal';
import { getUser } from '@/api/profileApi';
import supabase from '@/supabase/supabaseClient';
import Swal from 'sweetalert2';
import EditPostModal from './EditPostModal';
import { PiClockCountdownFill } from 'react-icons/pi';
import {
  BiSolidZap,
  BiDumbbell,
  BiSolidBeenHere,
  BiSolidAlarm,
  BiSolidGroup,
  BiBookReader,
  BiSolidUserCheck
} from 'react-icons/bi';
import { RiPassPendingFill } from 'react-icons/ri';
import { AiFillThunderbolt, AiOutlineThunderbolt } from 'react-icons/ai';
import Loading from '@/components/common/Loading';
import Error from '@/components/common/Error';
import dayjs from 'dayjs';
import useUserId from '@/hooks/useUserId';

const DetailedPost = () => {
  const { id } = useParams();
  const [openJoinModal, setOpenJoinModal] = useState(false);
  const [openCreateGroupModal, setCreateGroupModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('memberList');
  const currentUserId = useUserId();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    data: posts,
    isPending: isPostsLoading,
    isError: isPostsError,
    refetch: postsRefetch
  } = useQuery({
    queryKey: ['posts', id],
    queryFn: () => getPost(id),
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 3
  });
  const postCreatorId = posts?.created_by;
  const { data: user } = useQuery({
    queryKey: ['user', postCreatorId],
    queryFn: () => getUser(postCreatorId),
    enabled: !!postCreatorId
  });

  const { data: participantCount = 0, isPending: isCountLoading } = useQuery({
    queryKey: ['participantCount', id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('Contracts')
        .select('place_id', { count: 'exact', head: true })
        .eq('place_id', id)
        .eq('status', 'approved');

      if (error) {
        throw new Error(error.message);
      }
      return count || 0;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 3
  });

  const {
    data: isJoined,
    isPending: isJoinedPending,
    refetch: isJoinedRefetch
  } = useQuery({
    queryKey: ['hasJoined', id, currentUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Contracts')
        .select('*')
        .eq('place_id', id)
        .eq('user_id', currentUserId);
      if (error) throw new Error(error.message);

      const userRejected = data[0].status;
      const isJoinedBoolean = data.length > 0;

      return { isJoinedBoolean, userRejected };
    },
    enabled: !!id && !!currentUserId,
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 3
  });
  const {
    data: member,
    isPending: isMemberLoading,
    isError: isMemberError,
    refetch: memberRefetch
  } = useQuery({
    queryKey: ['member', id],
    queryFn: async () => {
      if (!posts?.id) return [];
      const { data, error } = await supabase.from('Contracts').select('*').eq('place_id', posts.id);
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!posts?.id,
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 3
  });
  const {
    data: userInfos,
    isPending: isUserInfosLoading,
    isError: isUserInfosError,
    refetch: userInfosRefetch
  } = useQuery({
    queryKey: ['userInfos', id],
    queryFn: async () => {
      const userIds = member.map((m) => m.user_id);
      const { data, error } = await supabase.from('Userinfo').select('*').in('id', userIds);
      const userStatus = data.map((user) => {
        const memberData = member.find((m) => m.user_id === user.id);
        return {
          ...user,
          status: memberData?.status || 'unknown'
        };
      });

      const approvedMembers = userStatus.filter((user) => user.status === 'approved');
      const pendingMembers = userStatus.filter((user) => user.status === 'pending');

      if (error) throw new Error(error.message);
      return { approvedMembers, pendingMembers };
    },
    enabled: !isMemberLoading && member?.length > 0,
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 3
  });
  //가입
  const joinMutation = useMutation({
    mutationFn: async () => {
      if (!currentUserId) throw new Error('유저 정보가 없습니다.');
      if (posts?.isReviewed) {
        const { error: pendingError } = await supabase
          .from('Contracts')
          .insert([{ place_id: id, user_id: currentUserId, gather_name: posts.gather_name, status: 'pending' }]);
        if (pendingError) throw new Error(pendingError.message);
      } else {
        const { error: approvedError } = await supabase
          .from('Contracts')
          .insert([{ place_id: id, user_id: currentUserId, gather_name: posts.gather_name, status: 'approved' }]);
        if (approvedError) throw new Error(pendingError.message);
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['member', posts?.id] });
      await memberRefetch();
      await userInfosRefetch();
      await queryClient.invalidateQueries({ queryKey: ['userInfos', id] });
      await queryClient.refetchQueries({ queryKey: ['userInfos', id] });
      await queryClient.invalidateQueries({ queryKey: ['participantCount', id] });
      await queryClient.invalidateQueries({ queryKey: ['hasJoined', id] });

      setOpenJoinModal(false);
      console.log(posts.isReviewed);
      const swalOptions = posts?.isReviewed
        ? {
            icon: 'success',
            title: '가입 신청완료',
            text: '모임가입 신청되었습니다!',
            confirmButtonText: '확인',
            cancelButtonText: '취소'
          }
        : {
            icon: 'success',
            title: '가입 완료',
            confirmButtonText: '확인',
            cancelButtonText: '취소'
          };

      Swal.fire(swalOptions);
    },
    onError: (error) => {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: '가입 실패',
        text: '가입 중 오류가 발생했습니다.',
        confirmButtonText: '확인'
      });
    }
  });
  //회원직접 탈퇴
  const leaveMutation = useMutation({
    mutationFn: async (targetUserId) => {
      if (!currentUserId) throw new Error('유저 정보가 없습니다.');
      Swal.fire({
        title: '가입 취소 진행 중...',
        text: '잠시만 기다려 주세요.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const { error } = await supabase.from('Contracts').delete().match({ place_id: id, user_id: targetUserId });

      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      queryClient.setQueryData(['hasJoined', id, currentUserId], (prevData) => ({
        ...prevData,
        isJoinedBoolean: false
      }));
      await isJoinedRefetch();
      await queryClient.invalidateQueries({ queryKey: ['member', posts?.id] });
      await memberRefetch();
      await userInfosRefetch();
      await queryClient.invalidateQueries({ queryKey: ['userInfos', id] });
      await queryClient.refetchQueries({ queryKey: ['userInfos', id] });
      await queryClient.invalidateQueries({ queryKey: ['participantCount', id] });
      await queryClient.invalidateQueries({ queryKey: ['hasJoined', id] });
      Swal.fire({
        icon: 'success',
        title: '취소 완료',
        text: '모임 참여 취소되었습니다!',
        confirmButtonText: '확인'
      });
    },
    onError: () => {
      Swal.fire({
        icon: 'error',
        title: '취소 실패',
        text: '취소 중 오류가 발생했습니다.',
        confirmButtonText: '확인'
      });
    }
  });

  //모임 삭제
  const deletePost = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.from('Places').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      Swal.fire({
        icon: 'success',
        title: '삭제 완료',
        text: '모임삭제 했습니다.',
        confirmButtonText: '확인'
      }).then(() => {
        queryClient.invalidateQueries({ queryKey: ['places'] });
        navigate('/main');
      });
    },
    onError: (error) => {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: '삭제 실패',
        text: '모임 삭제 중 오류가 발생했습니다.',
        confirmButtonText: '확인'
      });
    }
  });

  const memberActionMutation = useMutation({
    mutationFn: async ({ userId, action }) => {
      if (!userId) throw new Error('유저 정보가 없습니다.');

      if (action === 'approved') {
        // 승인 로직
        const { error } = await supabase
          .from('Contracts')
          .update({ status: 'approved' })
          .eq('place_id', id)
          .eq('user_id', userId);

        if (error) throw new Error(error.message);
      } else if (action === 'rejected') {
        // 거절 로직
        const { error } = await supabase
          .from('Contracts')
          .update({ status: 'rejected' })
          .eq('place_id', id)
          .eq('user_id', userId);

        if (error) throw new Error(error.message);
      }
    },
    onSuccess: async (_, variables) => {
      // 필요한 모든 쿼리 무효화 및 데이터 새로고침
      await queryClient.invalidateQueries({ queryKey: ['member', posts?.id] });
      await memberRefetch();
      await isJoinedRefetch();
      await postsRefetch();
      await queryClient.invalidateQueries({ queryKey: ['userInfos', id] });
      await queryClient.refetchQueries({ queryKey: ['userInfos', id] });
      await queryClient.invalidateQueries({ queryKey: ['participantCount', id] });

      // 액션에 따른 다른 메시지 표시
      const actionText = variables.action === 'approved' ? '승인' : '거절';

      Swal.fire({
        icon: 'success',
        title: `${actionText} 완료`,
        text: variables.action === 'approved' ? '멤버를 성공적으로 승인했습니다!' : '가입 요청을 거절했습니다!',
        confirmButtonText: '확인'
      });
    },
    onError: (error, variables) => {
      console.error(error);
      const actionText = variables.action === 'approved' ? '승인' : '거절';

      Swal.fire({
        icon: 'error',
        title: `${actionText} 실패`,
        text: `${actionText} 중 오류가 발생했습니다.`,
        confirmButtonText: '확인'
      });
    }
  });
  // 멤버 승인 요청 리스트에서 승인 버튼 클릭 시
  const handleMemberAction = useCallback(
    (userId, action) => {
      memberActionMutation.mutate({ userId, action });
    },
    [memberActionMutation]
  );
  //모임삭제
  const handleDelete = useCallback(() => {
    Swal.fire({
      title: '모임 삭제',
      text: '정말로 이 모임을 삭제하시겠습니까?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: '삭제',
      cancelButtonText: '취소',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        deletePost.mutate();
      }
    });
  }, [deletePost]);

  const handleJoinOrLeave = useCallback(() => {
    if (currentUserId === postCreatorId) {
      Swal.fire({
        icon: 'error',
        title: '모임장은 가입할 수 없습니다.',
        text: '본인이 만든 모임에는 참가할 수 없습니다.',
        confirmButtonText: '확인'
      });
      return;
    }
    if (isJoined?.isJoinedBoolean) {
      leaveMutation.mutate(currentUserId);
    } else {
      setOpenJoinModal(true);
    }
  }, [currentUserId, postCreatorId, isJoined, leaveMutation, setOpenJoinModal]);

  useEffect(() => {
    if (isJoinedPending) {
      Swal.fire({
        title: '로딩 중...',
        text: '잠시만 기다려주세요.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
    } else {
      Swal.close();
    }
  }, [isJoinedPending]);
  const isLoading =
    isPostsLoading &&
    isMemberLoading &&
    isUserInfosLoading &&
    isCountLoading &&
    isJoinedPending &&
    currentUserId === null;
  const isError = isPostsError || isMemberError || isUserInfosError;
  const today = dayjs();
  const daysLeft = useMemo(() => {
    if (!posts?.deadline) return '정보 없음';
    const diff = dayjs(posts.deadline).diff(today, 'day');
    if (diff < 0) return '마감';
    return `${diff + 1}일전`;
  }, [posts?.deadline]);

  const postDetails = useMemo(
    () => [
      { icon: <BiSolidZap />, label: '모임명', value: posts?.gather_name || '정보 없음' },
      { icon: <BiDumbbell />, label: '스포츠명', value: posts?.sports_name || '정보 없음' },
      { icon: <BiSolidBeenHere />, label: '주소', value: posts?.region || '정보 없음' },
      { icon: <BiSolidAlarm />, label: '마감기한', value: posts?.deadline || '정보 없음' },
      {
        icon: <PiClockCountdownFill className={`${daysLeft === '마감' ? 'text-red-500' : 'text-blcak'}`} />,
        label: '남은일수',
        value: <span className={`${daysLeft === '마감' ? 'text-red-500' : 'text-blcak'}`}>{daysLeft}</span>
      },
      {
        icon: <BiSolidGroup />,
        label: '모집현황',
        value: posts?.max_participants ? `${participantCount} / ${posts.max_participants}` : '정보 없음'
      },
      {
        icon: <RiPassPendingFill />,
        label: '승인대기',
        value:
          userInfos?.pendingMembers.length > 0 ? `${userInfos?.pendingMembers.length}명 승인대기 중` : '승인대기 없음'
      },
      { icon: <BiBookReader />, label: '모임설명', value: posts?.texts || '정보 없음' },
      { icon: <BiSolidUserCheck />, label: '조건', value: posts?.isReviewed ? '가입승인 필요' : '아무나 가입가능' }
    ],
    [posts, daysLeft, participantCount, userInfos]
  );

  if (isPostsLoading) {
    return <Loading />;
  }
  if (isError) {
    return <Error message="모임 정보를 가져오는데 실패했습니다." />;
  }

  return (
    <>
      <div className="w-[1280px] mt-[2rem] md:w-[80%] min-[320px]:w-[80%] lg:w-[80%] lg:mx-auto lg:ml-[150px]  md:ml-[130px] md:mx-0px auto; sm:w-[80%] sm:mx-auto sm:ml-[110px] pb-[5rem]">
        <div className="flex justify-between items-center w-full">
          <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-orange-500 drop-shadow-sm tracking-tight animate-pulse">
            {posts?.gather_name}
          </div>
          {currentUserId === postCreatorId ? (
            <div className="flex gap-4">
              <button
                onClick={() => setOpenEditModal(true)}
                className={`border border-none rounded-md text-white font-bold px-[1rem] py-[0.5rem] text-sm shadow-xl shadow-[#C9E5FF] bg-btn-blue hover:bg-[#6FA3D4] transition-all duration-300 ease-in-out`}
              >
                수정
              </button>
              <button
                onClick={handleDelete}
                className={`border border-none rounded-md text-white font-bold px-[1rem] py-[0.5rem] text-sm shadow-xl shadow-[#C9E5FF] bg-btn-red hover:bg-red-600 transition-all duration-300 ease-in-out`}
              >
                삭제
              </button>
            </div>
          ) : participantCount === posts?.max_participants ? (
            <p className="text-red-500">모집 완료</p>
          ) : (
            <div className="flex items-center gap-2">
              <p>{isJoined?.userRejected === 'rejected' ? '❗️관리자로부터 가입거절됬습니다.' : ''}</p>
              <p className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                {posts?.isReviewed && isJoined?.isJoinedBoolean && '⏳ 승인 대기중'}
              </p>
              <button
                onClick={handleJoinOrLeave}
                className={`border border-none rounded-md text-white font-bold px-[1rem] py-[0.5rem] text-xs shadow-xl shadow-[#C9E5FF] ${
                  isJoined?.isJoinedBoolean ? 'bg-red-500 hover:bg-red-600' : 'bg-btn-blue hover:bg-[#6FA3D4]'
                } transition-all duration-300 ease-in-out`}
              >
                {isJoined?.isJoinedBoolean ? '가입취소' : '가입하기'}
              </button>
            </div>
          )}

          {openJoinModal && (
            <JoinModal
              close={() => {
                setOpenJoinModal(false);
              }}
              joinMutation={joinMutation}
            />
          )}
        </div>
        {/* 모임장 정보 */}
        <div className=" rounded-md border-none flex flex-row gap-4 items-center mb-2 bg-[#EBF7FF] px-8 py-5 box-border mt-[1.5rem] flex-wrap">
          <img src={user?.profile_image || '/Ellipse1.png'} alt="기본" className="w-[50px] h-[50px] rounded-full" />
          <div className="flex mx-2 items-center flex-col item-center text-center">
            <p className="text-xs">모임장 : {user?.username}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
          <div className="flex-grow w-full">
            <p className="text-xs line-clamp-3 break-words overflow-hidden">{user?.introduce}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          {postDetails.map((detail, index) =>
            detail.label !== '모임설명' ? (
              <div
                key={index}
                className="bg-[#F1F1F1] text-xs px-3 py-1 rounded-full text-center flex items-center gap-2"
              >
                <div className="text-base">{detail.icon}</div>
                <p>{detail.value}</p>
              </div>
            ) : null
          )}
        </div>
        {/* 모임설명 */}
        {postDetails
          .filter((detail) => detail.label === '모임설명')
          .map((detail, index) => (
            <div key={index} className="w-full bg-[#F1F1F1] rounded-md p-4 text-sm mt-4">
              <div className="text-xl mb-2">{detail.icon}</div>
              <p className="line-clamp-3 break-words overflow-hidden">{detail.value}</p>
            </div>
          ))}

        <div className="flex mb-5 box-border w-full mt-4">
          <button
            className={`px-5 py-2 w-1/2 text-sm font-bold transition-all border-b-2 ${
              activeTab === 'memberList'
                ? 'border-blue-500 text-blue-500 bg-customBackground rounded-t-xl'
                : 'text-gray-400'
            }`}
            onClick={() => setActiveTab('memberList')}
          >
            <AiFillThunderbolt className="inline-block mr-1" />
            가입된 멤버
          </button>
          {currentUserId === postCreatorId ? (
            <button
              className={`px-5 py-2 w-1/2 text-sm font-bold transition-all border-b-2 ${
                activeTab === 'pendingList'
                  ? ' border-blue-500 text-blue-500 bg-customBackground rounded-t-xl'
                  : 'text-gray-400'
              }`}
              onClick={() => setActiveTab('pendingList')}
            >
              <AiOutlineThunderbolt className="inline-block mr-1" />
              멤버승인 요청
            </button>
          ) : (
            ''
          )}
        </div>

        <ul className="grid grid-cols-[repeat(auto-fit,_minmax(15rem,_1fr))] gap-3">
          {userInfos && activeTab === 'memberList' && userInfos?.approvedMembers.length > 0 ? (
            userInfos?.approvedMembers?.map((info) => {
              const defaultAvatar = info.gender === 'male' ? '/Ellipse1.png' : '/Ellipse2.png';
              const avatarSrc = info.profile_image || defaultAvatar;
              return (
                <li
                  key={info.id}
                  className="border-b py-2 bg-[#EBF7FF] p-4 rounded-md flex flex-col min-w-[20%] max-w-full"
                >
                  <div className="flex justify-between items-center gap-3">
                    <div className="flex items-center gap-3">
                      <img src={avatarSrc} alt="프로필" className="w-10 h-10 rounded-full" />
                      <div>
                        <p className="text-sm font-semibold">{info.username}</p>
                        <p className="text-xs text-gray-500">{info.email}</p>
                        <p className="text-xs text-gray-500">성별 : {info.gender === 'male' ? '남' : '여'}</p>
                      </div>
                    </div>

                    {currentUserId === postCreatorId && (
                      <button
                        onClick={() => handleMemberAction(info.id, 'rejected')}
                        className="text-xs px-3 py-1.5 border-none bg-btn-red rounded-md text-white m-1.5 font-semibold cursor-pointer hover:bg-red-400 transition-all"
                      >
                        탈퇴
                      </button>
                    )}
                  </div>
                  <div className="mt-2 min-h-[4rem]">
                    <p className="text-xs">자기 소개</p>
                    <p className="text-xs break-all whitespace-pre-line w-full">
                      {info.introduce || '자기 소개글이 없습니다.'}
                    </p>
                  </div>
                </li>
              );
            })
          ) : activeTab === 'memberList' ? (
            <div className="w-full">
              <p className="text-center text-gray-500 py-4">가입된 멤버가 없습니다.</p>
            </div>
          ) : null}
        </ul>
        {activeTab === 'pendingList' && (
          <>
            {userInfos?.pendingMembers?.length > 0 ? (
              <ul className="grid grid-cols-[repeat(auto-fit,_minmax(15rem,_1fr))] gap-3">
                {userInfos.pendingMembers.map((info) => {
                  const defaultAvatar = info.gender === 'male' ? '/Ellipse1.png' : '/Ellipse2.png';
                  const avatarSrc = info.profile_image || defaultAvatar;
                  return (
                    <li
                      key={info.id}
                      className="border-b py-2 bg-[#EBF7FF] p-4 rounded-md flex flex-col min-w-[25%] max-w-full"
                    >
                      <div className="flex items-center gap-3">
                        <img src={avatarSrc} alt="프로필" className="w-10 h-10 rounded-full" />
                        <div>
                          <p className="text-sm font-semibold">{info.username}</p>
                          <p className="text-xs text-gray-500">{info.email}</p>
                          <p className="text-xs text-gray-500">성별 : {info.gender === 'male' ? '남' : '여'}</p>
                        </div>
                      </div>
                      <div className="flex items-center mt-2">
                        <button
                          onClick={() => handleMemberAction(info.id, 'approved')}
                          className="text-xs px-3 py-1.5 border-none bg-btn-blue rounded-md text-white m-1.5 font-semibold cursor-pointer hover:bg-blue-400 transition-all"
                        >
                          승인
                        </button>
                        <button
                          onClick={() => handleMemberAction(info.id, 'rejected')}
                          className="text-xs px-3 py-1.5 border-none bg-btn-red rounded-md text-white m-1.5 font-semibold cursor-pointer hover:bg-red-400 transition-all"
                        >
                          거절
                        </button>
                      </div>

                      <div className="mt-2 min-h-[4rem]">
                        <p className="text-xs">자기 소개</p>
                        <p className="text-xs break-all whitespace-pre-line w-full">
                          {info.introduce || '자기 소개글이 없습니다.'}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-center text-gray-500 py-4">승인요청 없습니다.</p>
            )}
          </>
        )}
      </div>

      {openCreateGroupModal && (
        <CreateGroupModal
          close={() => {
            setCreateGroupModal(false);
          }}
        />
      )}
      {openEditModal && (
        <EditPostModal
          close={() => setOpenEditModal(false)}
          post={posts}
          postId={id}
          participantCount={participantCount}
        />
      )}
    </>
  );
};

export default DetailedPost;
