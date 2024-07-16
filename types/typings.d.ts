interface RegisterReq {
  mobileNo: string;
  name: string;
  password: string;
  confirmPassword: string;
}

interface TokenVerifyType {
  email: string;
  iat: number;
  exp: number;
}

interface UserTokenVerifyType {
  mobileNo: string;
  iat: number;
  exp: number;
}

interface GameDataType {
  bettingDiamond: number;
  bettingNumber: number;
}

interface RequestBodyPlaceBet {
  mobileNo: string;
  gameData: GameDataType[];
  baziType: string;
  baziNo: number;
  gameType: string;
  date: string;
}

interface PostWinLossType {
  baziNo: number;
  singleDigit: number;
  date: string;
  singlePanna: number;
  gameType: string;
}

interface PostBankDetailsType {
  bankName: string;
  accountNo: string;
  ifscCode: string;
  accountHolderName: string;
}

interface IOpenCloseData extends Document {
  date: string;
  data: { index: number; gameResultPatti: number; gameNumber: number }[];
  createdAt: Date; // Add createdAt field
}

interface ResetPasswordAfterOTPType {
  mobileNo: string;
  otp: number;
  password: string;
  confirmPassword: string;
}

interface AggregatedBet {
  bettingNo: number;
  totalDiamond: number;
  date: string;
  users: { user: string; diamond: number; name: string }[];
}

interface UserSchemaType extends Document {
  mobileNo: string;
  name: string;
}

interface ItemRechargeType {
  save(): unknown;
  _id: string;
  user: string;
  diamond: number;
  date: string;
  recharge: boolean;
  status: string;
  screenShot: string | undefined;
  createdAt: any;
}

interface RechargeWithdrawType {
  _id: any;
  name: string | undefined;
  mobileNo: string | undefined;
  diamond: number;
  date: string;
  recharge: boolean;
  status: "Pending" | "Approved" | "Denied";
  createdAt: Date;
  screenshot?: string | undefined;
}
