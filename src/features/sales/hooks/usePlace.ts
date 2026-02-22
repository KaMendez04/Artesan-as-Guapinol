import { useQuery } from "@tanstack/react-query"
import { getPlaces } from "../services/place.service"

export function usePlaces() {
  return useQuery({
    queryKey: ["Place", "list"],
    queryFn: getPlaces,
  })
}