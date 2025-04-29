import SetInfoWindowContent from '@/components/navermap/SetInfoWindow';
import isMobile from './isMobile';
import swal, { Swal } from '../sweetalert/swal';

function searchAddressToCoordinate(
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
    swal('error', '검색어를 입력해주세요');
    return;
  }

  window.naver.maps.Service.geocode(
    {
      query: searchedValue
    },
    function (status, response) {
      if (status === window.naver.maps.Service.Status.ERROR) {
        swal('error', 'Something Wrong!');
        return;
      }

      if (response.v2.meta.totalCount === 0) {
        if (!Swal.getPopup()) {
          swal('error', `검색결과가 없습니다. 결과 ${response.v2.meta.totalCount}건`);
        }
        return;
      }

      let htmlAddresses = [],
        item = response.v2.addresses[0],
        point = new window.naver.maps.Point(item.x, item.y);

      if (item.roadAddress) {
        htmlAddresses.push('[도로명 주소] ' + item.roadAddress);
      }

      if (item.jibunAddress) {
        htmlAddresses.push('[지번 주소] ' + item.jibunAddress);
      }

      if (item.englishAddress) {
        htmlAddresses.push('[영문명 주소] ' + item.englishAddress);
      }

      // item.y === lat / item.x === long
      setSelectedGeoData({
        address: {
          jibunAddress: htmlAddresses[1]?.substring(8),
          roadAddress: htmlAddresses[0]?.substring(9)
        },
        coord: { lat: Number(item.y), long: Number(item.x) }
      });

      // setInfoWindowContent 함수 호출
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
        anchorSize: {
          width: 10,
          height: 12
        }
        // maxWidth: 300
      });

      marker.setMap(map);
      marker.setPosition(point);

      // const selectCoordButton = infoWindow.getContentElement().querySelector('#selectCoord');

      // if (selectCoordButton) {
      //   selectCoordButton.style.pointerEvents = 'auto';
      //   selectCoordButton.onclick = (e) => {
      //     e.preventDefault();
      //     e.stopPropagation();
      //     if (window.openCreateGroupModal) window.openCreateGroupModal();
      //   };
      // }

      let centerPosition = point;
      centerPosition = {
        x: centerPosition.x + 0.001,
        y: centerPosition.y,
        _lat: centerPosition._lat,
        _long: centerPosition._long + 0.001
      };
      map.setCenter(isMobile() ? centerPosition : point);
      infoWindow.open(map, point);
      setTimeout(() => {
        const infoWindowInnerContent = infoWindow.getContentElement();

        const infoWindowOuterContent = infoWindowInnerContent.parentNode.parentNode;

        infoWindowInnerContent.parentNode.style.width = 'fit-content';
        infoWindowInnerContent.parentNode.style.height = 'fit-content';
        infoWindowInnerContent.parentNode.style.minWidth = isMobile() ? '250px' : '400px';
        infoWindowInnerContent.parentNode.style.maxWidth = isMobile() ? '250px' : '400px';
        infoWindowInnerContent.parentNode.style.fontSize = isMobile() ? '9px' : '14px';

        infoWindowOuterContent.style.top =
          infoWindowInnerContent.getBoundingClientRect().height < 100 ? '-88px' : '-130px';

        setSelectButtonDom(infoWindowInnerContent.querySelector('#selectCoord'));

        searchInputRef.value = '';
      }, 0);
    }
  );
}
export default searchAddressToCoordinate;
