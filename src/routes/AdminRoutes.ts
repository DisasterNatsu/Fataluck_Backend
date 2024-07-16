import express from "express";
import {
  AdminLogIn,
  AdminRegister,
  AdminTokenVerification,
} from "../controllers/AdminAuth";
import {
  postFatafatGameNo,
  postLuckBazarGameNo,
  postOpenCloseGameNo,
  postSmartMatkaGameNo,
} from "../controllers/GameData";
import { AdminTokenMiddleware } from "../middleware/AdminTokenAuth";
import { sendResultNotification } from "../controllers/Notifications";
import {
  addOrChangeUpi,
  AssignCoins,
  AssignCoinsWithoutRequest,
  deleteUndefinedRecharges,
  getGameData,
  GetPattiGameData,
  getWinLossDataAdmin,
  PostFatafatWinLossSingleDigit,
  PostLuckBazarResult,
  PostOpenCloseResult,
  PostSmartMatkaWinLoss,
} from "../controllers/AdminGame";
import {
  GetAllRechargeRequests,
  GetAllUsers,
  getAllWithdrawRequests,
} from "../controllers/AdminBet";

const Router = express.Router();

Router.post("/register", AdminRegister);
Router.post("/log-in", AdminLogIn);
Router.post("/ff-game-number", AdminTokenMiddleware, postFatafatGameNo);
Router.post("/sm-game-number", AdminTokenMiddleware, postSmartMatkaGameNo);
Router.post("/oc-game-number", AdminTokenMiddleware, postOpenCloseGameNo);
Router.post("/lb-game-number", AdminTokenMiddleware, postLuckBazarGameNo);
Router.post(
  "/send-results-notification",
  AdminTokenMiddleware,
  sendResultNotification
);
Router.post("/update-upi-id", AdminTokenMiddleware, addOrChangeUpi);
Router.post("/assign-coins", AdminTokenMiddleware, AssignCoins);
Router.post(
  "/assign-coin-without-request",
  AdminTokenMiddleware,
  AssignCoinsWithoutRequest
);
Router.post(
  "/post-fatafat-winloss",
  AdminTokenMiddleware,
  PostFatafatWinLossSingleDigit
);
Router.post(
  "/post-smartMatka-winloss",
  AdminTokenMiddleware,
  PostSmartMatkaWinLoss
);
Router.post(
  "/post-luckBazar-winloss",
  AdminTokenMiddleware,
  PostLuckBazarResult
);
Router.post(
  "/post-openClose-winloss",
  AdminTokenMiddleware,
  PostOpenCloseResult
);
Router.post(
  "/delete-unresolved-recharges",
  AdminTokenMiddleware,
  deleteUndefinedRecharges
);

// Get Routes

Router.get(
  "/get-game-data/:date/:gameType/:baziNo/:baziType",
  AdminTokenMiddleware,
  getGameData
);
Router.get(
  "/get-patti-game-data/:date/:gameType/:baziNo/:baziType/:bettingNo",
  AdminTokenMiddleware,
  GetPattiGameData
);

Router.get("/check-auth", AdminTokenVerification);
Router.get(
  "/all-withdraw-requests/:date",
  AdminTokenMiddleware,
  getAllWithdrawRequests
);
Router.get(
  "/all-recharge-requests/:date",
  AdminTokenMiddleware,
  GetAllRechargeRequests
);
Router.get("/get-all-users", AdminTokenMiddleware, GetAllUsers);
Router.get("/win-loss/:date", AdminTokenMiddleware, getWinLossDataAdmin);

export default Router;
