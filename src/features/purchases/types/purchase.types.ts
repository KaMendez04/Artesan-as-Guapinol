export interface Purchase {
  id: string
  monto: number
  fecha: string
  tienda: string
  created_at: string
}

export interface CreatePurchaseDto {
  monto: number
  fecha: string
  tienda: string
}

export interface UpdatePurchaseDto {
  monto?: number
  fecha?: string
  tienda?: string
}
