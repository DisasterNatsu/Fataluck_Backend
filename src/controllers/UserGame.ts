import { Request, Response } from "express";
import { Admin, BalanceSheet, Recharge, User } from "../schema/MongoSchema";
import path from "path";
import fs from "fs";

// Get Functions

export const GetRechargeHistory = async (req: Request, res: Response) => {
  const mobileNo = req.mobileNo;

  try {
    const user = await User.findOne({ mobileNo });

    // If there are no user

    if (!user) return res.status(404).json({ message: "No user found!" });

    const userId = user._id;

    const history = await Recharge.find({ user: userId, recharge: true }).sort({
      date: "desc",
    });

    return res.status(200).json(history);
  } catch (error) {
    return res.status(500).json({ message: "Error Getting History", error });
  }
};

export const GetLiveGames = async (req: Request, res: Response) => {
  // from middleware
  const mobileNo = req.mobileNo;

  // date from req.params

  const { date } = req.params;

  if (!mobileNo || !date)
    return res.status(400).json({ message: "Invalid Request!" });

  try {
    const userInDb = await User.findOne({ mobileNo });

    if (!userInDb) {
      return res.status(404).json({ message: "User not found!" });
    }

    const data = await BalanceSheet.find({
      date,
      user: userInDb._id,
      winLoss: undefined,
    });

    return res.status(200).json(data);
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Server Error", error });
  }
};

export const GetWinandLosses = async (req: Request, res: Response) => {
  // from middleware
  const mobileNo = req.mobileNo;

  if (!mobileNo) return res.status(400).json({ message: "Bad Request!" });

  try {
    const userInDb = await User.findOne({ mobileNo });

    if (!userInDb) return res.status(404).json({ message: "User not found!" });

    const allBets = await BalanceSheet.find({
      user: userInDb._id,
      winLoss: { $ne: undefined },
    }).sort({ date: "desc" });

    return res.status(200).json(allBets);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error", error });
  }
};

export const GetFatafatBetHistory = async (req: Request, res: Response) => {
  // from middleware
  const mobileNo = req.mobileNo;

  if (!mobileNo) return res.status(400).json({ message: "Bad Request!" });

  try {
    const userInDb = await User.findOne({ mobileNo });

    if (!userInDb) return res.status(404).json({ message: "User not found!" });

    const allBets = await BalanceSheet.find({
      user: userInDb._id,
      gameType: "Fatafat",
      winLoss: { $ne: undefined },
    }).sort({ date: "desc" });

    return res.status(200).json(allBets);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error", error });
  }
};

export const GetSmartMatkaBetHistory = async (req: Request, res: Response) => {
  // from middleware
  const mobileNo = req.mobileNo;

  if (!mobileNo) return res.status(400).json({ message: "Bad Request!" });

  try {
    const userInDb = await User.findOne({ mobileNo });

    if (!userInDb) return res.status(404).json({ message: "User not found!" });

    const allBets = await BalanceSheet.find({
      user: userInDb._id,
      gameType: "SmartMatka",
      winLoss: { $ne: undefined },
    }).sort({ date: "desc" });

    return res.status(200).json(allBets);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error", error });
  }
};

export const GetOpenCloseBetHistory = async (req: Request, res: Response) => {
  // from middleware
  const mobileNo = req.mobileNo;

  if (!mobileNo) return res.status(400).json({ message: "Bad Request!" });

  try {
    const userInDb = await User.findOne({ mobileNo });

    if (!userInDb) return res.status(404).json({ message: "User not found!" });

    const allBets = await BalanceSheet.find({
      user: userInDb._id,
      gameType: "OpenClose",
      winLoss: { $ne: undefined },
    }).sort({ date: "desc" });

    return res.status(200).json(allBets);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error", error });
  }
};

export const GetLuckBazarBetHistory = async (req: Request, res: Response) => {
  // from middleware
  const mobileNo = req.mobileNo;

  if (!mobileNo) return res.status(400).json({ message: "Bad Request!" });

  try {
    const userInDb = await User.findOne({ mobileNo });

    if (!userInDb) return res.status(404).json({ message: "User not found!" });

    const allBets = await BalanceSheet.find({
      user: userInDb._id,
      gameType: "LuckBazar",
      winLoss: { $ne: undefined },
    }).sort({ date: "desc" });

    return res.status(200).json(allBets);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error", error });
  }
};

export const GetSingleDigits = async (req: Request, res: Response) => {
  const mobileNo = req.mobileNo;

  const { date, gameType, baziNo } = req.params;

  try {
    const userInDb = await User.findOne({ mobileNo });

    if (!userInDb) return res.status(404).json({ message: "User not found!" });

    const singleDigitBets = await BalanceSheet.find({
      user: userInDb._id,
      gameType: gameType,
      date,
      baziNo,
    });

    if (singleDigitBets.length > 0) {
      return res.status(200).json(singleDigitBets);
    } else {
      return res.status(200).json(null);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error", error });
  }
};

export const GetUpiId = async (req: Request, res: Response) => {
  try {
    const admin = await Admin.findOne({ email: "shilajitdutta44@gmail.com" });

    if (!admin) return res.status(404).json({ message: "No admin found!" });

    const upiID = admin.paymentUpi;
    const payeeName = admin.payeeName;

    return res.status(200).json({ upiID, payeeName });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error", error });
  }
};

// Post Functions

export const RequestRecharge = async (req: Request, res: Response) => {
  const { diamond, date } = req.body;

  const mobileNo = req.mobileNo;

  if (!diamond || !date)
    return res.status(400).json({ message: "Bad request!" });

  try {
    const userInDb = await User.findOne({ mobileNo });

    if (!userInDb) return res.status(404);

    const newRecharge = new Recharge({
      user: userInDb._id,
      date: date,
      diamond: diamond,
      status: "Pending",
      recharge: true,
    });

    const savedRecharge = await newRecharge.save();

    return res.status(200).json(savedRecharge);
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Server error!", error });
  }
};

export const addScreenShot = async (req: Request, res: Response) => {
  const path = "/screenshots/" + req.screenshot;

  const { id } = req.body;

  if (!id) return res.status(400).json({ message: "Bad Request!" });

  try {
    const rechargeInDb = await Recharge.findOne({ _id: id });

    if (!rechargeInDb)
      return res.status(404).json({ message: "Recharge Not Found!" });

    rechargeInDb.screenShot = path;

    await rechargeInDb.save();

    return res.status(200).json({ message: "Screenshot Uploaded Succefully" });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Server error!", error });
  }
};

export const replaceScreenShot = async (req: Request, res: Response) => {
  const { id } = req.body;

  const screenShot = req.screenshot;

  if (!id || !screenShot)
    return res.status(400).json({ message: "Bad Request!" });

  try {
    const rechargeInDb = await Recharge.findOne({ _id: id });

    if (!rechargeInDb) {
      return res.status(404).json({ message: "Recharge Not Found!" });
    }

    if (rechargeInDb.screenShot) {
      const __dirname = path.resolve();
      const previousScreenShotPath = path.join(
        __dirname,
        rechargeInDb.screenShot
      );

      if (fs.existsSync(previousScreenShotPath)) {
        fs.rmSync(previousScreenShotPath);
      }
    }
    rechargeInDb.screenShot = "/screenshots/" + req.screenshot;

    await rechargeInDb.save();

    return res
      .status(200)
      .json({ message: "Screenshot Replaced Successfully" });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Server error!", error });
  }
};

export const RequestWithdraw = async (req: Request, res: Response) => {
  const { diamonds, date } = req.body;

  const mobileNo = req.mobileNo;

  if (!diamonds || !mobileNo)
    return res.status(400).json({ message: "Bad Request!" });

  try {
    const userInDb = await User.findOne({ mobileNo });

    if (!userInDb) return res.status(404).json({ message: "No user found!" });

    if (userInDb.diamonds !== undefined && userInDb.diamonds < diamonds) {
      return res.status(403).json({ message: "Not enough diamonds!" });
    }

    const ifThereAwithdarwToday = await Recharge.findOne({
      user: userInDb._id,
      recharge: false,
      date,
    });

    if (ifThereAwithdarwToday) {
      return res
        .status(203)
        .json({ message: "One Withdraw Request allowed per day!" });
    }

    const newWithdraw = new Recharge({
      user: userInDb._id,
      recharge: false,
    });

    await newWithdraw.save();

    return res.status(200).json({ message: "Request Submitted!" });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Server Error!", error });
  }
};
