// import SetInfoWindowContent from '@/components/navermap/SetInfoWindow';
// import swal from '../sweetalert/swal';
// import isMobile from './isMobile';
// import makeAddress from './makeAddress';

// function searchCoordinateToAddress(infoWindow, map, latlng, setSelectButtonDom, setSelectedGeoData, marker, user) {
//   infoWindow.close();
//   window.naver.maps.Service.reverseGeocode(
//     {
//       coords: latlng,
//       orders: [window.naver.maps.Service.OrderType.ADDR, window.naver.maps.Service.OrderType.ROAD_ADDR].join(',')
//     },
//     function (status, response) {
//       if (status === window.naver.maps.Service.Status.ERROR) {
//         swal('error', 'Something Wrong!');
//         return;
//       }

//       let items = response.v2.results,
//         address = '',
//         htmlAddresses = [];

//       for (let i = 0, ii = items.length, item, addrType; i < ii; i++) {
//         item = items[i];
//         address = makeAddress(item) || '';
//         addrType = item.name === 'roadaddr' ? '[도로명 주소]' : '[지번 주소]';

//         htmlAddresses.push(i + 1 + '. ' + addrType + ' ' + address);
//       }

//       setSelectedGeoData({
//         address: {
//           jibunAddress: htmlAddresses[0]?.substring(11),
//           roadAddress: htmlAddresses[1]?.substring(12)
//         },
//         coord: { lat: latlng.y, long: latlng.x }
//       });

//       // setInfoWindowContent 함수 호출
//       const container = SetInfoWindowContent('address', '', htmlAddresses, infoWindow, null, null, marker, user);

//       infoWindow.setContent(container);
//       // const selectCoordButton = infoWindow.getContentElement().querySelector('#selectCoord');
//       // if (selectCoordButton) {
//       //   selectCoordButton.style.pointerEvents = 'auto';
//       //   selectCoordButton.onclick = (e) => {
//       //     e.preventDefault();
//       //     e.stopPropagation();
//       //     if (window.openCreateGroupModal) window.openCreateGroupModal();
//       //   };
//       // }
//       infoWindow.setOptions({
//         anchorSkew: false,
//         borderColor: '#cecdc7',
//         anchorSize: {
//           width: 10,
//           height: 12
//         }
//         // maxWidth: 370
//       });
//       let centerPosition = marker.getPosition();
//       centerPosition = {
//         x: centerPosition.x + 0.001,
//         y: centerPosition.y,
//         _lat: centerPosition._lat,
//         _long: centerPosition._long + 0.001
//       };
//       map.setCenter(isMobile() ? centerPosition : marker.getPosition());
//       infoWindow.open(map, marker.getPosition());

//       setTimeout(() => {
//         const infoWindowInnerContent = infoWindow.getContentElement();

//         const infoWindowOuterContent = infoWindowInnerContent.parentNode.parentNode;

//         infoWindowInnerContent.parentNode.style.width = 'fit-content';
//         infoWindowInnerContent.parentNode.style.height = 'fit-content';
//         infoWindowInnerContent.parentNode.style.minWidth = isMobile() ? '250px' : '370px';
//         infoWindowInnerContent.parentNode.style.maxWidth = isMobile() ? '250px' : '370px';
//         infoWindowInnerContent.parentNode.style.fontSize = isMobile() ? '9px' : '14px';

//         infoWindowOuterContent.style.top =
//           infoWindowInnerContent.getBoundingClientRect().height < 81 ? '-88px' : '-110px';

//         setSelectButtonDom(infoWindowInnerContent.querySelector('#selectCoord'));
//       }, 0);
//     }
//   );
// }

// export default searchCoordinateToAddress;

//===============================================================
import SetInfoWindowContent from '@/components/navermap/SetInfoWindow';
import swal from '../sweetalert/swal';
import isMobile from './isMobile';
import makeAddress from './makeAddress';
import { commonAddress } from './commonAddress';
import Swal from 'sweetalert2';

// 비동기 함수로 변경
async function searchCoordinateToAddress(
  infoWindow,
  map,
  latlng,
  setSelectButtonDom,
  setSelectedGeoData,
  marker,
  user
) {
  infoWindow.close();

  try {
    const response = await fetch(`/api/reverse-geocode?lat=${latlng.y}&lng=${latlng.x}`);

    // const data = await response.json();
    let data;
    try {
      data = await response.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Failed to parse JSON', raw: await response.text() }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    // const items = data?.results || [];
    const items = Array.isArray(data?.result?.results) ? data.result.results : data?.results || [];

    const roadItem = items.find((item) => item.name === 'roadaddr');
    const jibunItem = items.find((item) => item.name === 'addr');

    const roadAddressFull = makeAddress(roadItem);
    const jibunAddressFull = makeAddress(jibunItem);

    const { topAddress, roadDetail, jibunDetail } = commonAddress(roadAddressFull, jibunAddressFull);

    const htmlAddresses = [];

    if (topAddress) htmlAddresses.push(topAddress);
    if (jibunDetail) htmlAddresses.push(`[지번 주소] ${jibunDetail}`);
    if (roadDetail) htmlAddresses.push(`[도로명 주소] ${roadDetail}`);

    setSelectedGeoData({
      address: {
        jibunAddress: roadAddressFull ?? '',
        roadAddress: jibunAddressFull ?? ''
      },
      coord: { lat: latlng.y, long: latlng.x }
    });

    const container = SetInfoWindowContent('address', '', htmlAddresses, infoWindow, null, null, marker, user);
    infoWindow.setContent(container);

    infoWindow.setOptions({
      anchorSkew: false,
      borderColor: '#cecdc7',
      anchorSize: { width: 10, height: 12 }
    });

    const centerPosition = isMobile()
      ? {
          x: marker.getPosition().x + 0.001,
          y: marker.getPosition().y,
          _lat: marker.getPosition()._lat,
          _long: marker.getPosition()._long + 0.001
        }
      : marker.getPosition();

    map.setCenter(centerPosition);
    infoWindow.open(map, marker.getPosition());

    setTimeout(() => {
      const infoWindowInnerContent = infoWindow.getContentElement();
      const infoWindowOuterContent = infoWindowInnerContent.parentNode.parentNode;

      // infoWindowInnerContent.parentNode.style.width = 'fit-content';
      // infoWindowInnerContent.parentNode.style.height = 'fit-content';
      // infoWindowInnerContent.parentNode.style.minWidth = isMobile() ? '250px' : '300px';
      // infoWindowInnerContent.parentNode.style.maxWidth = isMobile() ? '250px' : '300px';
      // infoWindowInnerContent.parentNode.style.fontSize = isMobile() ? '8px' : '12px';

      const parentEl = infoWindowInnerContent.parentNode;

      parentEl.style.display = 'inline-block'; // 중요: 콘텐츠 크기만큼만 차지
      parentEl.style.width = 'auto';
      parentEl.style.height = 'auto';
      parentEl.style.maxWidth = isMobile() ? '90vw' : '400px'; // 뷰포트 기준 제한
      parentEl.style.minWidth = '140px'; 
      parentEl.style.boxSizing = 'border-box';
      parentEl.style.fontSize = isMobile() ? '8px' : '12px';

      const addressCount = htmlAddresses.length; // 예: region + 지번 + 도로명

      let offsetY = -88;

      if (addressCount >= 3) {
        offsetY = -145;
      } else if (addressCount === 2) {
        offsetY = -125;
      } else {
        offsetY = -90;
      }

      infoWindowOuterContent.style.top = `${offsetY}px`;
      // infoWindowInnerContent.getBoundingClientRect().height < 81 ? '-88px' : '-115px';

      setSelectButtonDom(infoWindowInnerContent.querySelector('#selectCoord'));
    }, 0);
  } catch (err) {
    console.error('Reverse Geocoding Failed:', err);
    if (!Swal.getPopup()) {
      swal('error', '주소 정보를 가져오는데 실패했습니다.');
    }
  }
}

export default searchCoordinateToAddress;
//===============================================================
