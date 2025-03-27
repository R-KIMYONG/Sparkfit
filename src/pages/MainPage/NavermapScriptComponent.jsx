import contractsApi from '@/api/api.contracts';
import { loginUser } from '@/api/profileApi';
import Loading from '@/components/common/Loading';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import Mainpage from './Mainpage';
import Error from '@/components/common/Error';

function NavermapScriptComponent() {
  const { data: user, isPending, isError: isUserError } = useQuery({ queryKey: ['user'], queryFn: loginUser });
  const {
    data: contracts,
    isPending: isContractsLoading,
    isError: isContractsError
  } = useQuery({
    queryKey: ['contracts'],
    queryFn: () => contractsApi.getContracts(),
    select: (data) => data.filter((contract) => contract.user_id === user.id)
  });
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${
      import.meta.env.VITE_NCP_CLIENT_ID
    }&submodules=geocoder`;
    script.async = true;
    script.onload = () => {
      if (window.naver) {
        setIsScriptLoaded(true);
      } else {
        console.error('네이버 맵 스크립트 로드 실패: window.naver가 정의되지 않음');
      }
    };
    script.onerror = () => {
      console.error('네이버 맵 스크립트 로드 실패');
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  if (isPending || !isScriptLoaded || isContractsLoading) {
    return <Loading />;
  }

  if (isContractsError || isUserError) {
    return <Error message="네이버 맵 스크립트 오류" />;
  }

  return <Mainpage user={user} contracts={contracts} />;
}

export default NavermapScriptComponent;

// import { loginUser } from '@/api/profileApi';
// import { useQuery } from '@tanstack/react-query';
// import { Suspense, lazy } from 'react';
// import Mainpage from './Mainpage';

// const ExternalComponent = lazy(() => {
//   return new Promise((resolve) => {
//     // 외부 스크립트를 동적으로 추가
//     const script = document.createElement('script');
//     script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${
//       import.meta.env.VITE_NCP_CLIENT_ID
//     }&submodules=geocoder`;
//     script.async = true;
//     script.onload = () => {
//       // 스크립트가 로드된 후에 window.naver가 정의된 것을 확인
//       if (window.naver) {
//         console.log('Naver Maps script loaded:', window.naver);
//         resolve({
//           default: () => <Mainpage />
//         });
//       } else {
//         console.error('Naver Maps script loaded, but window.naver is undefined');
//       }
//     };
//     script.onerror = () => {
//       console.error('Failed to load Naver Maps script');
//     };
//     document.body.appendChild(script);
//   });
// });

// function NavermapScriptComponent() {
//   const { data: user, isPending } = useQuery({ queryKey: ['user'], queryFn: loginUser });

//   if (isPending) return <div>Loading...</div>;

//   return (
//     <Suspense fallback={<div>Loading...</div>}>
//       <ExternalComponent user={user} />
//     </Suspense>
//   );
// }

// export default NavermapScriptComponent;
