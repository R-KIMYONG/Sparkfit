import { Link } from 'react-router-dom';
import MainLogo from '../../assets/MainLogo.png';
import { BiLogIn, BiUserPlus } from 'react-icons/bi';

const HomePage = () => {
  return (
    <div className="flex justify-center items-center bg-customBackground h-[100dvh]">
      <div className="flex flex-col justify-center items-center mx-auto gap-3 w-96">
        <img src={MainLogo} className="w-28 h-28 object-cover mb-8" />

        <div className="flex items-center gap-3">
          <div className="rounded-lg overflow-hidden shadow-xl transform transition-all duration-300 hover:scale-105">
            <Link
              to="/login"
              className="flex justify-center items-center text-sm font-medium rounded-lg bg-gray-800 text-white cursor-pointer w-32 h-12 transition-all duration-300 ease-in-out hover:bg-gray-600"
            >
              <p className="flex-grow text-center font-bold">로그인</p>
              <div className="border-l-2 border-white box-border w-10 flex justify-center items-center">
                <BiLogIn size={20} className="mr-1" />
              </div>
            </Link>
          </div>

          <div className="rounded-lg overflow-hidden shadow-xl transform transition-all duration-300 hover:scale-105">
            <Link
              to="/terms"
              className="flex justify-center items-center text-sm font-medium rounded-lg bg-indigo-700 text-white cursor-pointer w-32 h-12 transition-all duration-300 ease-in-out hover:bg-indigo-500"
            >
              <p className="flex-grow text-center font-bold">회원가입</p>
              <div className="border-l-2 border-white box-border w-10 flex justify-center items-center">
                <BiUserPlus size={20} className="mr-1" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
