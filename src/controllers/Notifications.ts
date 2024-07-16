import { Request, Response } from "express";
import { User } from "../schema/MongoSchema";
import { messaging } from "../firebase";

export const sendResultNotification = async (req: Request, res: Response) => {
  const { gameName, baziNo, navId } = req.body;

  if (!gameName || !baziNo)
    return res.status(400).json({ message: "Invalid request!" });

  try {
    const allUsers = await User.find();

    allUsers.map(async (user) => {
      await messaging.send({
        token: user.fcmToken,
        notification: {
          title: "Result Out",
          body: `${gameName} ${baziNo} bazi Result Out`,
        },
        data: {
          navigationId: navId,
        },
      });
    });

    res.status(200).json({
      message: "Notification sent successfully",
    });
  } catch (error) {
    console.error("Error retrieving users:", error);
    res.status(500).json({
      message: "Error retrieving users",
    });
  }
};

export const winningNotification = async (req: Request, res: Response) => {};
