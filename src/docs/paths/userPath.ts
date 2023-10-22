const baseResponses = {
  200: {
    description: 'created'
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
  404: {
    description: 'Not found'
  },
  409: {
    description: 'Conflict'
  },
  500: {
    description: 'Internal Server Error'
  }
};

export default {
  '/api/v1/user/register': {
    post: {
      tags: ['Auth'],
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
  '/api/v1/user/login': {
    post: {
      tags: ['Auth'],
      description: 'User Login',
      security: [],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/User'
            },
            example: {
              email: 'user@user.org',
              password: '12345678'
            }
          }
        },
        required: true
      },
      responses: baseResponses
    }
  },

  '/api/v1/user/logout': {
    post: {
      tags: ['Auth'],
      description: 'User Login',
      security: [],
      requestBody: {},
      responses: baseResponses
    }
  },

  '/api/v1/user/activate-user': {
    post: {
      tags: ['Auth'],
      description: 'Activate User',
      security: [],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/User'
            },
            example: {
              activation_code: '0000',
              activation_token: 'token'
            }
          }
        },
        required: true
      },
      responses: baseResponses
    }
  },
  '/api/v1/user/refresh': {
    post: {
      tags: ['Auth'],
      description: 'Refresh Tokens',
      security: [],
      requestBody: {},
      responses: baseResponses
    }
  },

  '/api/v1/user/me': {
    get: {
      tags: ['Auth'],
      description: 'User info',
      security: [],
      requestBody: {},
      responses: baseResponses
    }
  },

  '/api/v1/user/social-auth': {
    post: {
      tags: ['Auth'],
      description: 'User info',
      security: [],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/User'
            },
            example: {
              name: 'Ana10',
              email: 'aimenathole@gmail.com',
              avatar: ''
            }
          }
        },
        required: true
      },
      responses: baseResponses
    }
  },
  '/api/v1/user/update-info': {
    post: {
      tags: ['Auth'],
      description: 'Update info',
      security: [],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/User'
            },
            example: {
              name: 'Ana10',
              email: 'aimenathole1@gmail.com',
            }
          }
        },
      },
      responses: baseResponses
    }
  },
  '/api/v1/user/update-user-password': {
    put: {
      tags: ['Auth'],
      description: 'Update User Password',
      security: [],
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                oldPassword: {
                  type: 'string',
                  required: true,
                },
                newPassword: {
                  type: 'string',
                  required: true,
                }
                
              }
          }
        },
      },
      responses: baseResponses
    }
  }
},

  '/api/v1/user/update-user-avatar': {
    put: {
      tags: ['User'],
      description: 'Update User Avatar',
      security: [],
      requestBody: {
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties:{
                avatar: {
                  type : 'string',
                  format: 'binary',
                  required: true
                }
              }
            },
            
          }
        },
      },
      responses: baseResponses
    }
  }
};
