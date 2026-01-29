// Simple stub to simulate warehouse/WMS integration.
// In production, replace with HTTP client calls + retries.

export async function updateShippingLabel(orderNumber, address) {
  await new Promise((r) => setTimeout(r, 50));
  return {
    success: true,
    labelId: `WMS-${orderNumber}`,
    address,
  };
}

export async function pushStatus(orderNumber, status) {
  await new Promise((r) => setTimeout(r, 25));
  return { success: true, orderNumber, status };
}
