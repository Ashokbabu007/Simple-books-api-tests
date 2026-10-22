import { test, expect } from '../src/fixtures/api-fixtures';
import { BOOK_IDS, SAMPLE_CUSTOMER } from '../src/data/test-data';

/**
 * Full order lifecycle:
 *   Register client → Create order → Get order → Update → List → Delete → Verify gone
 */
test.describe('Orders CRUD (requires authentication)', () => {
  test('complete order lifecycle: POST → GET → PATCH → DELETE @smoke @e2e', async ({
    booksApi,
    authToken,
  }) => {
    // ── 1. CREATE ─────────────────────────────────────────────────────
    const createRes = await booksApi.createOrder(
      authToken,
      BOOK_IDS.fiction,
      SAMPLE_CUSTOMER.name
    );
    expect(createRes.status()).toBe(201);

    const created = await booksApi.expectJson(createRes);
    expect(created).toHaveProperty('created', true);
    expect(created).toHaveProperty('orderId');
    const orderId: string = created.orderId;
    expect(orderId).toBeTruthy();

    // ── 2. GET single order ───────────────────────────────────────────
    const getRes = await booksApi.getOrder(authToken, orderId);
    await booksApi.expectOk(getRes, 200);

    const order = await booksApi.expectJson(getRes);
    expect(order).toHaveProperty('id', orderId);
    expect(order).toHaveProperty('bookId', BOOK_IDS.fiction);
    expect(order).toHaveProperty('customerName', SAMPLE_CUSTOMER.name);
    expect(order).toHaveProperty('quantity');
    expect(order).toHaveProperty('timestamp');

    // ── 3. PATCH – update customer name ───────────────────────────────
    const patchRes = await booksApi.updateOrder(
      authToken,
      orderId,
      SAMPLE_CUSTOMER.updatedName
    );
    // API returns 204 No Content on successful update
    expect([200, 204]).toContain(patchRes.status());

    // Verify update took effect
    const getAfterPatch = await booksApi.getOrder(authToken, orderId);
    await booksApi.expectOk(getAfterPatch, 200);
    const updated = await booksApi.expectJson(getAfterPatch);
    expect(updated.customerName).toBe(SAMPLE_CUSTOMER.updatedName);

    // ── 4. GET all orders – should contain our order ──────────────────
    const listRes = await booksApi.getAllOrders(authToken);
    await booksApi.expectOk(listRes, 200);

    const orders = await booksApi.expectJson(listRes);
    expect(Array.isArray(orders)).toBe(true);
    const found = orders.find((o: any) => o.id === orderId);
    expect(found).toBeDefined();
    expect(found.customerName).toBe(SAMPLE_CUSTOMER.updatedName);

    // ── 5. DELETE ─────────────────────────────────────────────────────
    const deleteRes = await booksApi.deleteOrder(authToken, orderId);
    // API returns 204 No Content on successful delete
    expect([200, 204]).toContain(deleteRes.status());

    // ── 6. Verify deleted ─────────────────────────────────────────────
    const getDeleted = await booksApi.getOrder(authToken, orderId);
    expect(getDeleted.status()).toBe(404);
  });

  test('POST /orders – 401 without token', async ({ request }) => {
    // Call without Authorization header
    const response = await request.post('/orders', {
      data: { bookId: BOOK_IDS.fiction, customerName: 'No Auth' },
    });
    expect(response.status()).toBe(401);
  });

  test('POST /orders – 400 when bookId is missing', async ({ request, authToken }) => {
    const response = await request.post('/orders', {
      headers: { Authorization: `Bearer ${authToken}` },
      data: { customerName: 'Missing Book' },
    });
    expect([400, 422]).toContain(response.status());
  });

  test('GET /orders/:orderId – 404 for unknown order', async ({ booksApi, authToken }) => {
    const response = await booksApi.getOrder(authToken, 'non-existent-order-id-xyz');
    expect(response.status()).toBe(404);
  });

  test('DELETE /orders/:orderId – 404 for already deleted / unknown order', async ({
    booksApi,
    authToken,
  }) => {
    const response = await booksApi.deleteOrder(authToken, 'already-gone-order-id');
    expect(response.status()).toBe(404);
  });
});
