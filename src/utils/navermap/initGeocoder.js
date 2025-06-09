import searchAddressToCoordinate from './addressToCoord';
import searchCoordinateToAddress from './coordToAddress';

function initGeocoder(
  infoWindow,
  map,
  searchInputRef,
  searchButtonRef,
  marker,
  setSelectedGeoData,
  setSelectButtonDom,
  user
) {
  // map.addListener('click', (e) => {
  //   searchCoordinateToAddress(infoWindow, map, e.coord, setSelectButtonDom, setSelectedGeoData, marker, user);
  //   marker.setMap(map);
  //   marker.setPosition(e.coord);
  // });

  map.addListener('click', (e) => {
    searchCoordinateToAddress(infoWindow, map, e.coord, setSelectButtonDom, setSelectedGeoData, marker, user);

    // 마커를 클릭한 위치로 이동 + 지도에 표시
    if (marker) {
      marker.setPosition(e.coord);
      marker.setMap(map);
    }
  });

  searchInputRef.addEventListener('keydown', (e) => {
    let keyCode = e.which;
    if (keyCode === 13) {
      searchAddressToCoordinate(infoWindow, searchInputRef, map, setSelectedGeoData, setSelectButtonDom, marker, user);
    }
  });

  searchButtonRef.addEventListener('click', (e) => {
    e.preventDefault();
    searchAddressToCoordinate(infoWindow, searchInputRef, map, setSelectedGeoData, setSelectButtonDom, marker, user);
  });
}
export default initGeocoder;
