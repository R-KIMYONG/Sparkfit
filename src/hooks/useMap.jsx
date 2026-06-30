import { loginUser } from '@/api/profileApi';
import searchCoordinateToAddress from '@/utils/navermap/coordToAddress';
import initGeocoder from '@/utils/navermap/initGeocoder';
import swal from '@/utils/sweetalert/swal';
import useMapStore from '@/zustand/map.store';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import { useShallow } from 'zustand/react/shallow';
import { INITIAL_CENTER, INITIAL_ZOOM } from '../constants/navermap';

function useMap() {
  const [searchInput, setSearchInput] = useState(null);
  const [searchButton, setSearchButton] = useState(null);
  const [basicMarker, setBasicMarker] = useState(null);
  const [infoWindow, setInfoWindow] = useState(() =>
    !window.naver
      ? null
      : new window.naver.maps.InfoWindow({
          anchorSkew: true
        })
  );
  const [makeGatherButtonDom, setMakeGatherButtonDom] = useState(null);
  const {
    selectedGeoData,
    setSelectedGeoData,
    userGps: gps,
    setUserGps: setGps
  } = useMapStore(
    useShallow((state) => ({
      selectedGeoData: state.selectedGeoData,
      setSelectedGeoData: state.setSelectedGeoData,
      userGps: state.userGps,
      setUserGps: state.setUserGps
    }))
  );
  const { data: user } = useQuery({ queryKey: ['user'], queryFn: loginUser });

  const mapRef = useRef(null);

  const initializeMap = useCallback((gps) => {
    const mapOptions = {
      center: new window.naver.maps.LatLng(...gps),
      zoom: INITIAL_ZOOM,
      scaleControl: false,
      logoControl: false,
      mapDataControl: false,
      zoomControl: false,
      mapTypeControl: false,
      minZoom: 8,
      tileTransition: true,
      // 확대 시 타일 변경되는 시간
      tileDuration: 400,
      // // 타일 투명도 ( 투명도 낮추면 배경 색이 보임 )
      // baseTileOpacity: 1,
      // //배경 색
      // background: 'white',
      tileSpare: 5,
      zoomControlOptions: {
        position: window.naver.maps.Position.RIGHT_TOP, // 줌 컨트롤의 위치를 우측 상단으로 배치함
        style: window.naver.maps.ZoomControlStyle.SMALL
      }
    };

    const map = new window.naver.maps.Map('map01', mapOptions);
    // setNaverMap(map);
    mapRef.current = map;

    const marker = new window.naver.maps.Marker({
      position: new window.naver.maps.LatLng(...gps),
      map
    });
    setBasicMarker(marker);
  }, []);

  // 초기에 사용자의 위치 정보를 가져옴
  useLayoutEffect(() => {
    // console.log('초기 gps =>', userGps);

    if (gps) return;

    const success = ({ coords }) => {
      const gpsData = {
        lat: coords.latitude,
        long: coords.longitude
      };
      setGps(gpsData);
      Swal.close(); // 위치정보 세팅 후 모달 닫기
    };

    // 고정밀 위치 획득에 실패하면(POSITION_UNAVAILABLE / TIMEOUT) 저정밀로 1회 재시도
    // GPS 칩이 없는 데스크톱(예: MacBook)에서 kCLErrorLocationUnknown 발생 시 폴백
    const requestPosition = (highAccuracy, onError) => {
      navigator.geolocation.getCurrentPosition(success, onError, {
        enableHighAccuracy: highAccuracy,
        timeout: 10000,
        maximumAge: 0
      });
    };

    const error = (err) => {
      const message =
        err.code === err.PERMISSION_DENIED
          ? '위치 정보를 제공하지 않으면 일부 기능을 사용할 수 없습니다.'
          : '위치 정보를 가져오는 중 오류가 발생했습니다.';
      swal('warning', message);
    };

    const highAccuracyError = (err) => {
      // 권한 거부가 아니라 위치 소스를 못 잡은 경우에만 저정밀로 폴백
      if (err.code === err.POSITION_UNAVAILABLE || err.code === err.TIMEOUT) {
        requestPosition(false, error);
        return;
      }
      error(err);
    };

    const getUserLocation = () => {
      if (!navigator.geolocation) {
        swal('error', '위치정보가 지원되지 않습니다');
        return;
      }
      Swal.fire({
        title: '위치 정보 가져오는 중',
        text: '당신의 위치로 이동 중 🏃🏻‍♀️',
        allowOutsideClick: false,
        showLoaderOnConfirm: false,
        showCancelButton: false,
        showConfirmButton: false
      });

      requestPosition(true, highAccuracyError);
    };
    getUserLocation();
  }, [setGps, gps]);

  useEffect(() => {
    const mapDiv = document.getElementById('map01');
    if (mapDiv) initializeMap(INITIAL_CENTER);

    setSearchInput(document.getElementById('search-input'));
    setSearchButton(document.getElementById('search-button'));
  }, [initializeMap]);

  // 사용자 gps 값 저장 성공시 실행
  useEffect(() => {
    if (gps && basicMarker && mapRef.current && window.naver) {
      const userLocation = new window.naver.maps.LatLng(gps.lat, gps.long);
      mapRef.current.setCenter(userLocation);
      basicMarker.setPosition(userLocation);
    }
  }, [gps, basicMarker, mapRef]);

  // 기본 정보창 객체 생성
  useEffect(() => {
    if (!infoWindow && window.naver) {
      const infoWindow = new window.naver.maps.InfoWindow();
      setInfoWindow(infoWindow);
    }
  }, [infoWindow]);

  // 마커 클릭시 동작 여기에
  useEffect(() => {
    let listener = null;
    if (basicMarker && gps && infoWindow && mapRef.current && setMakeGatherButtonDom && window.naver) {
      listener = window.naver.maps.Event.addListener(basicMarker, 'click', () => {
        if (selectedGeoData) {
          // console.log(selectedGeoData);
        } else {
          // console.log({ lat: gps.lat, long: gps.long });
          searchCoordinateToAddress(
            infoWindow,
            mapRef.current,
            { y: gps.lat, x: gps.long },
            setMakeGatherButtonDom,
            setSelectedGeoData,
            basicMarker
          );
        }
      });
    }
    return () => {
      if (listener) window.naver.maps.Event.removeListener(listener);
    };
  }, [basicMarker, selectedGeoData, gps, infoWindow, mapRef, setMakeGatherButtonDom, setSelectedGeoData]);

  // 정보창객체와 맵 객체가 설정되면 initGeocoder 실행
  useEffect(() => {
    // 처음에는 onsJsContentLoaded 에 등록하고 실행하고 다음부터는 등록하지 않고 실행하는 방법도 있음
    if (infoWindow && mapRef.current && basicMarker && user) {
      initGeocoder(
        infoWindow,
        mapRef.current,
        searchInput,
        searchButton,
        basicMarker,
        setSelectedGeoData,
        setMakeGatherButtonDom,
        user
      );
    }
  }, [
    infoWindow,
    mapRef,
    searchInput,
    searchButton,
    gps,
    basicMarker,
    setSelectedGeoData,
    setMakeGatherButtonDom,
    user
  ]);

  return {
    gps,
    naverMap: mapRef.current,
    infoWindow,
    basicMarker,
    makeGatherButtonDom,
    selectedGeoData,
    initializeMap
  };
}

export default useMap;
