// MSW setup for Vitest tests
import { server } from './mocks/server';

// MSW lifecycle hooks
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close()); 