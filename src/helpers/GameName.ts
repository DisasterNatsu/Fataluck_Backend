export const GameName = (gameType: string) => {
  switch (gameType) {
    case "Fatafat":
      return "Kolkata FF";
      break;

    case "SmartMatka":
      return "Smart Matka";
      break;

    case "OpenClose":
      return "Open Close";
      break;

    case "LuckBazar":
      return "Luck Bazar";
      break;

    default:
      return "Luck Bazar";
      break;
  }
};
