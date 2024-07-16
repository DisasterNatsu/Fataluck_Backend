import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import {
  Admin,
  BalanceSheet,
  LuckBazarData,
  OpenCloseData,
  Recharge,
  User,
} from "../schema/MongoSchema";
import { updateWinLossStatus } from "../helpers/UpdateWinLossStatus";
import { messaging } from "../firebase";
import { pattiChart } from "../helpers/PattiData";

export const addOrChangeUpi = async (req: Request, res: Response) => {
  const { upiID, payeeName } = req.body;

  const email = req.admin;

  if (!upiID || !email || !payeeName) {
    return res.status(400).json({ message: "Bad Request!" });
  }

  try {
    const adminInDb = await Admin.findOne({ email });

    if (!adminInDb) return res.status(404).json({ message: "No admin found!" });

    adminInDb.paymentUpi = upiID;
    adminInDb.payeeName = payeeName;

    await adminInDb.save();

    return res.status(200).json({ message: "UPI ID updated!" });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Server Error!", error });
  }
};

export const AssignCoins = async (req: Request, res: Response) => {
  const { id, mobileNo }: { id: string; mobileNo: string } = req.body;

  if (!id || !mobileNo) {
    return res.status(400).json({ message: "Invalid Request!" });
  }

  try {
    const user = await User.findOne({ mobileNo });

    if (!user) {
      return res
        .status(404)
        .json({ message: `No user with +${mobileNo} was found!` });
    }

    const transaction = await Recharge.findOne({ _id: id, user: user._id });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found!" });
    }

    transaction.status = "Approved";
    user.diamonds = (user.diamonds || 0) + transaction.diamond;

    await transaction.save();
    await user.save();

    await messaging.send({
      token: user.fcmToken,
      notification: {
        title: "Hurray!",
        body: `Your Recharge of ${transaction.diamond} is approved!`,
      },
      data: {
        navigationId: "Wallet",
      },
    });

    return res.status(200).json({ message: "Diamonds assigned successfully!" });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Error assigninng coins" });
  }
};

export const AssignCoinsWithoutRequest = async (
  req: Request,
  res: Response
) => {
  const {
    mobileNo,
    amount,
    date,
  }: { mobileNo: string; amount: number; date: string } = req.body;

  if (!mobileNo || !amount) {
    return res.status(400).json({ message: "Bad request!" });
  }

  try {
    const userInDb = await User.findOne({ mobileNo });

    if (!userInDb) return res.status(404).json({ message: "User not found!" });

    const newRecharge = new Recharge({
      user: userInDb._id,
      date: date,
      recharge: true,
      diamond: amount,
      status: "Approved",
    });

    userInDb.diamonds = (userInDb.diamonds || 0) + amount;

    await newRecharge.save();
    await userInDb.save();

    return res
      .status(200)
      .json({ message: "Diamonds Assigned", amount: amount });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Server Error!", error });
  }
};

export const DenyTransaction = async (req: Request, res: Response) => {
  const { id, mobileNo }: { id: string; mobileNo: string } = req.body;

  if (!id || !mobileNo) {
    return res.status(400).json({ message: "Invalid Request!" });
  }

  try {
    const user = await User.findOne({ mobileNo });

    if (!user) {
      return res
        .status(404)
        .json({ message: `No user with +${mobileNo} was found!` });
    }

    const transaction = await Recharge.findOne({ _id: id, user: user._id });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found!" });
    }

    transaction.status = "Denied";

    await transaction.save();

    return res.status(200).json({ message: "Updated Successfully!" });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Error assigninng coins" });
  }
};

export const PostFatafatWinLossSingleDigit = async (
  req: Request,
  res: Response
) => {
  const { baziNo, singleDigit, date, gameType, singlePanna }: PostWinLossType =
    req.body;

  if (baziNo > 7 || singleDigit > 9 || !date || !singlePanna) {
    return res.status(400).json({ message: "Bad Request!" });
  } else if (gameType !== "Fatafat") {
    return res.status(400).json({ message: "Invalid Game Type" });
  }

  try {
    await updateWinLossStatus(
      gameType,
      "Single Digit",
      date,
      baziNo,
      singleDigit,
      9
    );

    await updateWinLossStatus(
      gameType,
      "Single Panna",
      date,
      baziNo,
      singlePanna,
      100
    );

    return res.status(200).json({ message: "Result updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error!", error });
  }
};

export const PostSmartMatkaWinLoss = async (req: Request, res: Response) => {
  const { baziNo, gameType, singleDigit, date, singlePanna } = req.body;

  if (baziNo > 7 || !gameType || singleDigit > 9 || !date || !singlePanna) {
    return res.status(400).json({ message: "Bad Request!" });
  } else if (gameType !== "SmartMatka") {
    return res.status(400).json({ message: "Invalid Game Type" });
  }

  try {
    await updateWinLossStatus(
      gameType,
      "Single Digit",
      date,
      baziNo,
      singleDigit,
      9
    );

    await updateWinLossStatus(
      gameType,
      "Single Panna",
      date,
      baziNo,
      singlePanna,
      100
    );

    return res.status(200).json({ message: "Result updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error!", error });
  }
};

export const PostLuckBazarResult = async (req: Request, res: Response) => {
  const { baziNo, singleDigit, date, singlePanna, gameType }: PostWinLossType =
    req.body;

  if (baziNo > 3 || singleDigit > 9 || !date || !singlePanna) {
    return res.status(400).json({ message: "Bad Request!" });
  } else if (gameType !== "LuckBazar") {
    return res.status(400).json({ message: "Invalid Game Type" });
  }

  try {
    let existingData = await LuckBazarData.findOne({ date });

    if (!existingData) {
      existingData = new LuckBazarData({ date, data: [] });
    }

    const existingIndex = existingData.data.findIndex(
      (item) => item.index === baziNo
    );
    const data = {
      gameResultPatti: singlePanna,
      gameNumber: singleDigit,
      index: baziNo,
    };

    if (existingIndex !== -1) {
      existingData.data[existingIndex] = data;
    } else if (existingData.data.length < 4) {
      existingData.data.push(data);
    } else {
      return res.status(400).json({ message: "Invalid Request" });
    }

    existingData.data.sort((a, b) => a.index - b.index);
    await existingData.save();

    await updateWinLossStatus(
      gameType,
      "Single Digit",
      date,
      baziNo,
      singleDigit,
      9
    );
    await updateWinLossStatus(
      gameType,
      "Single Panna",
      date,
      baziNo,
      singlePanna,
      100
    );

    return res.status(200).json({ message: "Result updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error!", error });
  }
};

export const PostOpenCloseResult = async (req: Request, res: Response) => {
  const { baziNo, singleDigit, date, singlePanna, gameType }: PostWinLossType =
    req.body;

  if (baziNo < 0 || baziNo > 1 || singleDigit > 9 || !date || !singlePanna) {
    return res.status(400).json({ message: "Bad Request!" });
  } else if (gameType !== "OpenClose") {
    return res.status(400).json({ message: "Invalid Game Type" });
  }

  try {
    let existingData = await OpenCloseData.findOne({ date });

    if (!existingData) {
      existingData = new OpenCloseData({ date, data: [] });
    }

    const existingIndex = existingData.data.findIndex(
      (item) => item.index === baziNo
    );

    const data = {
      gameResultPatti: singlePanna,
      gameNumber: singleDigit,
      index: baziNo,
    };

    if (existingIndex !== -1) {
      existingData.data[existingIndex] = data;
    } else if (existingData.data.length < 2) {
      existingData.data.push(data);
    } else {
      return res.status(400).json({ message: "Invalid Request" });
    }

    existingData.data.sort((a, b) => a.index - b.index);
    await existingData.save();

    await updateWinLossStatus(
      gameType,
      "Single Digit",
      date,
      baziNo,
      singleDigit,
      9
    );
    await updateWinLossStatus(
      gameType,
      "Single Panna",
      date,
      baziNo,
      singlePanna,
      100
    );

    return res.status(200).json({ message: "Result updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error!", error });
  }
};

// Get Game Data and amount along with Users

export const getGameData = async (req: Request, res: Response) => {
  let { date, gameType, baziNo, baziType } = req.params;

  baziNo = JSON.parse(baziNo);
  baziType = baziType.split("-").join(" ");

  const gameTypeEnum = ["Fatafat", "SmartMatka", "OpenClose", "LuckBazar"];
  const baziTypeEnum = ["Single Digit", "Single Panna"];

  if (
    !date ||
    !gameTypeEnum.includes(gameType) ||
    !baziTypeEnum.includes(baziType)
  ) {
    return res.status(400).json({ message: "Invalid Request!" });
  }

  try {
    const bets = await BalanceSheet.find({
      date,
      gameType,
      baziNo,
      baziType,
      winLoss: undefined,
    }).populate<{ user: UserSchemaType }>("user", "mobileNo name");

    const result = bets.reduce<Record<number, AggregatedBet>>((acc, bet) => {
      const bettingNo = bet.bettingNo;
      if (!acc[bettingNo]) {
        acc[bettingNo] = {
          bettingNo,
          totalDiamond: 0,
          date: bet.date, // Add date to the aggregated object
          users: [],
        };
      }
      acc[bettingNo].totalDiamond += bet.diamond;
      acc[bettingNo].users.push({
        user: (bet.user as UserSchemaType).mobileNo,
        diamond: bet.diamond,
        name: (bet.user as UserSchemaType).name,
      });
      return acc;
    }, {});

    const formattedResult = Object.values(result).sort(
      (a, b) => a.bettingNo - b.bettingNo
    );

    return res.status(200).json(formattedResult);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error", error });
  }
};

// Get Game Patti Data and amount along with

export const GetPattiGameData = async (req: Request, res: Response) => {
  let { date, gameType, baziNo, baziType, bettingNo } = req.params;

  baziNo = JSON.parse(baziNo);
  baziType = baziType.split("-").join(" ");

  const gameTypeEnum = ["Fatafat", "SmartMatka", "OpenClose", "LuckBazar"];

  if (
    !date ||
    !gameTypeEnum.includes(gameType) ||
    baziType !== "Single Panna"
  ) {
    return res.status(400).json({ message: "Invalid Request!" });
  }

  try {
    // Convert bettingNo to number
    const bettingNoNumber = Number(bettingNo);

    if (isNaN(bettingNoNumber) || bettingNoNumber < 0 || bettingNoNumber > 9) {
      return res.status(400).json({ message: "Invalid bettingNo!" });
    }

    const array = pattiChart(bettingNoNumber);

    if (!array) {
      return res.status(400).json({ message: "Invalid bettingNo!" });
    }

    const result = await Promise.all(
      array.map(async (item) => {
        const bets = await BalanceSheet.find({
          date: date,
          gameType,
          baziType,
          bettingNo: item.value,
          winLoss: undefined,
        });

        const totalDiamond = bets.reduce((acc, bet) => acc + bet.diamond, 0);

        return { label: item.item, totalDiamond };
      })
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error", error });
  }
};

export const deleteUndefinedRecharges = async (req: Request, res: Response) => {
  const { date } = req.body;

  if (!date) return res.status(400).json({ message: "Bad Request" });

  try {
    const data: ItemRechargeType[] = await Recharge.find({
      date,
      recharge: true,
      status: "Pending",
    });

    if (data.length > 0) {
      const promise = data.map(
        async (item: ItemRechargeType, index: number) => {
          if (item.screenShot !== undefined) {
            const __dirname = path.resolve();
            const previousScreenShotPath = path.join(
              __dirname,
              item.screenShot
            );

            if (fs.existsSync(previousScreenShotPath)) {
              fs.rmSync(previousScreenShotPath);
            }

            item.screenShot = undefined;
          }
        }
      );

      await Promise.all(promise);
    }

    await Recharge.deleteMany({ date, recharge: true });

    return res.status(200).json({ message: "Success" });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Server Error!", error });
  }
};

export const getWinLossDataAdmin = async (req: Request, res: Response) => {
  const { date } = req.params;

  try {
    // Fetch the data from the database
    const data = await BalanceSheet.find({ date }).populate("user", "mobileNo");

    if (data.length === 0) {
      return res.status(200).json({ wins: [], loss: [] });
    }

    // Separate the data into win and loss arrays
    const wins = data.filter((item) => item.winLoss === true);
    const loss = data.filter((item) => item.winLoss === false);

    // Return the structured response
    return res.status(200).json({ wins, loss });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Server Error!", error });
  }
};
