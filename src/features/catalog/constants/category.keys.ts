/**
 * Claves centralizadas para TanStack Query.
 * Centralizar aquí evita strings mágicos dispersos en toda la app.
 */
export const categoryKeys = {
    /** Todas las queries de categorías */
    all: ["categories"] as const,

    /** Lista con o sin filtros */
    lists: () => [...categoryKeys.all, "list"] as const,
    list: (filters?: object) => [...categoryKeys.lists(), { filters }] as const,

    /** Detalle de una categoría */
    details: () => [...categoryKeys.all, "detail"] as const,
    detail: (id: number) => [...categoryKeys.details(), id] as const,
}
