import SetInfoWindowContent from '@/components/navermap/SetInfoWindow';
import swal from '../sweetalert/swal';
import isMobile from './isMobile';
import makeAddress from './makeAddress';

function searchCoordinateToAddress(infoWindow, map, latlng, setSelectButtonDom, setSelectedGeoData, marker, user) {
  infoWindow.close();
  window.naver.maps.Service.reverseGeocode(
    {
      coords: latlng,
      orders: [window.naver.maps.Service.OrderType.ADDR, window.naver.maps.Service.OrderType.ROAD_ADDR].join(',')
    },
    function (status, response) {
      if (status === window.naver.maps.Service.Status.ERROR) {
        swal('error', 'Something Wrong!');
        return;
      }

      let items = response.v2.results,
        address = '',
        htmlAddresses = [];

      for (let i = 0, ii = items.length, item, addrType; i < ii; i++) {
        item = items[i];
        address = makeAddress(item) || '';
        addrType = item.name === 'roadaddr' ? '[도로명 주소]' : '[지번 주소]';

        htmlAddresses.push(i + 1 + '. ' + addrType + ' ' + address);
      }

      setSelectedGeoData({
        address: {
          jibunAddress: htmlAddresses[0]?.substring(11),
          roadAddress: htmlAddresses[1]?.substring(12)
        },
        coord: { lat: latlng.y, long: latlng.x }
      });

      // setInfoWindowContent 함수 호출
      const container = SetInfoWindowContent('address', '', htmlAddresses, infoWindow, null, null, marker, user);

      infoWindow.setContent(container);
      // const selectCoordButton = infoWindow.getContentElement().querySelector('#selectCoord');
      // if (selectCoordButton) {
      //   selectCoordButton.style.pointerEvents = 'auto';
      //   selectCoordButton.onclick = (e) => {
      //     e.preventDefault();
      //     e.stopPropagation();
      //     if (window.openCreateGroupModal) window.openCreateGroupModal();
      //   };
      // }
      infoWindow.setOptions({
        anchorSkew: false,
        borderColor: '#cecdc7',
        anchorSize: {
          width: 10,
          height: 12
        }
        // maxWidth: 370
      });
      let centerPosition = marker.getPosition();
      centerPosition = {
        x: centerPosition.x + 0.001,
        y: centerPosition.y,
        _lat: centerPosition._lat,
        _long: centerPosition._long + 0.001
      };
      map.setCenter(isMobile() ? centerPosition : marker.getPosition());
      infoWindow.open(map, marker.getPosition());

      setTimeout(() => {
        const infoWindowInnerContent = infoWindow.getContentElement();

        const infoWindowOuterContent = infoWindowInnerContent.parentNode.parentNode;

        infoWindowInnerContent.parentNode.style.width = 'fit-content';
        infoWindowInnerContent.parentNode.style.height = 'fit-content';
        infoWindowInnerContent.parentNode.style.minWidth = isMobile() ? '250px' : '370px';
        infoWindowInnerContent.parentNode.style.maxWidth = isMobile() ? '250px' : '370px';
        infoWindowInnerContent.parentNode.style.fontSize = isMobile() ? '9px' : '14px';

        infoWindowOuterContent.style.top =
          infoWindowInnerContent.getBoundingClientRect().height < 81 ? '-88px' : '-110px';

        setSelectButtonDom(infoWindowInnerContent.querySelector('#selectCoord'));
      }, 0);
    }
  );
}

export default searchCoordinateToAddress;
