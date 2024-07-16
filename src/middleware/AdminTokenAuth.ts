import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const AdminTokenMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("fataluck-admin-token");

  if (!token) return res.status(403).json({ message: "Unauthorised" });

  try {
    // it returns the issuedAt, ExpiresAt and the email used to sign it | if not a valid token, it will trigger the catch block

    const isAuth = jwt.verify(
      token,
      process.env.ADMIN_JWT_SECRET!
    ) as TokenVerifyType;

    req.admin = isAuth.email; // send it as req.admin

    next();
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something happened when verifying admin data", error });
  }
};
