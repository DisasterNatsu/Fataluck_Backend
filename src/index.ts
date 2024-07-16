import express from "express";
import type { Express } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";

import UserRoutes from "./routes/UserRoutes";
import AdminRoutes from "./routes/AdminRoutes";

import { messaging } from "./firebase";

// initialize express app

const app: Express = express();

// initiate enviornment variable

dotenv.config();

// body parser

app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

// express json

app.use(express.json());

// use cors (currently it's global)

// define origins

const origins: string[] = [
  "https://kolkataff.space",
  "https://admin.kolkataff.space",
  "http://localhost:3000",
];

const corsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (error: Error | null, allow?: boolean) => void
  ) {
    if (!origin || origins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  optionsSuccessStatus: 200,
};

app.options("*", cors(corsOptions));

app.use(cors(corsOptions));

// static

app.use("/screenshots", express.static("./screenshots"));

// routes

app.use("/users", UserRoutes);
app.use("/admin", AdminRoutes);

// temporary tests

const sendNotification = async () => {
  try {
    await messaging.send({
      token:
        "eSVwfSEeSimECeCI1EIiwS:APA91bGz55AypWwops1phWjcog3jVI20xSoktt8U8h82YKF3fPWfdVFoyXJz-zYSqpTAIFUDI-rZbNh6lF0MRFb1rg6uV5hMjVhWsm5KhJcxWamAUnJ2Lx8rYFTTlKI2sPZUK74q7Z7p",
      notification: {
        title: "Fataluck",
        body: "Momo Khanki sobar luck fatabe",
      },
    });
    console.log("Success");
  } catch (error) {
    console.log(error);
  }
};

try {
  mongoose
    .connect(
      "mongodb://MumbaiMatkaAdmin:Disaster%401997@localhost:27017/mumbaiMatka"
    )
    .then(() => console.log("Connected to database"));

  // listen

  app.listen(process.env.PORT || 8080, () =>
    console.log(`Listning on port ${process.env.PORT || 8080}`)
  );
} catch (error) {
  console.log(error);
}
