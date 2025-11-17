export enum OrderStatus {
  PENDING = 'pending',          // Pedido recibido
  CONFIRMED = 'confirmed',      // Confirmado por camarero/admin
  PREPARING = 'preparing',      // En cocina
  READY = 'ready',              // Listo para servir
  DELIVERED = 'delivered',      // Entregado
  CANCELLED = 'cancelled',      // Cancelado
}
