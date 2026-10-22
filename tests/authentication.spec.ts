import { test, expect } from '../src/fixtures/api-fixtures';
import { uniqueClient } from '../src/data/test-data';

test.describe('API Client Registration & Authentication', () => {
  test('POST /api-clients/ – register unique client and receive token @smoke', async ({
    booksApi,
  }) => {
    const client = uniqueClient();
    const response = await booksApi.registerClient(client.clientName, client.clientEmail);

    expect(response.status()).toBe(201);
    const body = await booksApi.expectJson(response);
    expect(body).toHaveProperty('accessToken');
    expect(typeof body.accessToken).toBe('string');
    expect(body.accessToken.length).toBeGreaterThan(20);
  });

  test('POST /api-clients/ – 409 when client already registered', async ({ booksApi }) => {
    const client = uniqueClient();

    // First registration succeeds
    const first = await booksApi.registerClient(client.clientName, client.clientEmail);
    expect(first.status()).toBe(201);

    // Second registration with same email fails
    const second = await booksApi.registerClient(client.clientName, client.clientEmail);
    expect(second.status()).toBe(409);
  });

  test('authToken fixture provides a usable Bearer token', async ({ authToken }) => {
    expect(authToken).toBeTruthy();
    expect(typeof authToken).toBe('string');
    expect(authToken.length).toBeGreaterThan(20);
  });
});
