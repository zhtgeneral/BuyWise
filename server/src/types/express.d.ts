import { CustomJwtPayload } from '../types/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: CustomJwtPayload;
    }
  }
} 