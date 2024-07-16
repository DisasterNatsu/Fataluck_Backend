// express.d.ts

import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      admin?: string;
      mobileNo?: string;
      screenshot?: string;
    }
  }
}
