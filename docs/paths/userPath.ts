
const baseResponses = {
  200: {
    description: 'User created'
  },
  400: {
    description: 'Bad request'
  },
  401: {
    description: 'Unauthorized'
  },
  403: {
    description: 'Forbiden'
  },
  409: {
    description: 'Conflict'
  },
  500: {
    description: 'Internal Server Error'
  }
}

export default {
    '/api/v1/user/register': {
      post: {
        tags: ['User'],
        description: 'Create User',
        security: [],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/User'
              },
              example: {
                email: 'user@user.org',
                name: 'John',
                password: '12345678'
              }
            }
          },
          required: true
        },
        responses: baseResponses
      }
    },
    '/api/v1/user/activate-user': {
      post: {
        tags: ['User'],
        description: 'Create User',
        security: [],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/User'
              },
              example: {
                activation_code: '0000',
                activation_token: 'token',
              }
            }
          },
          required: true
        },
        responses: baseResponses

      }
    },
}