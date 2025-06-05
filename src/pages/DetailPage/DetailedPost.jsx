import { getPost } from '@/api/postsListApi';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
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
import StatusBadge from '@/components/DetailPage/StatusBadge';
import MemberCardList from '@/components/DetailPage/MemberCardList';
import { fetchContractAlerts, usePlacesCount } from '@/zustand/placescount.store';
import { hasCreatorAlert, hasUserAlert } from '@/utils/alerts';
import NewBadge from '@/components/common/NewBadge';

const DetailedPost = () => {
  const { id } = useParams();
  const [openJoinModal, setOpenJoinModal] = useState(false);
  const [openCreateGroupModal, setCreateGroupModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('memberList');
  const currentUserId = useUserId(); //현재로그인한 사용자의 아이디
  const navigate = useNavigate();
  const creatorContractAlerts = usePlacesCount((state) => state.creatorContractAlerts);
  const userContractAlerts = usePlacesCount((state) => state.userContractAlerts);
  const removeCreatorAlert = usePlacesCount((state) => state.removeCreatorAlert);
  const removeUserAlert = usePlacesCount((state) => state.removeUserAlert);
  const removeNewPlace = usePlacesCount((state) => state.removeNewPlace);

  const isCreatorAlert = hasCreatorAlert(creatorContractAlerts, id, currentUserId);
  const isUserAlert = hasUserAlert(userContractAlerts, id, currentUserId);

  const queryClient = useQueryClient();
  //모임에 대한 정보 가져오기
  const {
    data: posts,
    isPending: isPostsLoading,
    isError: isPostsError
  } = useQuery({
    queryKey: ['posts', id],
    queryFn: () => getPost(id)
  });
  const postCreatorId = posts?.created_by;
  //모임장의 정보를 가져오기
  const userQuery = useQuery({
    queryKey: ['user', postCreatorId],
    queryFn: () => getUser(postCreatorId),
    enabled: !!postCreatorId
  });

  const userInfosQuery = useQuery({
    queryKey: ['userInfos', id],
    queryFn: async () => {
      const { data: contracts, error: contractsError } = await supabase
        .from('Contracts')
        .select('*')
        .eq('place_id', id);

      if (contractsError) throw new Error(contractsError.message);

      const userIds = contracts.map((m) => m.user_id);
      if (!userIds.length) return { approvedMembers: [], pendingMembers: [] };

      const { data: users, error: usersError } = await supabase.from('Userinfo').select('*').in('id', userIds);

      if (usersError) throw new Error(usersError.message);
      const userStatus = users.map((user) => {
        const match = contracts.find((c) => c.user_id === user.id);
        return { ...user, contract_created_at: match?.created_at || null, status: match?.status || 'unknown' };
      });

      return {
        approvedMembers: userStatus.filter((u) => u.status === 'approved'),
        pendingMembers: userStatus.filter((u) => u.status === 'pending')
      };
    },
    enabled: !!id,
    staleTime: 0,
    refetchOnWindowFocus: true
  });

  const detailQueries = useQueries({
    queries: [
      {
        queryKey: ['participantCount', id],
        queryFn: async () => {
          const { count, error } = await supabase
            .from('Contracts')
            .select('place_id', { count: 'exact', head: true })
            .eq('place_id', id)
            .eq('status', 'approved');
          if (error) throw new Error(error.message);
          return count || 0;
        },
        enabled: !!id
      },
      {
        queryKey: ['hasJoined', id, currentUserId],
        queryFn: async () => {
          const { data, error } = await supabase
            .from('Contracts')
            .select('*')
            .eq('place_id', id)
            .eq('user_id', currentUserId);
          if (error) throw new Error(error.message);
          return {
            isJoinedBoolean: data.length > 0,
            userRejected: data[0]?.status
          };
        },
        enabled: !!id && !!currentUserId
      }
    ]
  });

  const [participantCount = 0, isJoined] = detailQueries.map((q) => q.data ?? null);
  const [isCountPending, isJoinedPending] = detailQueries.map((q) => q.isPending);
  const [isCountError, isJoinedError] = detailQueries.map((q) => q.isError);
  const user = userQuery.data;
  const userInfos = userInfosQuery.data;

  //회원직접 가입
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
      await queryClient.invalidateQueries({ queryKey: ['member', id] });
      await queryClient.invalidateQueries({ queryKey: ['userInfos', id] });
      await queryClient.invalidateQueries({ queryKey: ['participantCount', id] });
      await queryClient.invalidateQueries({ queryKey: ['hasJoined', id, currentUserId] });

      setOpenJoinModal(false);
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

  const markCreatorAlertAsRead = async (placeId, postCreatorId, targetUserId) => {
    const { error } = await supabase
      .from('Viewed_contracts')
      .delete()
      .match({ user_id: postCreatorId, place_id: placeId, target_user_id: targetUserId });
    if (error) {
      console.error('읽음 처리 실패:', error.message);
      return;
    }
    await removeCreatorAlert(placeId, postCreatorId, targetUserId);
    await fetchContractAlerts(postCreatorId, usePlacesCount.setState);
  };

  const markUserAlertAsRead = async (userId, placeId) => {
    const { error } = await supabase
      .from('Viewed_contracts')
      .update({ read: true })
      .match({
        user_id: userId,
        place_id: placeId
      })
      .in('type', ['approved', 'rejected']);

    if (error) throw new Error('알림 상태 업데이트 실패: ' + error.message);

    // 알림 상태 최신화
    await removeUserAlert(placeId);
    await fetchContractAlerts(userId, usePlacesCount.setState);
  };
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

      const { error: contractError } = await supabase
        .from('Contracts')
        .delete()
        .match({ place_id: id, user_id: targetUserId });

      if (contractError) throw new Error(contractError.message);

      const { error: alertError } = await supabase.from('Viewed_contracts').delete().match({
        place_id: id,
        user_id: targetUserId
      });

      if (alertError) throw new Error(alertError.message);
    },
    onSuccess: async () => {
      queryClient.setQueryData(['hasJoined', id, currentUserId], (prevData) => ({
        ...prevData,
        isJoinedBoolean: false
      }));
      await queryClient.invalidateQueries({ queryKey: ['member', id] });
      await queryClient.invalidateQueries({ queryKey: ['userInfos', id] });
      await queryClient.invalidateQueries({ queryKey: ['participantCount', id] });
      await queryClient.invalidateQueries({ queryKey: ['hasJoined', id, currentUserId] });
      await markCreatorAlertAsRead(id, postCreatorId, currentUserId);
      await fetchContractAlerts(postCreatorId, usePlacesCount.setState);
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
    mutationFn: async (deletedId) => {
      const { error } = await supabase.from('Places').delete().eq('id', deletedId);
      if (error) throw new Error(error.message);
      return deletedId;
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries(['places']); // 현재 백그라운드에서 데이터를 가져오는중이면 충돌방지하기위해 일단 취소

      const previousPlaces = queryClient.getQueryData(['places']); //롤백용으로 잠시 저장해둔다.

      // 삭제된 항목을 캐시에서 즉시 제거한다.
      queryClient.setQueryData({ predicate: (query) => query.queryKey[0] === 'places' }, (old) => {
        if (!old) return [];
        return old.filter((place) => place.id !== deletedId);
      });

      return { previousPlaces }; //롤백용을 반환해서 오류날때 되돌리면된다.
    },
    onSuccess: () => {
      Swal.fire({
        icon: 'success',
        title: '삭제 완료',
        text: '모임삭제 했습니다.',
        confirmButtonText: '확인'
      });
    },
    onError: (error, _, context) => {
      //mutationFn에 발생한 에러,mutationFn에 전달된 변수, onMutate에 반환한 값 즉 previousPlaces임
      console.log(context);
      if (context?.previousPlaces) {
        queryClient.setQueryData(['places'], context.previousPlaces);
      }
      Swal.fire({
        icon: 'error',
        title: '삭제 실패',
        text: '모임 삭제 중 오류가 발생했습니다.',
        confirmButtonText: '확인'
      });
      console.error('모임삭제 실패 => ', error);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === 'places'
      });
      navigate(-1);
    }
  });

  const updateMemberAlert = async ({ userId, placeId, creatorId, action }) => {
    // 1. 기존 'request' 알림 삭제
    const { error: deleteError } = await supabase.from('Viewed_contracts').delete().match({
      user_id: userId,
      place_id: placeId,
      target_user_id: creatorId
    });

    if (deleteError) throw new Error(deleteError.message);

    // 2. 새 알림 삽입 (approved 또는 rejected)
    const { error: insertError } = await supabase.from('Viewed_contracts').insert({
      user_id: userId,
      place_id: placeId,
      target_user_id: creatorId,
      type: action,
      read: false
    });

    if (insertError) throw new Error(insertError.message);
  };
  //멤버의 승인상태 업데이트하는 뮤테이션
  const memberActionMutation = useMutation({
    mutationFn: async ({ userId, action }) => {
      if (!userId) throw new Error('유저 정보가 없습니다.');

      const { error: contractError } = await supabase
        .from('Contracts')
        .update({ status: action }) // approved 또는 rejected
        .eq('place_id', id)
        .eq('user_id', userId);

      if (contractError) throw new Error(contractError.message);
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['member', id] });
      await queryClient.invalidateQueries({ queryKey: ['userInfos', id] });
      await queryClient.refetchQueries({ queryKey: ['userInfos', id] });
      await queryClient.invalidateQueries({ queryKey: ['participantCount', id] });
      await queryClient.invalidateQueries({ queryKey: ['hasJoined', id, currentUserId] });

      try {
        await updateMemberAlert({
          userId: variables.userId,
          placeId: id,
          creatorId: currentUserId,
          action: variables.action
        });
        await fetchContractAlerts(variables.userId, usePlacesCount.setState);
      } catch (err) {
        console.warn('알림 처리 실패:', err.message); // 실패해도 핵심 로직은 영향 안 줌
      }

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
  // 모임장이 멤버 가입 승인/거절 하기
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
        deletePost.mutate(id);
      }
    });
  }, [deletePost]);
  //멤버가 모임에 가입 또는 취소하기
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
  const isPending = isPostsLoading || isCountPending;
  const isError = isPostsError || isJoinedError || isCountError;
  const today = dayjs();
  const daysLeft = useMemo(() => {
    if (!posts?.deadline) return '정보 없음';
    const diff = dayjs(posts.deadline).diff(today, 'day');
    if (diff < 0) return '마감';
    return `${diff + 1}일전`;
  }, [posts?.deadline]);

  const postDetails = useMemo(
    () => [
      // { icon: <BiSolidZap />, label: '모임명', value: posts?.gather_name || '정보 없음' },
      { icon: <BiDumbbell />, label: '스포츠명', value: posts?.sports_name || '정보 없음' },

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
      { icon: <BiSolidUserCheck />, label: '조건', value: posts?.isReviewed ? '가입승인 필요' : '아무나 가입가능' },
      { icon: <BiSolidBeenHere />, label: '주소', value: posts?.region || '정보 없음' }
    ],
    [posts, daysLeft, participantCount, userInfos]
  );
  // supabase realtime 멤버가입탈퇴 실시간 보기
  useEffect(() => {
    const channel = supabase
      .channel('contracts-events')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE 전부포함해버리기
          schema: 'public',
          table: 'Contracts'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['member', id] });
          queryClient.invalidateQueries({ queryKey: ['userInfos', id] });
          queryClient.invalidateQueries({ queryKey: ['participantCount', id] });
          queryClient.invalidateQueries({ queryKey: ['hasJoined', id, currentUserId] });
          queryClient.invalidateQueries({ queryKey: ['participantCount', id] });
          queryClient.invalidateQueries({ queryKey: ['user', postCreatorId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const markPlaceAsViewed = async (placeId) => {
    if (!currentUserId) return;

    const { error } = await supabase
      .from('Viewed_places')
      .upsert({ user_id: currentUserId, viewed_id: placeId }, { onConflict: ['user_id', 'viewed_id'] });

    if (error) {
      console.error('Viewed_places 업서트 오류:', error.message);
      return;
    }
    if (!error) removeNewPlace(placeId);
  };
  useEffect(() => {
    if (id && currentUserId) markPlaceAsViewed(id);
  }, [id, currentUserId]);

  const postDescription = postDetails.find((d) => d.label === '모임설명');

  if (isPending) {
    return <Loading />;
  }
  if (isError) {
    return <Error message="모임 정보를 가져오는데 실패했습니다." />;
  }

  return (
    <>
      <div className="w-[calc(100% - 16rem)] md:w-[80%] min-[320px]:w-[80%] lg:w-[80%] lg:mx-auto lg:ml-[150px]  md:ml-[120px] md:mx-0px auto; sm:w-[80%] sm:mx-auto sm:ml-[110px] flex flex-col gap-5 box-border h-[120dvh]">
        <div className="flex justify-between items-center w-full sticky top-0 z-30 bg-white py-5 box-border">
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
              <StatusBadge status={isJoined?.userRejected} />

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          {/* 모임장 정보 */}
          <div className="rounded-md border-none flex flex-row gap-4 items-center bg-[#EBF7FF] p-4 box-border flex-wrap">
            <img src={user?.profile_image || '/Ellipse1.png'} alt="기본" className="w-[50px] h-[50px] rounded-full" />
            <div className="flex mx-2 items-left flex-col text-left">
              <p className="text-xs">모임장 : {user?.username}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
            <div className="flex-grow w-full">
              <p className="text-xs line-clamp-3 break-words overflow-hidden">{user?.introduce}</p>
            </div>
          </div>
          {/*모임정보 뱃지*/}
          <ul className="flex flex-wrap gap-2 justify-start">
            {postDetails.map((detail, index) =>
              detail.label !== '모임설명' ? (
                <li
                  key={index}
                  className="bg-[#F5F5F5] text-xs px-3 py-1 rounded-full text-center flex items-center gap-2"
                >
                  <div className="text-base">{detail.icon}</div>
                  <p>{detail.value}</p>
                </li>
              ) : null
            )}
          </ul>
        </div>
        {/* 모임설명 */}
        {postDescription && (
          <div className="w-full bg-[#FFF9DB] rounded-md p-4 text-sm">
            <div className="flex gap-2 items-center mb-2 text-base font-semibold">
              <div className="text-xl">{postDescription.icon}</div>
              <p>모임 설명</p>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{postDescription.value}</p>
          </div>
        )}
        {/* 모임 탭 */}
        <div className="flex mb-5 box-border w-full relative">
          <button
            className={`flex items-center justify-center gap-1 px-5 py-2 w-1/2 text-sm font-bold transition-all border-b-2 ${
              activeTab === 'memberList'
                ? 'border-blue-500 text-blue-500 bg-customBackground rounded-t-xl'
                : 'text-gray-400'
            }`}
            onClick={() => setActiveTab('memberList')}
          >
            {isUserAlert && <NewBadge />}
            <AiFillThunderbolt />
            <p>가입된 멤버</p>
          </button>

          <button
            className={`flex items-center justify-center gap-1 px-5 py-2 w-1/2 text-sm font-bold transition-all border-b-2 ${
              activeTab === 'pendingList'
                ? 'border-blue-500 text-blue-500 bg-customBackground rounded-t-xl'
                : 'text-gray-400'
            } ${currentUserId !== postCreatorId ? 'cursor-not-allowed opacity-50' : ''}`}
            onClick={() => {
              if (currentUserId === postCreatorId) {
                setActiveTab('pendingList');
              }
            }}
            disabled={currentUserId !== postCreatorId}
          >
            {isCreatorAlert && <NewBadge />}
            <AiOutlineThunderbolt />
            <p>멤버승인 요청</p>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden pb-24">
          {/* 가입된 멤버 리스트 */}
          {activeTab === 'memberList' && (
            <MemberCardList
              members={userInfos?.approvedMembers}
              type="approved"
              currentUserId={currentUserId}
              postCreatorId={postCreatorId}
              onAction={handleMemberAction}
              markCreatorAlertAsRead={markCreatorAlertAsRead}
              markUserAlertAsRead={markUserAlertAsRead}
              hasAlert={isUserAlert}
              placeId={id}
            />
          )}
          {/* 가입 승인요청 멤버 리스트 */}
          {activeTab === 'pendingList' && (
            <MemberCardList
              members={userInfos?.pendingMembers}
              type="pending"
              currentUserId={currentUserId}
              postCreatorId={postCreatorId}
              onAction={handleMemberAction}
              markCreatorAlertAsRead={markCreatorAlertAsRead}
              hasAlert={isCreatorAlert}
              placeId={id}
            />
          )}
        </div>
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
