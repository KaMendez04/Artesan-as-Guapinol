export const pedidoKeys = {
    all: ["pedidos"] as const,

    lists: () => [...pedidoKeys.all, "list"] as const,
    list: (filters?: object) => [...pedidoKeys.lists(), { filters }] as const,

    details: () => [...pedidoKeys.all, "detail"] as const,
    detail: (id: string) => [...pedidoKeys.details(), id] as const,
}
