import { Request, Response } from "express";
import { Ticket, User } from "../schema/MongoSchema";

export const GetTickets = async (req: Request, res: Response) => {
  const mobileNo = req.mobileNo;

  try {
    const userInDb = await User.findOne({ mobileNo });

    if (!userInDb) return res.status(400).json({ message: "Bad Request!" });

    const Tickets = await Ticket.find({ user: userInDb._id });

    if (Tickets.length > 0) {
      return res.status(200).json(Tickets);
    }
    return res.status(200).json(null);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error!", error });
  }
};

export const CreateNewTicket = async (req: Request, res: Response) => {
  const { mobileNo, message }: { mobileNo: string; message: string } = req.body;

  const verifiedNo = req.mobileNo;

  if (verifiedNo !== mobileNo) {
    return res.status(400).json({ message: "Bad Request!" });
  }

  try {
    const user = await User.findOne({ mobileNo });

    if (!user) {
      return res.status(404).json({ message: "No user found!" });
    }

    // create a new ticket

    const newTicket = new Ticket({
      user: user._id,
      message: message,
    });

    // Save the ticket
    const savedTicket = await newTicket.save();

    return res
      .status(200)
      .json({ message: "Ticket Created Successfully", savedTicket });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error", error });
  }
};
