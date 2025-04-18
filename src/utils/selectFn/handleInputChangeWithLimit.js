import Swal from 'sweetalert2';
export const handleInputChangeWithLimit = (value, limit = 10) => {
  if (value.length > limit) {
    const truncatedValue = value.substring(0, limit);
    Swal.fire({
      icon: 'warning',
      title: '입력 글자수 초과',
      text: `최대 ${limit}자까지 입력할 수 있습니다.`,
      showConfirmButton: false,
      timer: 2000
    });
    return truncatedValue;
  } else {
    return value;
  }
};
