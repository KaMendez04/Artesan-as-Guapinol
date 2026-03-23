import { useQuery } from "@tanstack/react-query"
import { listUniquePricesByCategory } from "../services/productPrice.service"

export function useProductPrices(idCategory: number | "") {
  return useQuery({
    queryKey: ["ProductPrice", idCategory],
    queryFn: () => listUniquePricesByCategory(idCategory as number),
    enabled: idCategory !== "",
    staleTime: 1000 * 60 * 60, // 1 hour - prices don't change that often
  })
}
