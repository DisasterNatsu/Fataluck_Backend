import { BalanceSheet, User } from "../schema/MongoSchema";
import { messaging } from "../firebase";
import { GameName } from "./GameName";

export const updateWinLossStatus = async (
  gameType: string,
  baziType: string,
  date: string,
  baziNo: number,
  bettingNo: number,
  multiplier: number
) => {
  try {
    // Find all relevant bets
    const bets = await BalanceSheet.find({
      gameType,
      date,
      baziNo,
      bettingNo,
      baziType,
    });

    const gameName = GameName(gameType);

    // Process each bet
    for (const bet of bets) {
      bet.winLoss = true;
      const diamondsWon = bet.diamond * multiplier;

      // Find the user and update diamonds
      const user = await User.findById(bet.user);
      if (!user) {
        throw new Error("User not found");
      }
      user.diamonds = (user.diamonds || 0) + diamondsWon;

      await messaging.send({
        token: user.fcmToken,
        notification: {
          title: `Result Out ${gameName}`,
          body: `Congrats! You've won ${diamondsWon} Diamonds!`,
        },
        data: {
          navigationId: "History",
        },
      });

      // Save user and bet updates
      await Promise.all([user.save(), bet.save()]);
    }

    // Find and process losing bets
    const losingBets = await BalanceSheet.find({
      gameType,
      baziType,
      date,
      baziNo,
      bettingNo: { $ne: bettingNo },
    });

    for (const losingBet of losingBets) {
      losingBet.winLoss = false;

      // Find the user
      const losingUser = await User.findById(losingBet.user);
      if (!losingUser) {
        throw new Error("User not found");
      }

      await messaging.send({
        token: losingUser.fcmToken,
        notification: {
          title: `Result Out ${gameName}`,
          body: "Sorry, you have lost this round. Better luck next time!",
        },
        data: {
          navigationId: "History",
        },
      });

      // Save losing bet update
      await losingBet.save();
    }
  } catch (error) {
    console.error("Error in updateWinLossStatus:", error);
    throw error; // Propagate the error to handle it at the caller level
  }
};
