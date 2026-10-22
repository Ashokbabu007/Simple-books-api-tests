import { APIRequestContext, expect } from '@playwright/test';

/**
 * Typed helpers for Simple Books API endpoints.
 * Keeps tests readable and centralizes assertions + auth headers.
 */
export class BooksApi {
  constructor(private readonly request: APIRequestContext) {}

  // ─── Public (no auth) ───────────────────────────────────────────────

  async getStatus() {
    const response = await this.request.get('/status');
    return response;
  }

  async getBooks(params?: { type?: 'fiction' | 'non-fiction'; limit?: number }) {
    const response = await this.request.get('/books', { params });
    return response;
  }

  async getBook(bookId: number) {
    const response = await this.request.get(`/books/${bookId}`);
    return response;
  }

  // ─── Authentication ─────────────────────────────────────────────────

  async registerClient(clientName: string, clientEmail: string) {
    const response = await this.request.post('/api-clients/', {
      data: { clientName, clientEmail },
    });
    return response;
  }

  // ─── Orders (require Bearer token) ──────────────────────────────────

  private authHeaders(token: string) {
    return { Authorization: `Bearer ${token}` };
  }

  async createOrder(token: string, bookId: number, customerName: string) {
    const response = await this.request.post('/orders', {
      headers: this.authHeaders(token),
      data: { bookId, customerName },
    });
    return response;
  }

  async getAllOrders(token: string) {
    const response = await this.request.get('/orders', {
      headers: this.authHeaders(token),
    });
    return response;
  }

  async getOrder(token: string, orderId: string) {
    const response = await this.request.get(`/orders/${orderId}`, {
      headers: this.authHeaders(token),
    });
    return response;
  }

  async updateOrder(token: string, orderId: string, customerName: string) {
    const response = await this.request.patch(`/orders/${orderId}`, {
      headers: this.authHeaders(token),
      data: { customerName },
    });
    return response;
  }

  async deleteOrder(token: string, orderId: string) {
    const response = await this.request.delete(`/orders/${orderId}`, {
      headers: this.authHeaders(token),
    });
    return response;
  }

  // ─── Assertion helpers ──────────────────────────────────────────────

  async expectOk(response: Awaited<ReturnType<APIRequestContext['get']>>, status = 200) {
    expect(response.status(), `Expected ${status}, got ${response.status()}: ${await response.text()}`).toBe(status);
  }

  async expectJson(response: Awaited<ReturnType<APIRequestContext['get']>>) {
    const body = await response.json();
    expect(body).toBeDefined();
    return body;
  }
}
