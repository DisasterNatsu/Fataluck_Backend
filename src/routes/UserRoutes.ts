import express from "express";
import {
  LogIn,
  OTPVerifcation,
  PostBankDetails,
  PostUpiDetails,
  Register,
  ResetPassword,
  UserTokenVerification,
} from "../controllers/UserAuth";
import {
  getFataFatGameNo,
  getLuckBazarData,
  getLuckBazarGameNo,
  getLuckBazarPrevious,
  getOpenCloseData,
  getOpenCloseGameNo,
  getOpenClosePrevious,
  getSmartMatkaGameNo,
} from "../controllers/GameData";
import { CreateNewTicket, GetTickets } from "../controllers/UserTickets";
import { UserTokenMiddleware } from "../middleware/UserTokenAuth";
import {
  addScreenShot,
  GetFatafatBetHistory,
  GetLiveGames,
  GetLuckBazarBetHistory,
  GetOpenCloseBetHistory,
  GetRechargeHistory,
  GetSingleDigits,
  GetSmartMatkaBetHistory,
  GetUpiId,
  GetWinandLosses,
  replaceScreenShot,
  RequestRecharge,
} from "../controllers/UserGame";
import {
  GetUserWithdrawRequest,
  PlaceBet,
  WithdrawRequest,
} from "../controllers/UserBet";
import { ScreenshotUpload } from "../middleware/ScreenshotUpload";

const Router = express.Router();

Router.post("/register", Register);
Router.post("/log-in", LogIn);
Router.post("/verify-otp-register", OTPVerifcation);
Router.post("/reset-password", ResetPassword);
Router.post("/new-ticket", UserTokenMiddleware, CreateNewTicket);
Router.post("/place-bet", UserTokenMiddleware, PlaceBet);
Router.post("/add-bank-details", UserTokenMiddleware, PostBankDetails);
Router.post("/post-upi-details", UserTokenMiddleware, PostUpiDetails);
Router.post("/request-recharge", UserTokenMiddleware, RequestRecharge);
Router.post(
  "/upload-recharge-screenshot",
  UserTokenMiddleware,
  ScreenshotUpload,
  addScreenShot
);
Router.post(
  "/replace-screenshot",
  UserTokenMiddleware,
  ScreenshotUpload,
  replaceScreenShot
);
Router.post("/withdraw-request", UserTokenMiddleware, WithdrawRequest);

// Get routes

Router.get("/get-upi-id", UserTokenMiddleware, GetUpiId);
Router.get("/get-recharge-history", UserTokenMiddleware, GetRechargeHistory);
Router.get(
  "/get-withdraw-history",
  UserTokenMiddleware,
  GetUserWithdrawRequest
);
Router.get("/get-win-loss-history", UserTokenMiddleware, GetWinandLosses);
Router.get("/get-fatafat-data", UserTokenMiddleware, GetFatafatBetHistory);
Router.get("/get-open-close-data", UserTokenMiddleware, GetOpenCloseBetHistory);
Router.get("/get-luck-bazar-data", UserTokenMiddleware, GetLuckBazarBetHistory);
Router.get(
  "/get-smart-matka-data",
  UserTokenMiddleware,
  GetSmartMatkaBetHistory
);
Router.get("/get-live-data/:date", UserTokenMiddleware, GetLiveGames);
Router.get(
  "/get-single-digits/:date/:gameType/:baziNo",
  UserTokenMiddleware,
  GetSingleDigits
);
Router.get("/get-tickets", UserTokenMiddleware, GetTickets);
Router.get("/is-user-auth", UserTokenVerification);
Router.get("/get-oc-data/:date", getOpenCloseData);
Router.get("/get-lb-data/:date", getLuckBazarData);
Router.get("/get-prev-oc-data", getOpenClosePrevious);
Router.get("/get-prev-lb-data", getLuckBazarPrevious);
Router.get("/get-current-ff-game/:date", getFataFatGameNo);
Router.get("/get-current-sm-game/:date", getSmartMatkaGameNo);
Router.get("/get-current-oc-game/:date", getOpenCloseGameNo);
Router.get("/get-current-lb-game/:date", getLuckBazarGameNo);

export default Router;
