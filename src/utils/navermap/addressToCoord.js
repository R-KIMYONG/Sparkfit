// import SetInfoWindowContent from '@/components/navermap/SetInfoWindow';
// import isMobile from './isMobile';
// import swal, { Swal } from '../sweetalert/swal';

// function searchAddressToCoordinate(
//   infoWindow,
//   searchInputRef,
//   map,
//   setSelectedGeoData,
//   setSelectButtonDom,
//   marker,
//   user
// ) {
//   const searchedValue = searchInputRef.value.trim();

//   if (!searchedValue) {
//     swal('error', '도로명주소 또는 지번주소를 입력해주세요.');
//     return;
//   }

//   window.naver.maps.Service.geocode(
//     {
//       query: searchedValue
//     },
//     function (status, response) {
//       if (status === window.naver.maps.Service.Status.ERROR) {
//         swal('error', 'Something Wrong!');
//         return;
//       }

//       if (response.v2.meta.totalCount === 0) {
//         if (!Swal.getPopup()) {
//           Swal.fire({
//             icon: 'warning',
//             title: '검색결과가 없습니다.',
//             text: '도로명주소 또는 지번주소를 정확하게 입력해 주세요.'
//           });
//         }
//         return;
//       }

//       let htmlAddresses = [],
//         item = response.v2.addresses[0],
//         point = new window.naver.maps.Point(item.x, item.y);

//       if (item.roadAddress) {
//         htmlAddresses.push('[도로명 주소] ' + item.roadAddress);
//       }

//       if (item.jibunAddress) {
//         htmlAddresses.push('[지번 주소] ' + item.jibunAddress);
//       }

//       if (item.englishAddress) {
//         htmlAddresses.push('[영문명 주소] ' + item.englishAddress);
//       }

//       // item.y === lat / item.x === long
//       setSelectedGeoData({
//         address: {
//           jibunAddress: htmlAddresses[1]?.substring(8),
//           roadAddress: htmlAddresses[0]?.substring(9)
//         },
//         coord: { lat: Number(item.y), long: Number(item.x) }
//       });

//       // setInfoWindowContent 함수 호출
//       const container = SetInfoWindowContent(
//         'address',
//         searchedValue,
//         htmlAddresses,
//         infoWindow,
//         null,
//         null,
//         marker,
//         user
//       );

//       infoWindow.setContent(container);

//       infoWindow.setOptions({
//         anchorSkew: false,
//         borderColor: '#cecdc7',
//         anchorSize: {
//           width: 10,
//           height: 12
//         }
//         // maxWidth: 300
//       });

//       marker.setMap(map);
//       marker.setPosition(point);

//       // const selectCoordButton = infoWindow.getContentElement().querySelector('#selectCoord');

//       // if (selectCoordButton) {
//       //   selectCoordButton.style.pointerEvents = 'auto';
//       //   selectCoordButton.onclick = (e) => {
//       //     e.preventDefault();
//       //     e.stopPropagation();
//       //     if (window.openCreateGroupModal) window.openCreateGroupModal();
//       //   };
//       // }

//       let centerPosition = point;
//       centerPosition = {
//         x: centerPosition.x + 0.001,
//         y: centerPosition.y,
//         _lat: centerPosition._lat,
//         _long: centerPosition._long + 0.001
//       };
//       map.setCenter(isMobile() ? centerPosition : point);
//       infoWindow.open(map, point);
//       setTimeout(() => {
//         const infoWindowInnerContent = infoWindow.getContentElement();

//         const infoWindowOuterContent = infoWindowInnerContent.parentNode.parentNode;

//         infoWindowInnerContent.parentNode.style.width = 'fit-content';
//         infoWindowInnerContent.parentNode.style.height = 'fit-content';
//         infoWindowInnerContent.parentNode.style.minWidth = isMobile() ? '250px' : '400px';
//         infoWindowInnerContent.parentNode.style.maxWidth = isMobile() ? '250px' : '400px';
//         infoWindowInnerContent.parentNode.style.fontSize = isMobile() ? '9px' : '14px';

//         infoWindowOuterContent.style.top =
//           infoWindowInnerContent.getBoundingClientRect().height < 100 ? '-88px' : '-130px';

//         setSelectButtonDom(infoWindowInnerContent.querySelector('#selectCoord'));

//         searchInputRef.value = '';
//       }, 0);
//     }
//   );
// }
// export default searchAddressToCoordinate;

//네이버 maps 버전 v3로 업그레이드로 리팩토링
import SetInfoWindowContent from '@/components/navermap/SetInfoWindow';
import isMobile from './isMobile';
import swal, { Swal } from '../sweetalert/swal';
import { commonAddress } from './commonAddress';

async function searchAddressToCoordinate(
  infoWindow,
  searchInputRef,
  map,
  setSelectedGeoData,
  setSelectButtonDom,
  marker,
  user
) {
  const searchedValue = searchInputRef.value.trim();

  if (!searchedValue) {
    swal('error', '도로명주소 또는 지번주소를 입력해주세요.');
    return;
  }
  try {
    Swal.fire({
      title: '주소 검색 중',
      text: '검색 결과를 불러오는 중입니다...',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    const response = await fetch(`/api/forward-geocode?query=${encodeURIComponent(searchedValue)}`);
    const data = await response.json();

    Swal.close();
    if (!data || !data.addresses || data.addresses.length === 0) {
      if (!Swal.getPopup()) {
        Swal.fire({
          icon: 'warning',
          title: '검색결과가 없습니다.',
          text: '도로명주소 또는 지번주소를 정확하게 입력해 주세요.'
        });
      }
      return;
    }

    const items = data.addresses[0];
    const point = new window.naver.maps.Point(Number(items.x), Number(items.y));

    const { topAddress, roadDetail, jibunDetail } = commonAddress(items.roadAddress, items.jibunAddress);

    const htmlAddresses = [];
    if (topAddress) htmlAddresses.push(topAddress);
    if (jibunDetail) htmlAddresses.push(`[지번 주소] ${jibunDetail}`);
    if (roadDetail) htmlAddresses.push(`[도로명 주소] ${roadDetail}`);

    setSelectedGeoData({
      address: {
        roadAddress: items.roadAddress || '',
        jibunAddress: items.jibunAddress || ''
      },
      coord: { lat: Number(items.y), long: Number(items.x) }
    });

    const container = SetInfoWindowContent(
      'address',
      searchedValue,
      htmlAddresses,
      infoWindow,
      null,
      null,
      marker,
      user
    );

    infoWindow.setContent(container);
    infoWindow.setOptions({
      anchorSkew: false,
      borderColor: '#cecdc7',
      anchorSize: { width: 10, height: 12 }
    });

    marker.setMap(map);
    marker.setPosition(point);

    let centerPosition = point;
    centerPosition = {
      x: centerPosition.x + 0.0001,
      y: centerPosition.y,
      _lat: centerPosition._lat,
      _long: centerPosition._long + 0.0001
    };
    map.setCenter(isMobile() ? centerPosition : point);
    infoWindow.open(map, point);

    setTimeout(() => {
      const infoWindowInnerContent = infoWindow.getContentElement();
      const infoWindowOuterContent = infoWindowInnerContent.parentNode.parentNode;

      const parentEl = infoWindowInnerContent.parentNode;

      parentEl.style.display = 'inline-block'; // 중요: 콘텐츠 크기만큼만 차지
      parentEl.style.width = 'auto';
      parentEl.style.height = 'auto';
      parentEl.style.maxWidth = isMobile() ? '90vw' : '400px'; // 뷰포트 기준 제한
      parentEl.style.minWidth = '140px';
      parentEl.style.boxSizing = 'border-box';
      parentEl.style.fontSize = isMobile() ? '10px' : '12px';
      const addressCount = htmlAddresses.length;

      let offsetY = -88;

      if (isMobile()) {
        if (addressCount >= 3) {
          offsetY = -130;
        } else if (addressCount === 2) {
          offsetY = -115;
        } else {
          offsetY = -110;
        }
      } else {
        if (addressCount >= 3) {
          offsetY = -145;
        } else if (addressCount === 2) {
          offsetY = -125;
        } else {
          offsetY = -90;
        }
      }

      infoWindowOuterContent.style.top = `${offsetY}px`;

      setSelectButtonDom(infoWindowInnerContent.querySelector('#selectCoord'));
      searchInputRef.value = '';
    }, 0);
  } catch (err) {
    console.error('주소 검색 실패:', err);
    if (!Swal.getPopup()) {
      swal('error', '주소 정보를 가져오는데 실패했습니다.');
    }
  }
}

export default searchAddressToCoordinate;
