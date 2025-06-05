import useMap from '@/hooks/useMap';
import usePlaces from '@/hooks/usePlaces';
import { calculateDistance } from '@/utils/gathering/distance';
import useFilterStore from '@/zustand/filter.list';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import Loading from '../common/Loading';
import PlaceItem from './PlaceItem';
import { useGatheringStore } from '@/zustand/gathering.store';
import { usePlacesCount } from '@/zustand/placescount.store';

const GatheringItem = () => {
  const { sortedPlace, setSortedPlace } = useGatheringStore();
  const { filterType, sortType } = useFilterStore();
  const { places, placesLoading } = usePlaces();
  const { gps } = useMap();
  const { newPlaces } = usePlacesCount();
  const prevIdsRef = useRef('');
  const sortPlaces = useCallback((places, userLocation) => {
    const placesWithDistance = places.map((place) => ({
      ...place,
      distance: calculateDistance(userLocation.latitude, userLocation.longitude, place.lat, place.long)
    }));

    // 거리 계산된 값 오름차순
    placesWithDistance.sort((a, b) => a.distance - b.distance);

    return placesWithDistance;
  }, []);
  const placeList = useMemo(() => {
    if (!gps || !places.length) return [];

    const userLocation = {
      latitude: gps.lat,
      longitude: gps.long
    };

    let list = [...places];

    // 첫번째 필터링
    if (filterType === 1) {
      list = list.filter((place) => place.isReviewed); // 승인 필요
    } else if (filterType === 2) {
      list = list.filter((place) => !place.isReviewed); // 비승인
    } else if (filterType === 3) {
      list = list.filter((place) => newPlaces.includes(place.id)); // 미확인
    }

    // 두번째 정렬
    if (sortType === 0) {
      list = sortPlaces(list, userLocation);
    } else if (sortType === 1) {
      list = list.sort((a, b) => b.created_at.localeCompare(a.created_at)); // 최신순
    } else if (sortType === 2) {
      list = list.sort((a, b) => a.deadline.localeCompare(b.deadline)); // 마감 임박순
    }

    return list;
  }, [gps, places, filterType, sortType, newPlaces, sortPlaces]);

  useEffect(() => {
    const newIds = placeList.map((p) => p.id).join(',');
    const prevIds = prevIdsRef.current;

    const hasListChanged = prevIds !== newIds;
    const isEmptyNow = placeList.length === 0;
    const wasNotEmpty = prevIds.split(',').length > 0;

    if (hasListChanged || (filterType === 3 && isEmptyNow && wasNotEmpty)) {
      prevIdsRef.current = newIds;
      setSortedPlace(placeList);
    }
  }, [placeList, newPlaces, filterType, setSortedPlace]);

  if (placesLoading || !gps) return <Loading />;

  return (
    <div className="flex-1 overflow-auto scrollbar-hide overflow-x-hidden">
      <div className="flex flex-col gap-4 w-[86%] mx-auto pb-20">
        {sortedPlace.length === 0 ? (
          <div className="text-center text-gray-400 mt-8">
            {places.length > 0
              ? '선택한 조건에 해당하는 모임이 없습니다. 필터를 변경해보세요.'
              : '현재 모집 중인 모임이 없습니다. 새로운 모임을 만들어보세요!'}
          </div>
        ) : (
          sortedPlace.map((place) => {
            const showBadge = newPlaces.includes(place.id);
            return <PlaceItem key={place.id} place={place} showBadge={showBadge} />;
          })
        )}
      </div>
    </div>
  );
};

export default GatheringItem;
