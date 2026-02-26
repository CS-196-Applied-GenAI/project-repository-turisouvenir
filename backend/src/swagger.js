/**
 * Swagger/OpenAPI spec for API documentation.
 * Served at GET /api-docs when swaggerUi is mounted.
 */
const swaggerUi = require('swagger-ui-express');

const spec = {
  openapi: '3.0.0',
  info: {
    title: 'Chirper API',
    version: '1.0.0',
    description: 'Twitter clone backend – auth, tweets, feed, likes, retweets, follow, block, comments',
  },
  servers: [
    { url: 'http://localhost:3000', description: 'Local' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        tags: ['Health'],
        responses: { 200: { description: 'OK' } },
      },
    },
    '/auth/register': {
      post: {
        summary: 'Register',
        tags: ['Auth'],
        requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['username', 'email', 'password'], properties: { username: { type: 'string' }, email: { type: 'string', format: 'email' }, password: { type: 'string' }, bio: { type: 'string' } } } } } },
        responses: { 201: { description: 'User created' }, 400: { description: 'Validation error' }, 409: { description: 'Username taken' } },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Login',
        tags: ['Auth'],
        requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['username', 'password'], properties: { username: { type: 'string' }, password: { type: 'string' } } } } } },
        responses: { 200: { description: 'Token + user' }, 401: { description: 'Invalid credentials' } },
      },
    },
    '/auth/logout': {
      post: {
        summary: 'Logout (invalidates token)',
        tags: ['Auth'],
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Logged out' }, 401: { description: 'Not authenticated' } },
      },
    },
    '/users/{id}': {
      get: {
        summary: 'Get user by id',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'User' }, 404: { description: 'Not found' } },
      },
    },
    '/users/me': {
      put: {
        summary: 'Update own profile (bio, username)',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { bio: { type: 'string' }, username: { type: 'string' }, email: { type: 'string', format: 'email' } } } } } },
        responses: { 200: { description: 'Updated user' }, 409: { description: 'Username taken' } },
      },
    },
    '/users/me/profile-picture': {
      post: {
        summary: 'Upload profile picture (multipart, jpg/png/webp, max 2MB)',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        requestBody: { content: { 'multipart/form-data': { schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } } } },
        responses: { 200: { description: 'User with new URL' }, 400: { description: 'Invalid file' } },
      },
    },
    '/users/{id}/follow': {
      post: { summary: 'Follow user', tags: ['Users'], security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], responses: { 201: { description: 'Following' }, 400: { description: 'Cannot follow self' }, 403: { description: 'Blocked' } } },
      delete: { summary: 'Unfollow user', tags: ['Users'], security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], responses: { 204: { description: 'Unfollowed' } } },
    },
    '/users/{id}/block': {
      post: { summary: 'Block user (unfollows both)', tags: ['Users'], security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Blocked' } } },
      delete: { summary: 'Unblock user', tags: ['Users'], security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], responses: { 204: { description: 'Unblocked' } } },
    },
    '/tweets': {
      post: {
        summary: 'Create tweet',
        tags: ['Tweets'],
        security: [{ bearerAuth: [] }],
        requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['content'], properties: { content: { type: 'string', maxLength: 280 } } } } } },
        responses: { 201: { description: 'Tweet created' }, 400: { description: 'Invalid content' } },
      },
    },
    '/tweets/{id}': {
      put: {
        summary: 'Update tweet (author only)',
        tags: ['Tweets'],
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['content'], properties: { content: { type: 'string' } } } } } },
        responses: { 200: { description: 'Updated' }, 403: { description: 'Forbidden' } },
      },
      delete: {
        summary: 'Soft delete tweet (author only)',
        tags: ['Tweets'],
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        responses: { 204: { description: 'Deleted' } },
      },
    },
    '/tweets/{id}/like': {
      post: { summary: 'Like tweet', tags: ['Tweets'], security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], responses: { 201: { description: 'Liked' } } },
      delete: { summary: 'Unlike tweet', tags: ['Tweets'], security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], responses: { 204: { description: 'Unliked' } } },
    },
    '/tweets/{id}/retweet': {
      post: { summary: 'Retweet', tags: ['Tweets'], security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], responses: { 201: { description: 'Retweeted' }, 409: { description: 'Already retweeted' } } },
      delete: { summary: 'Unretweet (id = retweet row id)', tags: ['Tweets'], security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], responses: { 204: { description: 'Unretweeted' } } },
    },
    '/tweets/{id}/comments': {
      post: {
        summary: 'Add comment',
        tags: ['Comments'],
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['content'], properties: { content: { type: 'string' } } } } } },
        responses: { 201: { description: 'Comment created' } },
      },
      get: {
        summary: 'Get comments (paginated)',
        tags: ['Comments'],
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }, { in: 'query', name: 'limit', schema: { type: 'integer' } }, { in: 'query', name: 'offset', schema: { type: 'integer' } }],
        responses: { 200: { description: 'Comments list' } },
      },
    },
    '/comments/{id}': {
      delete: { summary: 'Delete comment (author only)', tags: ['Comments'], security: [{ bearerAuth: [] }], parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], responses: { 204: { description: 'Deleted' }, 403: { description: 'Forbidden' } } },
    },
    '/feed': {
      get: {
        summary: 'Get feed (cursor pagination)',
        tags: ['Feed'],
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'query', name: 'limit', schema: { type: 'integer', default: 50 } }, { in: 'query', name: 'cursor', description: 'Format: timestamp_id (e.g. 1700000000000_5)', schema: { type: 'string' } }],
        responses: { 200: { description: 'Feed with nextCursor' } },
      },
    },
  },
};

module.exports = {
  serve: swaggerUi.serve,
  setup: swaggerUi.setup(spec, { explorer: true }),
};
