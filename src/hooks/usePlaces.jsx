import placesApi from '@/api/api.places';
import { useQuery } from '@tanstack/react-query';

function usePlaces() {
  const { data: places = [], isPending: placesLoading } = useQuery({
    queryKey: ['places'],
    queryFn: () => placesApi.getPlaces(),
    staleTime: 10000
  });

  return { places, placesLoading };
}

export default usePlaces;
