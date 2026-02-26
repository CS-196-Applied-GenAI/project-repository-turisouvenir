/**
 * Jest setup: load env for tests (e.g. .env.test or fallback to .env).
 * Increase timeout for integration tests that hit DB.
 */
require('dotenv').config({ path: '.env.test' });
require('dotenv').config();

jest.setTimeout(10000);
