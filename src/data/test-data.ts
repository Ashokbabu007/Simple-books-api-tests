/**
 * Shared test data and helpers for Simple Books API.
 */

export const BASE_URL = 'https://simple-books-api.click';

/** Generate a unique client for registration (avoids 409 conflicts) */
export function uniqueClient() {
  const ts = Date.now();
  const rand = Math.floor(Math.random() * 10000);
  return {
    clientName: `QA_Client_${ts}_${rand}`,
    clientEmail: `qa.engineer.${ts}.${rand}@example.com`,
  };
}

export const SAMPLE_CUSTOMER = {
  name: 'Jane Automation',
  updatedName: 'Jane Updated',
};

/** Known book IDs from the public catalog (1–6 typically exist) */
export const BOOK_IDS = {
  fiction: 1,
  nonFiction: 3,
} as const;
