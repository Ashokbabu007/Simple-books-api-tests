import { test, expect } from '../src/fixtures/api-fixtures';
import { BOOK_IDS } from '../src/data/test-data';

test.describe('Public Endpoints – Status & Books', () => {
  test('GET /status – API is operational @smoke', async ({ booksApi }) => {
    const response = await booksApi.getStatus();
    await booksApi.expectOk(response, 200);

    const body = await booksApi.expectJson(response);
    expect(body).toHaveProperty('status');
    expect(String(body.status).toLowerCase()).toMatch(/ok|operational|up/);
  });

  test('GET /books – returns a list of books @smoke', async ({ booksApi }) => {
    const response = await booksApi.getBooks();
    await booksApi.expectOk(response, 200);

    const books = await booksApi.expectJson(response);
    expect(Array.isArray(books)).toBe(true);
    expect(books.length).toBeGreaterThan(0);

    // Validate shape of first book
    const first = books[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('name');
    expect(first).toHaveProperty('type');
    expect(first).toHaveProperty('available');
  });

  test('GET /books?type=fiction – filters by type', async ({ booksApi }) => {
    const response = await booksApi.getBooks({ type: 'fiction' });
    await booksApi.expectOk(response, 200);

    const books = await booksApi.expectJson(response);
    expect(books.length).toBeGreaterThan(0);
    for (const book of books) {
      expect(book.type).toBe('fiction');
    }
  });

  test('GET /books?limit=2 – respects limit parameter', async ({ booksApi }) => {
    const response = await booksApi.getBooks({ limit: 2 });
    await booksApi.expectOk(response, 200);

    const books = await booksApi.expectJson(response);
    expect(books.length).toBeLessThanOrEqual(2);
  });

  test('GET /books/:bookId – returns single book details @smoke', async ({ booksApi }) => {
    const response = await booksApi.getBook(BOOK_IDS.fiction);
    await booksApi.expectOk(response, 200);

    const book = await booksApi.expectJson(response);
    expect(book).toHaveProperty('id', BOOK_IDS.fiction);
    expect(book).toHaveProperty('name');
    expect(book).toHaveProperty('author');
    expect(book).toHaveProperty('type');
    expect(book).toHaveProperty('price');
    expect(book).toHaveProperty('available');
    expect(book).toHaveProperty('current-stock');
  });

  test('GET /books/:bookId – 404 for non-existent book', async ({ booksApi }) => {
    const response = await booksApi.getBook(99999);
    expect(response.status()).toBe(404);
  });
});
