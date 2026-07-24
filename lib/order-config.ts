export const FREE_DELIVERY_THRESHOLD = 5000;
export const DELIVERY_FEE = 500;

export function computeDeliveryFee(subtotal: number): number {
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
}

export function getOrderConfig() {
  return {
    freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
    deliveryFee: DELIVERY_FEE,
  };
}
