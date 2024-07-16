import multer from "multer";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { NextFunction, Request, Response } from "express";

export const ScreenshotUpload = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const __dirname = path.resolve();

  let dir = path.join(__dirname, "screenshots");

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, dir);
    },

    filename: async (req, file, cb) => {
      const fileName = file.originalname
        .toLocaleLowerCase()
        .split(" ")
        .join("-");
      const savedFileName = `${uuidv4()}-${fileName}`;
      req.screenshot = savedFileName; // Set the saved file name to req.screenshot

      cb(null, savedFileName);
    },
  });

  const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
      if (
        file.mimetype == "image/png" ||
        file.mimetype == "image/jpg" ||
        file.mimetype == "image/jpeg" ||
        file.mimetype == "image/webp"
      ) {
        cb(null, true);
      } else {
        cb(null, false);
        return cb(
          new Error("Only .png, .jpg, .jpeg and .webp formats are allowed!")
        );
      }
    },
  }).single("screenshot");

  upload(req, res, (err) => {
    if (err) {
      console.log(err);
    } else {
      next();
    }
  });
};
