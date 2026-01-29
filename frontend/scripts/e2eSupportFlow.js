const BASE_URL = 'http://localhost:4000/api';

async function call(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
    ...options,
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(`HTTP ${res.status} ${res.statusText} ${path}`);
    err.details = payload;
    throw err;
  }
  return payload;
}

async function main() {
  console.log('1) Creating guest order via POST /orders');
  const orderBody = {
    customer: {
      name: 'Test Shopper',
      email: 'testshopper@example.com',
      phone: '+1-555-0100',
    },
    shippingAddress: {
      line1: '742 Evergreen Terrace',
      city: 'Springfield',
      postalCode: '49007',
      countryCode: 'US',
    },
    items: [
      {
        productId: 1,
        quantity: 2,
      },
    ],
  };

  const orderPayload = await call('/orders', { method: 'POST', body: JSON.stringify(orderBody) });
  const { order } = orderPayload;
  console.log('  -> Order created', order.orderNumber, order.status, `total:${order.total}`);

  console.log('2) Fetching order confirmation');
  const confPayload = await call(`/orders/${order.orderNumber}?email=${encodeURIComponent(order.customerEmail)}`);
  console.log('  -> Confirmation retrieved', confPayload.order.status, `items:${confPayload.order.items.length}`);

  console.log('3) Logging in support user');
  const authPayload = await call('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'support@techfy.local',
      password: 'Support123!',
    }),
  });
  const token = authPayload.token;
  console.log('  -> JWT retrieved');

  console.log('4) Lookup order via support endpoint');
  const lookupPayload = await call(`/support/orders/lookup?orderNumber=${order.orderNumber}&email=${encodeURIComponent(order.customerEmail)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('  -> Lookup success, items:', lookupPayload.order.items.length);

  console.log('5) Update shipping address (agentic support)');
  const addressBody = {
    shippingAddress: {
      line1: '221B Baker Street',
      city: 'London',
      postalCode: 'NW1 6XE',
      countryCode: 'GB',
    },
    reason: 'Customer moved after placing order',
  };
  const addressPayload = await call(`/support/orders/${order.orderNumber}/address`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(addressBody),
  });
  console.log('  -> Address reprioritized', addressPayload.order.shipLine1, addressPayload.warehouse?.labelId ?? 'warehouse: none');

  console.log('6) Push status to SHIPPED');
  const statusPayload = await call(`/support/orders/${order.orderNumber}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status: 'SHIPPED', reason: 'Marked as packed' }),
  });
  console.log('  -> Status now', statusPayload.order.status);
}

main().catch((error) => {
  console.error('E2E script failed', error.message);
  console.error(error.details ?? error);
  process.exit(1);
});
