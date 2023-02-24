import { providers } from "ethers";
import { getChainIds } from "./src/getChainIds";
import { getL2BeatDonations } from "./src/gitcoin/getL2BeatDonations";
import { getOmnichain } from "./src/omnichain";
import { getEnv } from "./utils/getEnv";

async function main() {
  const provider = new providers.AlchemyProvider(
    "homestead",
    getEnv("ALCHEMY_API_KEY")
  );

  // await getOmnichain(provider);

  await getChainIds(provider);
  // getL2BeatDonations(provider);
}

main();
