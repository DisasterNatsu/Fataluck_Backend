import { Request, Response } from "express";
import {
  BalanceSheet,
  FatafatGameNumber,
  LuckBazarGameNumber,
  OpenCloseGameNumber,
  Recharge,
  SmartMatkaGameNumber,
  User,
} from "../schema/MongoSchema";

export const PlaceBet = async (req: Request, res: Response) => {
  // Get necessary data from request's body
  const {
    mobileNo,
    gameData,
    baziType,
    baziNo,
    gameType,
    date,
  }: RequestBodyPlaceBet = req.body;

  if (!mobileNo || gameData.length === 0) {
    return res.status(400).json({ message: "Invalid request!" });
  }

  try {
    let currentGameNo;

    switch (gameType) {
      case "Fatafat":
        currentGameNo = await FatafatGameNumber.findOne({ date });
        break;

      case "SmartMatka":
        currentGameNo = await SmartMatkaGameNumber.findOne({ date });
        break;

      case "OpenClose":
        currentGameNo = await OpenCloseGameNumber.findOne({ date });
        break;

      case "LuckBazar":
        currentGameNo = await LuckBazarGameNumber.findOne({ date });
        break;

      default:
        return res.status(400).json({ message: "Game is not live yet!" });
        break;
    }

    if (!currentGameNo) {
      return res.status(400).json({ message: "Game is not live yet!" });
    }

    if (baziNo < currentGameNo.currentGameNumber) {
      return res
        .status(203)
        .json({ message: `The ${baziNo} bazi for ${gameType} has ended!` });
    }

    const userInDb = await User.findOne({ mobileNo });

    if (!userInDb || (userInDb.diamonds ?? 0) === 0) {
      return res.status(404).json({ message: "User not found!" });
    }

    const totalDiamond = gameData.reduce(
      (total, bet) => total + bet.bettingDiamond,
      0
    );

    const userDiamonds = userInDb.diamonds ?? 0;

    if (totalDiamond > userDiamonds) {
      return res.status(400).json({ message: "Insufficient diamonds!" });
    }

    // Create balance sheet entries
    const balanceSheetEntries = gameData.map((bet) => ({
      user: userInDb._id,
      diamond: bet.bettingDiamond,
      baziNo: baziNo,
      bettingNo: bet.bettingNumber,
      baziType: baziType,
      gameType: gameType,
    }));

    await BalanceSheet.insertMany(balanceSheetEntries);

    // Deduct the total diamonds used in bets from user's diamonds
    userInDb.diamonds = userDiamonds - totalDiamond;

    // Save the updated user information
    await userInDb.save();

    return res.status(200).json({ message: "Bet placed successfully!" });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Server Error", error });
  }
};

export const WithdrawRequest = async (req: Request, res: Response) => {
  const mobileNo = req.mobileNo;

  const { withdrawAmount, date }: { withdrawAmount: number; date: string } =
    req.body;

  if (!mobileNo || !withdrawAmount || !date) {
    return res.status(400).json({ message: "Bad Request!" });
  }

  try {
    const userInDb = await User.findOne({ mobileNo });

    if (!userInDb) return res.status(404).json({ message: "User not found!" });

    if ((userInDb.diamonds || 0) < withdrawAmount) {
      return res.status(403).json({ message: "Not enough diamonds!" });
    }

    const isRequestPresent = await Recharge.findOne({
      user: userInDb._id,
      date,
    });

    console.log({ isRequestPresent });

    if (isRequestPresent) {
      return res.status(203).json({
        message: `A withdraw request for ${date} is already present!`,
      });
    }

    const newWithDraw = new Recharge({
      date: date,
      diamond: withdrawAmount,
      recharge: false,
      user: userInDb._id,
    });

    userInDb.diamonds = (userInDb.diamonds || 0) - withdrawAmount;

    await newWithDraw.save();
    await userInDb.save();

    return res.status(200).json({ message: "Request Scubmitted!" });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Server error!", error });
  }
};

// Get Request

export const GetUserWithdrawRequest = async (req: Request, res: Response) => {
  const mobileNo = req.mobileNo;

  if (!mobileNo) return res.status(400).json({ message: "Bad Request!" });

  try {
    const userInDb = await User.findOne({ mobileNo });

    if (!userInDb) return res.status(404).json({ message: "User not found!" });

    const withdrawHistory = await Recharge.find({
      user: userInDb._id,
      recharge: false,
    }).sort({ createdAt: -1 });

    return res.status(200).json(withdrawHistory);
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Server Error!", error });
  }
};
