import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../utils/errorHandler";
import httpStatus from "http-status";

export const errorMiddlware = (
  err: ErrorHandler | any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.status = err.status || 500;
  err.message = err.message || " Internal Server Error";

  // wrong Mongodb id error

  if (err.name === "CastError") {
    const message = `Resource not found: ${req.path}`;
    err = new ErrorHandler(message, httpStatus.NOT_FOUND);
  }

  // duplicate key error
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
    err = new ErrorHandler(message, httpStatus.BAD_REQUEST);
  }

  // wrong jwt error
  if (err.name === "JsnWebTokenError") {
    const message = "Invalid token";
    err = new ErrorHandler(message, httpStatus.UNAUTHORIZED);
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token has expired";
    err = new ErrorHandler(message, httpStatus.UNAUTHORIZED);
  }

  res.status(err.status).json({
    status: "failed",
    message: err.message,
  });
};
