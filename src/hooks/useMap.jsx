import { loginUser } from '@/api/profileApi';
import searchCoordinateToAddress from '@/utils/navermap/coordToAddress';
import { getBestLocation } from '@/utils/geolocation';
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
    mapRef.current = map;

    const marker = new window.naver.maps.Marker({
      position: new window.naver.maps.LatLng(...gps),
      map
    });
    setBasicMarker(marker);
  }, []);

  // 초기에 사용자의 위치 정보를 가져옴
  useLayoutEffect(() => {
    if (gps) return;

    Swal.fire({
      title: '위치 정보 가져오는 중',
      text: '당신의 위치로 이동 중 🏃🏻‍♀️',
      allowOutsideClick: false,
      showLoaderOnConfirm: false,
      showCancelButton: false,
      showConfirmButton: false
    });

    // Apple 지도처럼 watchPosition으로 정확한 Wi-Fi/GPS 위치를 끈질기게 잡고,
    // 완전히 실패하면 IP 기반 위치로 폴백한다. (상세 로직은 유틸 참고)
    const cancel = getBestLocation({
      onLocated: ({ lat, long }) => {
        setGps({ lat, long });
        Swal.close(); // 위치정보 세팅 후 모달 닫기
      },
      onError: () => {
        Swal.close();
        swal('warning', '위치 정보를 가져오는 중 오류가 발생했습니다.');
      }
    });

    // 위치 확정 전에 언마운트되면 진행 중인 watch 정리
    return cancel;
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
        if (!selectedGeoData) {
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
