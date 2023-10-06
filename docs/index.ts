import swagger, { SwaggerOptions } from 'swagger-ui-express';
import { Router } from 'express';

import schemas from './schemas';
import paths from './paths';
import defaultVars from '../src/config/defaultVars';

const { serve, setup } = swagger;

const swaggerRouter = Router();
const options : SwaggerOptions = {
  openapi: '3.0.0',
  info: {
    title: 'E-Leaning Management system',
    version: '1.0.0',
    description:
      'This is the API documentation for the routes and endpoint for the E-Leaning managemnet System.',
    contact: {
      name: 'LMS',
      'x-github': 'https://github.com/Aimeana100/Learning-Management-system'
    }
  },
  api: `http://localhost:${ defaultVars.port || 8000}`,
  security: [{ beaeAuth: [] }],
  components: {
    schemas,
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  paths
};

swaggerRouter.use('/docs', serve, setup(options));

export default swaggerRouter;