import { Request, Response } from "express";
import axios from "axios";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { User } from "../schema/MongoSchema";

interface RegisterReq {
  mobileNo: string;
  name: string;
  password: string;
  confirmPassword: string;
  fcmToken: string;
}

export const Register = async (req: Request, res: Response) => {
  const { mobileNo, name, password, confirmPassword, fcmToken }: RegisterReq =
    req.body;

  const validateName = (name: string): boolean => {
    // Example validation: Name should be at least 3 characters long and only contain letters and spaces
    const nameRegex = /^[A-Za-z\s]{3,}$/;
    return nameRegex.test(name);
  };

  if (!mobileNo || !name || !password || !confirmPassword) {
    return res.status(400).json({ message: "Necessary Data was not provided" });
  } else if (!validateName(name)) {
    return res.status(400).json({
      message:
        "Please enter a valid name. Name should be at least 3 characters long and only contain letters and spaces.",
    });
  } else if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  const user = await User.findOne({ mobileNo });

  if (user !== null) {
    return res.status(302).json({
      message: `An account with ${mobileNo} alreaady exists please Log In to continue`,
    });
  }

  try {
    const otp = Math.floor(1000 + Math.random() * 9000);

    const salt = bcrypt.genSaltSync(5); // generate salt

    const hashedPassword = bcrypt.hashSync(password, salt); // hash the password

    // define data

    let data = JSON.stringify({
      messages: [
        {
          channel: "sms",
          recipients: [mobileNo],
          content: `Hey ${name}! Thank you for registering with us at Fataluck! Your OTP is ${otp}. Please contact us for any disputes and don't share the OTP with anyone`,
          msg_type: "text",
          data_coding: "text",
        },
      ],
      message_globals: {
        originator: "SignOTP",
        report_url: "https://the_url_to_recieve_delivery_report.com",
      },
    });

    // define Config

    const config = {
      method: "post",
      url: "https://api.d7networks.com/messages/v1/send",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${process.env.AUTH_TOKEN}`,
      },
      data: data,
    };

    const response = await axios(config);
    console.log(response.data);

    const newUser = new User({
      mobileNo,
      name,
      password: hashedPassword,
      otp,
      fcmToken,
    });

    console.log(newUser);

    await newUser.save();

    return res.status(200).json({ message: "OTP sent!" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Something happened while registering the user" });
  }
};

export const OTPVerifcation = async (req: Request, res: Response) => {
  const { mobileNo, otp }: { mobileNo: string; otp: number } = req.body;

  try {
    // Find the user by mobile number
    const user = await User.findOne({ mobileNo });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check if the OTP matches
    if (user.otp == otp) {
      console.log(user.otp);
      user.verified = true; // Mark user as verified
      user.otp = undefined; // Optionally clear the OTP after successful verification
      await user.save();
      return res.status(200).json({ message: "OTP verified successfully" });
    } else if (user.verified) {
      return res.status(200).json({ message: "Already Verified" });
    } else {
      return res.status(400).json({ message: "Invalid OTP" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Something went wrong while verifying the OTP" });
  }
};

export const ResendOTP = async (req: Request, res: Response) => {
  const { mobileNo }: { mobileNo: string } = req.body;

  if (!mobileNo) {
    return res.status(400).json({ message: "Mobile No invalid" });
  }

  try {
    const user = await User.findOne({ mobileNo });

    const otp: number = Math.floor(1000 + Math.random() * 9000);

    if (user?.otp) {
      user.otp = otp;

      // define data

      let data = JSON.stringify({
        messages: [
          {
            channel: "sms",
            recipients: [mobileNo],
            content: `Hey ${user.name}! Thank you for registering with us at Fataluck! Your OTP is ${otp}. Please contact us for any disputes and don't share the OTP with anyone`,
            msg_type: "text",
            data_coding: "text",
          },
        ],
        message_globals: {
          originator: "SignOTP",
          report_url: "https://the_url_to_recieve_delivery_report.com",
        },
      });

      // define Config

      const config = {
        method: "post",
        url: "https://api.d7networks.com/messages/v1/send",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${process.env.AUTH_TOKEN}`,
        },
        data: data,
      };

      const response = await axios(config);

      console.log(response.data);

      await user.save();

      return res.status(200).json({ message: "OTP sent!" });
    }

    return res.status(302).json({
      message: `No account with ${mobileNo} is registered with us please Sign Up!`,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Something happened while Re-Sending the OTP" });
  }
};

export const PasswordResetWithOTP = async (req: Request, res: Response) => {
  const { mobileNo }: { mobileNo: string } = req.body;

  if (!mobileNo) return res.status(400).json({ message: "Bad Request!" });

  try {
    const userInDb = await User.findOne({ mobileNo });

    if (!userInDb) return res.status(404).json({ message: "No user found!" });

    // Generate 4 digit otp

    const otp = Math.floor(1000 + Math.random() * 9000);

    let data = JSON.stringify({
      messages: [
        {
          channel: "sms",
          recipients: [mobileNo],
          content: `Hey ${userInDb.name}! Your OTP for resetting password is ${otp}. Please contact us for any disputes and don't share the OTP with anyone`,
          msg_type: "text",
          data_coding: "text",
        },
      ],
      message_globals: {
        originator: "SignOTP",
        report_url: "https://the_url_to_recieve_delivery_report.com",
      },
    });

    const config = {
      method: "post",
      url: "https://api.d7networks.com/messages/v1/send",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${process.env.AUTH_TOKEN}`,
      },
      data: data,
    };

    const response = await axios(config);
    console.log(response.data);

    userInDb.otp = otp;

    await userInDb.save();

    return res.status(200).json({ message: "OTP sent!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error!" });
  }
};

export const ResetPasswordVerifyOTP = async (req: Request, res: Response) => {
  const { mobileNo, otp }: { mobileNo: string; otp: number } = req.body;

  try {
    // Find the user by mobile number
    const user = await User.findOne({ mobileNo });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check if the OTP matches
    if (user.otp == otp) {
      console.log(user.otp);

      return res.status(200).json({ message: "OTP verified successfully" });
    } else {
      return res.status(400).json({ message: "Invalid OTP" });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Something went wrong while verifying the OTP" });
  }
};

export const ResetPasswordAfterOTP = async (req: Request, res: Response) => {
  const {
    mobileNo,
    otp,
    password,
    confirmPassword,
  }: ResetPasswordAfterOTPType = req.body;

  if (!mobileNo || !otp || !password || confirmPassword) {
    return res.status(400).json({ message: "Bad Request" });
  } else if (password !== confirmPassword) {
    return res.status(401).json({ message: "Passwords don't match!" });
  }

  try {
    // get the user from database

    const userInDb = await User.findOne({ mobileNo });

    if (!userInDb) return res.status(404).json({ message: "No user found!" });

    if (userInDb.otp == otp) {
      userInDb.otp = undefined; // Optionally clear the OTP after successful verification

      const salt = bcrypt.genSaltSync(5); // generate salt

      const hashedPassword = bcrypt.hashSync(password, salt); // hash the password

      userInDb.password = hashedPassword;

      await userInDb.save();

      return res.status(200).json({ message: "Success" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error!" });
  }
};

export const LogIn = async (req: Request, res: Response) => {
  const {
    mobileNo,
    password,
    fcmToken,
  }: { mobileNo: string; password: string; fcmToken: string } = req.body;

  if (!mobileNo || !password) {
    return res.status(400).json({ message: "Invalid request" });
  }

  try {
    // check if there is an email with the account with the provided email
    const userInDb = await User.findOne({ mobileNo });

    // if there is no admin account with that email
    if (!userInDb) {
      return res.status(404).json({
        message: `No account with the ${mobileNo} is registered with us`,
      });
    } else if (fcmToken) {
      userInDb.fcmToken = fcmToken;

      const updatedUser = await userInDb.save();

      console.log(updatedUser);
    }

    const isPasswordValid = bcrypt.compareSync(password, userInDb.password!);

    if (!isPasswordValid)
      return res.status(403).json({ message: "Unauthorized" });

    // sign a jwt token

    const token = jwt.sign(
      { mobileNo: userInDb.mobileNo },
      process.env.USER_JWT_SECRET!,
      { expiresIn: "480h" }
    );

    // response with data

    return res
      .status(200)
      .json({ authToken: token, mobileNo, name: userInDb.name });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something happened while logging in", error });
  }
};

export const ResetPassword = async (req: Request, res: Response) => {
  const {
    mobileNo,
    oldPassword,
    password,
  }: { mobileNo: string; oldPassword: string; password: string } = req.body;

  if (!mobileNo || !password || !oldPassword) {
    return res.status(400).json({ message: "Invalid Request!" });
  }

  try {
    const userInDb = await User.findOne({ mobileNo });

    if (userInDb) {
      // check if password is valid

      const isPasswordValid = bcrypt.compareSync(
        oldPassword,
        userInDb.password
      );

      if (!isPasswordValid) {
        return res.status(403).json({ message: "Incorrect Password!" });
      }

      const isPasswordSame = bcrypt.compareSync(password, userInDb.password);

      console.log(isPasswordSame);

      if (isPasswordSame) {
        return res.status(400).json({
          message: "New password cannot be the same as the old password!",
        });
      }

      const salt = bcrypt.genSaltSync(5); // generate salt

      const hashedPassword = bcrypt.hashSync(password, salt); // hash the password

      userInDb.password = hashedPassword;

      await userInDb.save();

      return res
        .status(200)
        .json({ message: "Password Changed Successfully!" });
    } else {
      return res
        .status(400)
        .json({ message: `No User with ${mobileNo} is found!` });
    }
  } catch (error) {
    return res.status(500).json({ message: "Server Error!" });
  }
};

export const UserTokenVerification = async (req: Request, res: Response) => {
  const token: string | undefined = req.header("fl-user-token");

  if (!token) return res.status(400).json({ message: "Unauthorised" });

  try {
    const isAuth = jwt.verify(token, process.env.USER_JWT_SECRET!);

    //@ts-ignore
    const userInDb = await User.findOne({ mobileNo: isAuth.mobileNo });

    return res.status(200).json({ authenticated: true, data: userInDb });
  } catch (error) {
    return res.status(500).json({
      authenticated: false,
      message: "Something happened when verifying admin data",
      error,
    });
  }
};

export const PostBankDetails = async (req: Request, res: Response) => {
  const mobileNo = req.mobileNo;

  // data from req.body
  const {
    bankName,
    accountNo,
    ifscCode,
    accountHolderName,
  }: PostBankDetailsType = req.body;

  if (!mobileNo || !bankName || !ifscCode || !accountHolderName || !accountNo) {
    return res.status(400).json({ message: "Bad Request!" });
  }

  try {
    // get user in database

    const userInDb = await User.findOne({ mobileNo });

    if (!userInDb) {
      return res.status(404).json({ message: "No user found!" });
    }

    userInDb.bankDetails.bankName = bankName;
    userInDb.bankDetails.ifsc = ifscCode;
    userInDb.bankDetails.accountNo = accountNo;
    userInDb.bankDetails.name = accountHolderName;

    const updatedUser = await userInDb.save();

    console.log(updatedUser);

    return res.status(200).json({ message: "Updated Successfully!" });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Server Error", error });
  }
};

export const PostUpiDetails = async (req: Request, res: Response) => {
  const mobileNo = req.mobileNo;

  const { upiProvider, upiNo }: { upiProvider: string; upiNo: string } =
    req.body;

  const validUpiProviders = ["Google Pay", "Phone Pay", "PayTM"];

  if (!validUpiProviders.includes(upiProvider)) {
    return res.status(400).json({ message: "Invalid UPI provider" });
  }

  try {
    const userInDb = await User.findOne({ mobileNo });

    if (!userInDb) {
      return res.status(404).json({ message: "User not found!" });
    }

    if (upiProvider === validUpiProviders[0]) {
      userInDb.gpayNo = upiNo;

      await userInDb.save();

      return res.status(200).json({ message: "G-Pay number updated!" });
    } else if (upiProvider === validUpiProviders[1]) {
      userInDb.phonePeNo = upiNo;

      await userInDb.save();

      return res.status(200).json({ message: "Phone Pay number updated!" });
    } else if (upiProvider === validUpiProviders[2]) {
      userInDb.paytmNo = upiNo;

      await userInDb.save();

      return res.status(200).json({ message: "PayTM number updated!" });
    }
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Server Error", error });
  }
};
