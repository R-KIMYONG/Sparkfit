import useMap from '@/hooks/useMap';
import usePlaces from '@/hooks/usePlaces';
import { calculateDistance } from '@/utils/gathering/distance';
import useFilterStore from '@/zustand/filter.list';
import { useCallback, useEffect, useMemo } from 'react';
import Loading from '../common/Loading';
import PlaceItem from './PlaceItem';
import { useGatheringStore } from '@/zustand/gathering.store';
import { usePlacesCount } from '@/zustand/placescount.store';

const GatheringItem = () => {
  const { sortedPlace, loading, setSortedPlace, setLoading } = useGatheringStore();
  const { selectedButton } = useFilterStore();
  const { places, placesLoading } = usePlaces();
  const { gps } = useMap();
  const { newPlaces } = usePlacesCount();

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

    let list = sortPlaces(places, userLocation);

    if (selectedButton === 3) {
      list = list.filter((place) => place.isReviewed === true);
    } else if (selectedButton === 4) {
      list = list.filter((place) => place.isReviewed === false);
    }

    if (selectedButton === 1) {
      list = list.sort((a, b) => a.deadline.localeCompare(b.deadline));
    } else if (selectedButton === 2) {
      list = list.sort((a, b) => b.created_at.localeCompare(a.created_at));
    }

    return list;
  }, [gps, places, selectedButton]);

  useEffect(() => {
    if (!placeList.length) return;
    setSortedPlace(placeList);
    setLoading(false);
  }, [placeList, setSortedPlace, setLoading]);

  return (
    <div className="flex-1 overflow-auto scrollbar-hide overflow-x-hidden">
      <div className="flex flex-col gap-4 w-[86%] mx-auto pb-20">
        {loading || placesLoading || !gps ? (
          <Loading />
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
