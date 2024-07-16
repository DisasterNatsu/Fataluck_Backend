import { Request, Response } from "express";
import { Admin, Recharge, User } from "../schema/MongoSchema";

// Get Requests

export const getAllWithdrawRequests = async (req: Request, res: Response) => {
  const { date } = req.params;

  const email = req.admin;

  if (!date || !email) {
    return res.status(400).json({ message: "Bad Request!" });
  }

  try {
    const allWithdrawRequest = await Recharge.find({
      date,
      recharge: false,
      status: "Pending",
    }).sort({ createdAt: -1 });

    if (allWithdrawRequest.length === 0)
      return res.status(200).json(allWithdrawRequest);

    const dataArray: RechargeWithdrawType[] = [];

    const promise = allWithdrawRequest.map(async (item) => {
      const userInDb = await User.findOne({ _id: item.user });

      const data = {
        _id: item._id,
        name: userInDb?.name,
        mobileNo: userInDb?.mobileNo,
        diamond: item.diamond,
        date: item.date,
        recharge: item.recharge,
        status: item.status,
        createdAt: item.createdAt,
        screenshot: item.screenShot ? item.screenShot : undefined,
      };

      dataArray.push(data);
    });

    await Promise.all(promise);

    return res.status(200).json(dataArray);
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Server Error", error });
  }
};

export const GetAllRechargeRequests = async (req: Request, res: Response) => {
  const { date } = req.params;

  const email = req.admin;

  if (!date || !email) {
    return res.status(400).json({ message: "Bad Request!" });
  }

  try {
    const allRechargeRequest = await Recharge.find({
      date,
      recharge: true,
      status: "Pending",
    }).sort({ createdAt: -1 });

    if (allRechargeRequest.length === 0)
      return res.status(200).json(allRechargeRequest);

    const dataArray: RechargeWithdrawType[] = [];

    const promise = allRechargeRequest.map(async (item) => {
      const userInDb = await User.findOne({
        _id: item.user,
      });

      const data = {
        _id: item._id,
        name: userInDb?.name,
        mobileNo: userInDb?.mobileNo,
        diamond: item.diamond,
        date: item.date,
        recharge: item.recharge,
        status: item.status,
        createdAt: item.createdAt,
        screenshot: item.screenShot ? item.screenShot : undefined,
      };

      dataArray.push(data);
    });

    await Promise.all(promise);

    return res.status(200).json(dataArray);
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Server Error", error });
  }
};

export const GetAllUsers = async (req: Request, res: Response) => {
  const email = req.admin;

  try {
    const adminInDb = await Admin.findOne({ email }).sort({ date: -1 });

    if (!adminInDb) {
      return res.status(404).json({ message: "Unauthorized!" });
    }

    const allUsers = await User.find();

    return res.status(200).json(allUsers);
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Server error!", error });
  }
};

// Post Request

export const postWithdrawUpdateApproved = async (
  req: Request,
  res: Response
) => {
  const screenShot = req.screenshot;
  const { id, date } = req.body;

  if (!id || !date) {
    return res.status(400).json({ message: "Bad Request!" });
  }

  try {
    const withdrawData = await Recharge.findOne({
      _id: id,
      date,
      recharge: false,
    });

    if (!withdrawData)
      return res.status(404).json({ message: "Can't find request!" });

    withdrawData.screenShot = "/screenshots/" + screenShot;
    withdrawData.status = "Approved";

    await withdrawData.save();

    return res.status(200).json({ message: "Updated Successfully!" });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Server Error!", error });
  }
};

export const postWithdrawUpdateDenied = async (req: Request, res: Response) => {
  const { id, date } = req.body;

  if (!id || !date) {
    return res.status(400).json({ message: "Bad Request!" });
  }

  try {
    const withdrawData = await Recharge.findOne({
      _id: id,
      date,
      recharge: false,
    });

    if (!withdrawData)
      return res.status(404).json({ message: "Can't find request!" });

    withdrawData.status = "Denied";

    await withdrawData.save();

    return res.status(200).json({ message: "Updated Successfully!" });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Server Error!", error });
  }
};
