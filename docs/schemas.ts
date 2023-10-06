export default {
    User: {
      type: 'object',
  
      properties: {
        id: {
          type: 'string',
          description: 'The auto-generated PK id'
        },
        name: {
          type: 'string',
          description: "User's last name"
        },
        email: {
          type: 'string',
          description: "User's email"
        },
        password: {
          type: 'string',
          description: "User's password (autogenerated)"
        },
      }
    }
}