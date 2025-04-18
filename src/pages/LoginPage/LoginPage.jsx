import { useUserStore } from '@/zustand/auth.store';
import { useEffect, useRef, useState } from 'react';
import { MdOutlineEmail } from 'react-icons/md';
import { RiLockPasswordLine } from 'react-icons/ri';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PiUserCircleLight } from 'react-icons/pi';
import { PiEye, PiEyeClosed } from 'react-icons/pi';
import Swal from 'sweetalert2';
import { Checkbox } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/16/solid';

const LoginPage = () => {
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(false);
  const location = useLocation();
  const receivedEmail = location.state?.email;
  const receivedPassword = location.state?.password;

  useEffect(() => {
    if (emailRef.current && receivedEmail) {
      emailRef.current.value = receivedEmail;
    }
    if (passwordRef.current && receivedPassword) {
      passwordRef.current.value = receivedPassword;
    }
  }, [receivedEmail, receivedPassword]);

  const navigate = useNavigate();
  const signIn = useUserStore((state) => state.signIn);

  const handleSignIn = async (event) => {
    event.preventDefault();
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
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
      if (rememberEmail) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      if (emailRef.current) emailRef.current.value = '';
      if (passwordRef.current) passwordRef.current.value = '';
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

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const loginInputFields = [
    {
      name: 'email',
      type: 'text',
      placeholder: 'email',
      Icon: MdOutlineEmail,
      ref: emailRef
    },
    {
      name: 'password',
      type: 'password',
      placeholder: 'password',
      Icon: RiLockPasswordLine,
      ref: passwordRef
    }
  ];

  useEffect(() => {
    const storedEmail = localStorage.getItem('rememberedEmail');
    if (storedEmail && emailRef.current) {
      emailRef.current.value = storedEmail;
      setRememberEmail(true);
    }

    if (emailRef.current) emailRef.current.focus();
  }, []);

  return (
    <div className="flex justify-center items-center h-[100dvh] bg-customBackground">
      <form
        onSubmit={handleSignIn}
        className="flex flex-col justify-center items-center my-0 mx-auto w-auto gap-5 text-base bg-white bg-opacity-70 p-8 rounded-lg shadow-lg relative pt-20"
      >
        <div className="absolute -top-8 bg-white shadow-lg rounded-full overflow-hidden">
          <PiUserCircleLight className="text-6xl" />
        </div>
        {loginInputFields.map(({ name, type, placeholder, Icon, ref }) => {
          const isPassword = name === 'password';

          return (
            <div key={name} className="flex w-full items-center border bg-white rounded-full gap-3 py-1 px-6 relative">
              <Icon className="text-xl" />
              <input
                className="w-full border-none text-xs px-1.5 py-2 focus:outline-none placeholder:text-xs"
                type={isPassword ? (showPassword ? 'text' : 'password') : type}
                placeholder={placeholder}
                ref={ref}
              />
              {isPassword && (
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-4 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <PiEye size={15} className="text-xl" />
                  ) : (
                    <PiEyeClosed size={15} className="text-xl" />
                  )}
                </button>
              )}
            </div>
          );
        })}

        <div className="flex items-center w-full text-xs gap-2 px-2">
          <Checkbox
            checked={rememberEmail}
            onChange={setRememberEmail}
            className="group size-4 rounded-md bg-gray-100 ring-1 ring-gray-400 ring-inset
             data-[checked]:bg-blue-500 hover:ring-gray-600 transition-colors duration-150 relative"
          >
            <CheckIcon className="hidden size-3 text-white group-data-[checked]:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
          </Checkbox>
          <label htmlFor="rememberEmail" className="text-gray-700 cursor-pointer">
            로그인 ID 기억하기
          </label>
        </div>

        <button className="flex justify-center items-center w-full text-sm rounded-full bg-customLoginButton text-white p-1.5 cursor-pointer">
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
