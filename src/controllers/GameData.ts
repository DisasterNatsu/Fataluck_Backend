import { Request, Response } from "express";
import {
  OpenCloseGameNumber,
  FatafatGameNumber,
  SmartMatkaGameNumber,
  LuckBazarGameNumber,
  OpenCloseData,
  LuckBazarData,
} from "../schema/MongoSchema";

export const getFataFatGameNo = async (req: Request, res: Response) => {
  const { date } = req.params;

  try {
    const getLiveGame = await FatafatGameNumber.findOne({ date });

    if (!getLiveGame) {
      return res
        .status(200)
        .json({ message: "No game found for the provided date", live: false });
    } else {
      return res.status(200).json({ getLiveGame, live: true });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", live: false });
  }
};

export const getSmartMatkaGameNo = async (req: Request, res: Response) => {
  const { date } = req.params;

  try {
    const getLiveGame = await SmartMatkaGameNumber.findOne({ date });

    if (!getLiveGame) {
      return res
        .status(200)
        .json({ message: "No game found for the provided date", live: false });
    } else {
      return res.status(200).json({ getLiveGame, live: true });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", live: false });
  }
};

export const getOpenCloseGameNo = async (req: Request, res: Response) => {
  const { date } = req.params;

  try {
    const getLiveGame = await OpenCloseGameNumber.findOne({ date });

    if (!getLiveGame) {
      return res
        .status(200)
        .json({ message: "No game found for the provided date", live: false });
    } else {
      return res.status(200).json({ getLiveGame, live: true });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", live: false });
  }
};

export const getLuckBazarGameNo = async (req: Request, res: Response) => {
  const { date } = req.params;

  try {
    const getLiveGame = await LuckBazarGameNumber.findOne({ date });

    if (!getLiveGame) {
      return res
        .status(200)
        .json({ message: "No game found for the provided date", live: false });
    } else {
      return res.status(200).json({ getLiveGame, live: true });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", live: false });
  }
};

// Get open Close current Day Result

export const getOpenCloseData = async (req: Request, res: Response) => {
  const date: string = req.params.date;

  console.log(date);

  try {
    let data = await OpenCloseData.findOne({ date });

    if (!data) return res.status(200).json(null);

    return res.status(200).json(data);
  } catch (error) {
    console.error(error);

    return res.status(500).json({ message: "Server error" });
  }
};

// get previous open close results

export const getOpenClosePrevious = async (req: Request, res: Response) => {
  try {
    // Fetch the last ten records excluding the current day
    const lastTen = await OpenCloseData.find().sort({ createdAt: -1 });

    return res.status(200).json(lastTen);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error while finding the data", error });
  }
};

// Get Luck Bazar Current Day Data

export const getLuckBazarData = async (req: Request, res: Response) => {
  const date: string = req.params.date;

  try {
    let data = await LuckBazarData.findOne({ date });

    if (!data) return res.status(200).json(null);

    return res.status(200).json(data);
  } catch (error) {
    console.error(error);

    return res.status(500).json({ message: "Server error" });
  }
};

// Get Luck Bazar previous result

export const getLuckBazarPrevious = async (req: Request, res: Response) => {
  try {
    // Fetch the last ten records excluding the current day
    const lastTen = await LuckBazarData.find().sort({ createdAt: -1 });

    return res.status(200).json(lastTen);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error while finding the data", error });
  }
};

// post requests for admin

export const postFatafatGameNo = async (req: Request, res: Response) => {
  const { date, gameNo } = req.body;

  if (!date || gameNo < 0) {
    return res.status(400).json({ message: "Invalid Request!" });
  }

  try {
    // since we do not need to store previous tips let find them by date

    const previousDayGameNo = await FatafatGameNumber.find({
      date: { $ne: date },
    });

    if (previousDayGameNo.length > 0) {
      await FatafatGameNumber.deleteMany({ date: { $ne: date } });
    }

    let existingDateinDb = await FatafatGameNumber.findOne({ date });

    if (existingDateinDb) {
      existingDateinDb.currentGameNumber = gameNo;
    } else {
      existingDateinDb = new FatafatGameNumber({
        open: true,
        currentGameNumber: gameNo,
        date: date,
      });
    }

    const updatedData = await existingDateinDb.save();

    return res.status(200).json(updatedData);
  } catch (error) {
    console.log(error);

    return res
      .status(500)
      .json({ message: "Something happened while posting game No" });
  }
};

export const postSmartMatkaGameNo = async (req: Request, res: Response) => {
  const { date, gameNo } = req.body;

  if (!date || gameNo < 0) {
    return res.status(400).json({ message: "Invalid Request!" });
  }

  try {
    // since we do not need to store previous tips let find them by date

    const previousDayGameNo = await SmartMatkaGameNumber.find({
      date: { $ne: date },
    });

    if (previousDayGameNo.length > 0) {
      await SmartMatkaGameNumber.deleteMany({ date: { $ne: date } });
    }

    let existingDateinDb = await SmartMatkaGameNumber.findOne({ date });

    if (existingDateinDb) {
      existingDateinDb.currentGameNumber = gameNo;
    } else {
      existingDateinDb = new SmartMatkaGameNumber({
        open: true,
        currentGameNumber: gameNo,
        date: date,
      });
    }

    const updatedData = await existingDateinDb.save();

    return res.status(200).json(updatedData);
  } catch (error) {
    console.log(error);

    return res
      .status(500)
      .json({ message: "Something happened while posting game No" });
  }
};

export const postOpenCloseGameNo = async (req: Request, res: Response) => {
  const { date, gameNo } = req.body;

  if (!date || gameNo < 0) {
    return res.status(400).json({ message: "Invalid Request!" });
  }

  try {
    // since we do not need to store previous tips let find them by date

    const previousDayGameNo = await OpenCloseGameNumber.find({
      date: { $ne: date },
    });

    if (previousDayGameNo.length > 0) {
      await OpenCloseGameNumber.deleteMany({ date: { $ne: date } });
    }

    let existingDateinDb = await OpenCloseGameNumber.findOne({ date });

    if (existingDateinDb) {
      existingDateinDb.currentGameNumber = gameNo;
    } else {
      existingDateinDb = new OpenCloseGameNumber({
        open: true,
        currentGameNumber: gameNo,
        date: date,
      });
    }

    const updatedData = await existingDateinDb.save();

    return res.status(200).json(updatedData);
  } catch (error) {
    console.log(error);

    return res
      .status(500)
      .json({ message: "Something happened while posting game No" });
  }
};

export const postLuckBazarGameNo = async (req: Request, res: Response) => {
  const { date, gameNo } = req.body;

  if (!date || gameNo < 0) {
    return res.status(400).json({ message: "Invalid Request!" });
  }

  try {
    // since we do not need to store previous tips let find them by date

    const previousDayGameNo = await LuckBazarGameNumber.find({
      date: { $ne: date },
    });

    if (previousDayGameNo.length > 0) {
      await LuckBazarGameNumber.deleteMany({ date: { $ne: date } });
    }

    let existingDateinDb = await LuckBazarGameNumber.findOne({ date });

    if (existingDateinDb) {
      existingDateinDb.currentGameNumber = gameNo;
    } else {
      existingDateinDb = new LuckBazarGameNumber({
        open: true,
        currentGameNumber: gameNo,
        date: date,
      });
    }

    const updatedData = await existingDateinDb.save();

    return res.status(200).json(updatedData);
  } catch (error) {
    console.log(error);

    return res
      .status(500)
      .json({ message: "Something happened while posting game No" });
  }
};
