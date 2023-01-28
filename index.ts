import { providers } from "ethers";
import { getL2BeatDonations } from "./src/gitcoin/getL2BeatDonations";
import { getEnv } from "./utils/getEnv";

async function main() {
  const provider = new providers.AlchemyProvider(
    "homestead",
    getEnv("ALCHEMY_API_KEY")
  );

  getL2BeatDonations(provider);
}

main();
