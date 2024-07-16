import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Admin } from "../schema/MongoSchema";

interface RegisterReq {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
}

export const AdminRegister = async (req: Request, res: Response) => {
  const { email, name, password, confirmPassword }: RegisterReq = req.body;

  if (!email || !name || !password || !confirmPassword) {
    return res.status(400).json({ meaage: "Invalid Request!" });
  } else if (password !== confirmPassword) {
    return res.status(400).json({ meaage: "Password Mismatch" });
  }

  try {
    const salt = bcrypt.genSaltSync(5); // generate salt

    const hashedPassword = bcrypt.hashSync(password, salt); // hash the password

    const newAdmin = new Admin({ email, name, password: hashedPassword });

    await newAdmin.save();

    return res.status(200).json({ message: "Account Created" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Something happened while registering the admin" });
  }
};

export const AdminLogIn = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Invalid request" });
  }

  try {
    const all = await Admin.find();

    const adminInDb = await Admin.findOne({ email });

    if (!adminInDb) {
      return res.status(404).json({
        message: `No account with the ${email} is registered with us`,
      });
    }

    const isPasswordValid = bcrypt.compareSync(password, adminInDb.password!);

    if (!isPasswordValid)
      return res.status(403).json({ message: "Unauthorized" });

    const token = jwt.sign(
      { email: adminInDb.email },
      process.env.ADMIN_JWT_SECRET!,
      { expiresIn: "480h" }
    );

    return res
      .status(200)
      .json({ authToken: token, email, name: adminInDb.name });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Something happened while Logging In" });
  }
};

export const AdminTokenVerification = async (req: Request, res: Response) => {
  const token = req.header("fataluck-admin-token");

  // if no token

  if (!token)
    return res
      .status(403)
      .json({ message: "Unauthorised", authenticated: true });

  try {
    // it returns the issuedAt, ExpiresAt and the email used to sign it | if not a valid token, it will trigger the catch block

    const isAuth = jwt.verify(
      token,
      process.env.ADMIN_JWT_SECRET!
    ) as TokenVerifyType;

    return res.status(200).json({ authenticated: true, email: isAuth.email });
  } catch (error) {
    return res.status(500).json({
      authenticated: false,
      message: "Something happened when verifying admin data",
      error,
    });
  }
};
