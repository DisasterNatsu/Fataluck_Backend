import mongoose, { Schema, model, Document } from "mongoose";
import moment from "moment";

interface BankDetails {
  accountNo?: string;
  bankName?: string;
  ifsc?: string;
  name?: string;
}

interface UserSchemaType extends Document {
  mobileNo: string;
  name: string;
  password: string;
  diamonds?: number;
  otp?: number;
  verified: boolean;
  fcmToken: string;
  gpayNo: string | undefined;
  phonePeNo: string | undefined;
  paytmNo: string | undefined;
  createdAt: Date;
  bankDetails: BankDetails;
}
// User Schema

const userSchema = new Schema<UserSchemaType>({
  mobileNo: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  diamonds: { type: Number, required: true, default: 0 },
  otp: { type: String },
  verified: { type: Boolean, default: false },
  fcmToken: { type: String, required: true },
  gpayNo: { type: String, default: undefined },
  phonePeNo: { type: String, default: undefined },
  paytmNo: { type: String, default: undefined },
  createdAt: { type: Date, default: Date.now },
  bankDetails: {
    accountNo: { type: String, default: undefined },
    bankName: { type: String, default: undefined },
    ifsc: { type: String, default: undefined },
    name: { type: String, default: undefined },
  },
});

// Admin Schema
const adminSchema = new Schema({
  email: { type: String, required: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  paymentUpi: { type: String, required: true },
  payeeName: { type: String, required: true },
});

// Fatafat Number Schema

const fatafatGameNumberSchema = new Schema({
  open: { type: Boolean, required: true },
  date: { type: String, required: true },
  currentGameNumber: {
    type: Number,
    required: true,
    validate: {
      validator: function (value: number): boolean {
        const today = new Date();
        const isSunday = today.getDay() === 0; // Sunday is 0 in getDay()
        if (isSunday) {
          return value >= 0 && value <= 4;
        } else {
          return value >= 0 && value <= 8;
        }
      },
      message: function (props: { value: number }): string {
        const today = new Date();
        const isSunday = today.getDay() === 0;
        return isSunday
          ? `currentGameNumber on Sunday must be between 0 and 3, got ${props.value}`
          : `currentGameNumber must be between 0 and 7, got ${props.value}`;
      },
    },
  },
  sunday: {
    type: Boolean,
    required: true,
    default: function (): boolean {
      const today = new Date();
      return today.getDay() === 0; // Sunday is 0 in getDay()
    },
  },
});

// Smart Matka Schema

const smartMatkaGameNumberSchema = new Schema({
  open: { type: Boolean, required: true },
  date: { type: String, required: true },
  currentGameNumber: {
    type: Number,
    required: true,
    validate: {
      validator: function (value: number): boolean {
        const today = new Date();
        const isSunday = today.getDay() === 0; // Sunday is 0 in getDay()
        if (isSunday) {
          return value >= 0 && value <= 4;
        } else {
          return value >= 0 && value <= 8;
        }
      },
      message: function (props: { value: number }): string {
        const today = new Date();
        const isSunday = today.getDay() === 0;
        return isSunday
          ? `currentGameNumber on Sunday must be between 0 and 3, got ${props.value}`
          : `currentGameNumber must be between 0 and 9, got ${props.value}`;
      },
    },
  },
  sunday: {
    type: Boolean,
    required: true,
    default: function (): boolean {
      const today = new Date();
      return today.getDay() === 0; // Sunday is 0 in getDay()
    },
  },
});

// Luck Bazar Schema

const luckBazarGameNumberSchema = new Schema({
  open: { type: Boolean, required: true },
  date: { type: String, required: true },
  currentGameNumber: {
    type: Number,
    required: true,
    validate: {
      validator: function (value: number): boolean {
        return value >= 0 && value <= 4;
      },
      message: function (props: { value: number }): string {
        return `currentGameNumber must be between 0 or 3, got ${props.value}`;
      },
    },
  },
});

// Luck Bazar Result Data Schema

const luckBazarDataSchema: Schema<IOpenCloseData> = new Schema({
  date: { type: String, required: true },
  data: [
    {
      index: { type: Number, required: true },
      gameResultPatti: { type: Number, required: true },
      gameNumber: { type: Number, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now }, // Add createdAt field with default value
});

// Open Close Schema

const openCloseGameNumberSchema = new Schema({
  open: { type: Boolean, required: true },
  date: { type: String, required: true },
  currentGameNumber: {
    type: Number,
    required: true,
    validate: {
      validator: function (value: number): boolean {
        return value >= 0 && value <= 2;
      },
      message: function (props: { value: number }): string {
        return `currentGameNumber must be 0 or 1, got ${props.value}`;
      },
    },
  },
});

// Open Close Results Schema

const openCloseDataSchema: Schema<IOpenCloseData> = new Schema({
  date: { type: String, required: true },
  data: [
    {
      index: { type: Number, required: true },
      gameResultPatti: { type: Number, required: true },
      gameNumber: { type: Number, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now }, // Add createdAt field with default value
});

// Balance Sheet interface

// Define BalanceSheet Schema Type
interface BalanceSheetSchemaType extends Document {
  user: mongoose.Types.ObjectId | UserSchemaType;
  diamond: number;
  date: string;
  baziNo: number;
  bettingNo: number;
  baziType: "Single Digit" | "Single Panna";
  gameType: "Fatafat" | "SmartMatka" | "OpenClose" | "LuckBazar";
  winLoss?: boolean;
}

// Balance sheet schema for diamond transactions

const balanceSheetSchema = new Schema<BalanceSheetSchemaType>({
  user: { type: Schema.Types.ObjectId, ref: "UserFataLuck", required: true },
  diamond: { type: Number, required: true },
  date: {
    type: String,
    required: true,
    default: () => moment().format("DD-MM-YYYY"),
  },
  baziNo: { type: Number, required: true },
  bettingNo: { type: Number, required: true },
  baziType: {
    type: String,
    enum: ["Single Digit", "Single Panna"],
    required: true,
  },
  gameType: {
    type: String,
    enum: ["Fatafat", "SmartMatka", "OpenClose", "LuckBazar"],
    required: true,
  },
  winLoss: { type: Boolean, default: undefined },
});

const rechargeWithDraw = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "UserFataLuck", required: true }, // reference to User
  diamond: { type: Number, required: true }, // this should be required to track transactions
  date: {
    type: String,
    required: true,
    default: () => moment().format("DD-MM-YYYY"),
  }, // format date
  recharge: { type: Boolean, required: true },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Denied"],
    default: "Pending",
    required: true,
  },
  screenShot: { type: String, default: undefined },
  createdAt: { type: Date, default: Date.now },
});

// Ticket Schema
const ticketSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true }, // reference to User
  date: {
    type: String,
    required: true,
    default: () => moment().format("DD-MM-YYYY"),
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Resolving", "Resolved"],
    default: "Pending",
    required: true,
  },
  replies: [
    {
      admin: { type: Schema.Types.ObjectId, ref: "Admin" },
      message: { type: String, required: false },
      date: {
        type: String,
        default: () => moment().format("DD-MM-YYYY"),
        required: false,
      },
    },
  ],
});

// pre-save hook to format the date
balanceSheetSchema.pre("save", function (next) {
  this.date = moment().format("DD-MM-YYYY");
  next();
});

const User = model("UserFataLuck", userSchema);
const Admin = model("AdminFataLuck", adminSchema);
const BalanceSheet = model("BalanceSheet", balanceSheetSchema);
const FatafatGameNumber = model("FatafatGameNumber", fatafatGameNumberSchema);
const SmartMatkaGameNumber = model(
  "SmartMatkaGameNumber",
  smartMatkaGameNumberSchema
);
const OpenCloseGameNumber = model(
  "OpenCloseGameNumber",
  openCloseGameNumberSchema
);
const LuckBazarGameNumber = model(
  "LuckBazarGameNumber",
  luckBazarGameNumberSchema
);
const Ticket = model("Ticket", ticketSchema);
const Recharge = model("Recharge", rechargeWithDraw);
const OpenCloseData = model("OpenCloseData", openCloseDataSchema);
const LuckBazarData = model("LuckBazarData", luckBazarDataSchema);

export {
  User,
  Admin,
  BalanceSheet,
  FatafatGameNumber,
  SmartMatkaGameNumber,
  OpenCloseGameNumber,
  Ticket,
  Recharge,
  OpenCloseData,
  LuckBazarGameNumber,
  LuckBazarData,
};
