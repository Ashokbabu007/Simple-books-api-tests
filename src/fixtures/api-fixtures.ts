import { test as base, APIRequestContext } from '@playwright/test';
import { BooksApi } from '../api/BooksApi';
import { uniqueClient } from '../data/test-data';

type ApiFixtures = {
  booksApi: BooksApi;
  /** Fresh Bearer token obtained by registering a unique client */
  authToken: string;
};

/**
 * Custom fixtures:
 * - booksApi  → typed API helper
 * - authToken → automatically registers a unique client and yields the token
 */
export const test = base.extend<ApiFixtures>({
  booksApi: async ({ request }, use) => {
    await use(new BooksApi(request));
  },

  authToken: async ({ request }, use) => {
    const client = uniqueClient();
    const response = await request.post('/api-clients/', {
      data: {
        clientName: client.clientName,
        clientEmail: client.clientEmail,
      },
    });

    if (response.status() !== 201) {
      throw new Error(
        `Failed to register API client (${response.status()}): ${await response.text()}`
      );
    }

    const body = await response.json();
    const token: string = body.accessToken;

    if (!token) {
      throw new Error('No accessToken returned from /api-clients/');
    }

    await use(token);
  },
});

export { expect } from '@playwright/test';
