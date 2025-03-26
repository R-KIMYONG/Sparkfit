import { useUserStore } from '@/zustand/auth.store';
import { useEffect, useRef, useState } from 'react';
import { MdOutlineEmail } from 'react-icons/md';
import { RiLockPasswordLine } from 'react-icons/ri';
import { Link, useNavigate } from 'react-router-dom';
import { PiUserCircleLight } from 'react-icons/pi';
import Swal from 'sweetalert2';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const emailInputRef = useRef(null);
  const navigate = useNavigate();
  const signIn = useUserStore((state) => state.signIn);

  const handleSignIn = async (event) => {
    event.preventDefault();
    if (!email || !password) {
      Swal.fire({
        icon: 'error',
        title: '이메일 또는 비밀번호를 입력하지않았습니다!',
        text: '로그인 할 수 없습니다'
      });
      return;
    }
    try {
      await signIn(email, password);

      Swal.fire({
        title: '로그인 완료!',
        icon: 'success'
      });
      setPassword('');
      setEmail('');
      navigate('/main');
    } catch (error) {
      const errorMessage = error.message || '알 수 없는 오류 발생';
      Swal.fire({
        icon: 'error',
        title: '로그인 실패',
        text: errorMessage.includes('Invalid login credentials')
          ? '잘못된 이메일과 비밀번호를 입력했습니다.'
          : '알 수 없는 에러입니다. 다시 시도해주세요.'
      });
    }
  };
  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  const loginInputFields = [
    {
      name: 'email',
      type: 'text',
      placeholder: 'email',
      value: email,
      onChange: (e) => setEmail(e.target.value),
      Icon: MdOutlineEmail,
      ref: emailInputRef
    },
    {
      name: 'password',
      type: 'password',
      placeholder: 'password',
      value: password,
      onChange: (e) => setPassword(e.target.value),
      Icon: RiLockPasswordLine
    }
  ];

  return (
    <div className="flex justify-center items-center h-[100dvh] bg-customBackground">
      <form
        onSubmit={handleSignIn}
        className="flex flex-col justify-center items-center my-0 mx-auto w-auto gap-5 text-base bg-white bg-opacity-70 p-8 rounded-lg shadow-lg relative pt-20"
      >
        <div className="absolute -top-8 bg-white shadow-lg rounded-full overflow-hidden">
          <PiUserCircleLight className="text-6xl" />
        </div>
        {loginInputFields.map(({ name, type, placeholder, value, onChange, Icon, ref }) => {
          return (
            <div key={name} className="flex w-full items-center border bg-white rounded-full gap-3 py-1 px-6">
              <Icon className="text-xl" />
              <input
                className="w-full border-none text-xs px-1.5 py-2 focus:outline-none placeholder:text-xs"
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                ref={name === 'email' ? ref : undefined}
              />
            </div>
          );
        })}
        <button className="flex justify-center items-center w-full text-sm rounded-full bg-customLoginButton text-white mt-2 p-1.5 cursor-pointer">
          로그인
        </button>
        <div className="flex justify-evenly w-full text-xs">
          <p className="text-slate-400">* 아직 회원이 아니신가요?</p>
          <Link to="/terms">
            <p className="underline underline-offset-4">회원가입</p>
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
