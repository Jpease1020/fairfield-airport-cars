// MSW setup for Vitest tests
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './mocks/server';

// MSW lifecycle hooks
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close()); 