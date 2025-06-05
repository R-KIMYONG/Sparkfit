export const commonAddress = (roadAddress, jibunAddress) => {
  const splitWords = (addr) => addr.trim().split(/\s+/);

  // 주소 모두 없는 경우
  if (!roadAddress && !jibunAddress) {
    return {
      topAddress: '',
      roadDetail: '',
      jibunDetail: ''
    };
  }

  if (roadAddress && jibunAddress) {
    const roadWords = splitWords(roadAddress);
    const jibunWords = splitWords(jibunAddress);

    let common = [];
    let i = 0;

    while (i < roadWords.length && i < jibunWords.length && roadWords[i] === jibunWords[i]) {
      common.push(roadWords[i]);
      i++;
    }

    const topAddress = common.join(' ');
    const roadDetail = roadWords.slice(i).join(' ');
    const jibunDetail = jibunWords.slice(i).join(' ');

    return {
      topAddress,
      roadDetail,
      jibunDetail
    };
  }

  // 도로명 없고 지번만 있는 경우
  const address = roadAddress || jibunAddress;
  const words = splitWords(address);
  const topAddress = words.slice(0, 2).join(' ');
  const detail = words.slice(2).join(' ');

  return {
    topAddress,
    roadDetail: roadAddress ? detail : '',
    jibunDetail: jibunAddress ? detail : ''
  };
};
