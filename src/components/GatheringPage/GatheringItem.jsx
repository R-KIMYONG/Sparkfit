import useMap from '@/hooks/useMap';
import usePlaces from '@/hooks/usePlaces';
import { calculateDistance } from '@/utils/gathering/distance';
import useFilterStore from '@/zustand/filter.list';
import { useCallback, useEffect } from 'react';
import Loading from '../common/Loading';
import PlaceItem from './PlaceItem';
import { useGatheringStore } from '@/zustand/gathering.store';

const GatheringItem = () => {
  const { sortedPlace, loading, setSortedPlace, setLoading } = useGatheringStore();
  const { selectedButton } = useFilterStore();
  const { places, placesLoading } = usePlaces();
  const { gps } = useMap();

  const sortPlaces = useCallback((places, userLocation) => {
    const placesWithDistance = places.map((place) => ({
      ...place,
      distance: calculateDistance(userLocation.latitude, userLocation.longitude, place.lat, place.long)
    }));

    // 거리 계산된 값 오름차순
    placesWithDistance.sort((a, b) => a.distance - b.distance);

    return placesWithDistance;
  }, []);

  useEffect(() => {
    if (gps) {
      const userLocation = {
        latitude: gps.lat,
        longitude: gps.long
      };
      let placeList = sortPlaces(places, userLocation);

      if (selectedButton === 3) {
        placeList = placeList.filter((place) => place.isReviewed === true); // 승인 불필요
      } else if (selectedButton === 4) {
        placeList = placeList.filter((place) => place.isReviewed === false); // 승인 필요
      }

      if (selectedButton === 1) {
        // 마감기한순 정렬
        placeList = placeList.sort((a, b) => a.deadline.localeCompare(b.deadline));
      } else if (selectedButton === 2) {
        // 최신등록순 정렬
        placeList = placeList.sort((a, b) => b.created_at.localeCompare(a.created_at));
      }
      if (JSON.stringify(sortedPlace) !== JSON.stringify(placeList)) {
        setSortedPlace(placeList);
        setLoading(false);
      }
    }
  }, [gps, placesLoading, selectedButton, sortPlaces, places, setLoading, sortedPlace]);
  return (
    <div className="flex-1 overflow-auto scrollbar-hide overflow-x-hidden">
      <div className="flex flex-col gap-4 w-[90%] mx-auto pb-20">
        {loading ? (
          <Loading />
        ) : (
          sortedPlace.map((place) => {
            return <PlaceItem key={place.id} place={place} />;
          })
        )}
      </div>
    </div>
  );
};

export default GatheringItem;
