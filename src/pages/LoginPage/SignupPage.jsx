import { useValidation } from '@/hooks/useValidation';
import { useUserStore } from '@/zustand/auth.store';
import { useEffect, useRef, useState } from 'react';
import { MdOutlineEmail } from 'react-icons/md';
import { RiLockPasswordLine, RiUser3Line, RiLockPasswordFill } from 'react-icons/ri';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getUserErrorMessage } from './getUserErrorMessage';
import { BsGenderAmbiguous } from 'react-icons/bs';
import { PiUserCirclePlus, PiEye, PiEyeClosed } from 'react-icons/pi';
const SignupPage = () => {
  const nicknameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);
  const genderRef = useRef(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const signUp = useUserStore((state) => state.signUp);
  const navigate = useNavigate();
  const { emailError, pwError, nicknameError, confirmPasswordError, genderError, validateAll } = useValidation();

  const handleSignUp = async (event) => {
    event.preventDefault();
    const nickname = nicknameRef.current?.value;
    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;
    const confirmPassword = confirmPasswordRef.current?.value;
    const gender = genderRef.current?.querySelector('input:checked')?.value;

    const errors = {};

    if (!email) errors.email = '이메일을 입력해주세요.';
    if (!password) errors.password = '비밀번호를 입력해주세요.';
    if (!confirmPassword) errors.confirmPassword = '비밀번화확인 입력해주세요';
    if (!nickname) errors.nickname = '닉네임을 입력해주세요.';
    if (!gender) errors.gender = '성별을 선택해주세요.';

    const isValid = validateAll({ email, password, confirmPassword, nickname, gender });

    if (Object.keys(errors).length === 1) {
      const errorMessage = Object.values(errors)[0];
      Swal.fire({
        icon: 'error',
        title: '입력값을 다시 확인해주세요',
        text: errorMessage
      });
      return;
    }

    // 오류가 두 개 이상일 경우
    if (Object.keys(errors).length > 1 || !isValid) {
      Swal.fire({
        icon: 'error',
        title: '입력값을 다시 확인해주세요',
        text: '입력하지 않은 항목이 있거나 형식이 맞지 않습니다.'
      });
      return;
    }

    try {
      await signUp(email, password, nickname, gender);

      if (nicknameRef.current) nicknameRef.current.value = '';
      if (emailRef.current) emailRef.current.value = '';
      if (passwordRef.current) passwordRef.current.value = '';
      if (confirmPasswordRef.current) confirmPasswordRef.current.value = '';

      const checkedGender = genderRef.current?.querySelector('input:checked');
      if (checkedGender) checkedGender.checked = false;

      Swal.fire({
        title: '회원가입 완료!',
        text: '로그인을 해주세요',
        icon: 'success'
      });
      navigate('/login', {
        state: {
          email,
          password
        }
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: '로그인 실패',
        text: getUserErrorMessage(error)
      });
    }
  };

  const inputFields = [
    {
      name: 'nickname',
      type: 'text',
      placeholder: 'nickname',
      ref: nicknameRef,
      Icon: RiUser3Line,
      error: nicknameError
    },
    {
      name: 'email',
      type: 'email',
      placeholder: 'email',
      ref: emailRef,
      Icon: MdOutlineEmail,
      error: emailError
    },
    {
      name: 'password',
      type: 'password',
      placeholder: 'password',
      ref: passwordRef,
      Icon: RiLockPasswordLine,
      error: pwError
    },
    {
      name: 'confirmPassword',
      type: 'password',
      placeholder: 'Confirm password',
      ref: confirmPasswordRef,
      Icon: RiLockPasswordFill,
      error: confirmPasswordError
    },
    {
      name: 'gender',
      type: 'radio',
      ref: genderRef,
      Icon: BsGenderAmbiguous,
      error: genderError
    }
  ];

  useEffect(() => {
    if (nicknameRef.current) nicknameRef.current.focus();
  }, []);

  return (
    <div className="flex justify-center items-center h-[100dvh] bg-customBackground">
      <form
        onSubmit={handleSignUp}
        className="flex flex-col justify-center items-center mx-auto w-auto gap-4 text-base bg-white bg-opacity-70 p-8 rounded-lg shadow-lg relative pt-20"
      >
        <div className="absolute -top-8 bg-white shadow-lg rounded-full overflow-hidden">
          <PiUserCirclePlus className="text-6xl" />
        </div>
        {inputFields.map(({ name, type, placeholder, ref, Icon, error }) => {
          if (type === 'radio') {
            return (
              <div
                key={name}
                className="w-full items-center border bg-white rounded-full px-4 py-1.5 flex gap-6 relative"
              >
                <Icon className="text-xl" />
                <div ref={ref} className="flex justify-start gap-4 w-full">
                  <label className="flex items-center gap-2">
                    <input type="radio" value="male" name="gender" />
                    <p className="text-xs">남성</p>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" value="female" name="gender" />
                    <p className="text-xs">여성</p>
                  </label>
                </div>
                {error && <p className="text-red-300 text-[0.5rem] absolute -bottom-5">{error}</p>}
              </div>
            );
          }

          const isPasswordField = name === 'password' || name === 'confirmPassword';
          const isVisible = name === 'password' ? showPassword : showConfirmPassword;
          const toggleVisibility = () =>
            name === 'password' ? setShowPassword(!showPassword) : setShowConfirmPassword(!showConfirmPassword);

          return (
            <div key={name} className="w-full items-center border bg-white rounded-full flex gap-2 px-4 relative">
              <Icon className="text-xl" />
              <input
                className="w-full border-none text-xs px-1.5 py-2 focus:outline-none placeholder:text-xs"
                type={isPasswordField && isVisible ? 'text' : type}
                placeholder={placeholder}
                ref={ref}
                maxLength={isPasswordField ? 14 : 20}
              />
              {isPasswordField && (
                <button type="button" onClick={toggleVisibility} className="text-xl text-gray-400 hover:text-gray-600">
                  {isVisible ? <PiEye size={15} className="text-xl" /> : <PiEyeClosed size={15} className="text-xl" />}
                </button>
              )}
              {error && <p className="text-red-300 text-[0.5rem] absolute -bottom-5">{error}</p>}
            </div>
          );
        })}
        <div className="flex items-center w-full gap-4 mt-2">
          <button
            type="submit"
            className="w-full text-xs rounded-full bg-customLoginButton text-white p-1.5 cursor-pointer"
          >
            회원가입
          </button>
        </div>
        <p className="text-[0.65rem] text-gray-500">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="text-blue-600 underline hover:text-blue-400">
            로그인하러 가기
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SignupPage;
