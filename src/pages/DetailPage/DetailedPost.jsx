import { getPost } from '@/api/postsListApi';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import CreateGroupModal from '../../components/DetailPage/CreateGroupModal';
import JoinModal from '../../components/DetailPage/JoinModal';
import { getUser } from '@/api/profileApi';

const DetailedPost = () => {
  const { id } = useParams();
  const [openJoinModal, setOpenJoinModal] = useState(false);
  const [openCreateGroupModal, setCreateGroupModal] = useState(false);

  const { data: posts, isPending, isError } = useQuery({ queryKey: ['posts', id], queryFn: () => getPost(id) });
  const userId = posts?.created_by;
  const { data: user } = useQuery({ queryKey: ['user', userId], queryFn: () => getUser(userId), enabled: !!userId });

  if (isPending) {
    return <div>로딩중</div>;
  }
  if (isError) {
    return <div>오류 발생</div>;
  }

  return (
    <>
      <div className="w-[1280px] mt-[5%] auto md:w-[80%] min-[320px]:w-[80%] lg:w-[80%] lg:mx-auto lg:ml-[150px]  md:ml-[130px] md:mx-0px auto; sm:w-[80%] sm:mx-auto sm:ml-[110px] ">
        <div className="flex justify-between items-center w-full">
          <div className="text-3xl font-bold mb-2">{posts?.gather_name}</div>
          <button
            onClick={() => {
              setOpenJoinModal(true);
            }}
            className="bg-btn-blue border border-none rounded-md text-white font-bold px-[20px] py-[10px] text-sm shadow-xl shadow-[#C9E5FF] hover:bg-[#6FA3D4] transition-all duration-300 ease-in-out"
          >
            가입하기
          </button>
          {openJoinModal && (
            <JoinModal
              close={() => {
                setOpenJoinModal(false);
              }}
            />
          )}
        </div>

        <div className="flex gap-3 items-center my-5">
          <span className="bg-[#F1F1F1] rounded-full px-5 py-1.5 text-xs">{posts?.region}</span>
          <span className="bg-[#F1F1F1] rounded-full px-5 py-1.5 text-xs">{posts?.sports_name}</span>
          <span className="bg-[#F1F1F1] rounded-full px-5 py-1.5 text-xs">{posts?.deadline}</span>
        </div>

        <div className=" rounded-full border-none flex flex-row items-center mb-2 bg-[#EBF7FF] p-3 box-border">
          <img src={user?.profile_image || '/Ellipse1.png'} alt="기본" className="w-[50px] h-[50px]" />
          <div className="flex flex-col mx-2 ">
            <div className="text-xs mr-2">모임장 : {user?.username}</div>
            <div className="text-xl">{user?.nickname}</div>
          </div>
        </div>

        <div className="text-start my-4 bg-[#F1F1F1] rounded-md p-3 text-xs">{`모임명 : ${posts.gather_name}`}</div>
        <div className="text-start my-4 bg-[#F1F1F1] rounded-md p-3 text-xs">{`모임설명 : ${posts.texts}`}</div>
        <div className="text-start my-4 bg-[#F1F1F1] rounded-md p-3 text-xs">{`스포츠명 : ${posts.sports_name}`}</div>
        <div className="text-start my-4 bg-[#F1F1F1] rounded-md p-3 text-xs">{`마감기한 : ${posts.deadline}`}</div>
      </div>
      {/* <button className="text-5xl flex justify-center" onClick={() => setCreateGroupModal(true)}>
        test
      </button> */}
      {openCreateGroupModal && (
        <CreateGroupModal
          close={() => {
            setCreateGroupModal(false);
          }}
        />
      )}
    </>
  );
};

export default DetailedPost;
