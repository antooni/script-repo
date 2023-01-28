import { providers } from "ethers";
import { getAllLogs, LogFilter } from "../../utils/getAllLogs";

export async function getL2BeatDonations(provider: providers.JsonRpcProvider) {
  const filter: LogFilter = {
    address: "0x8fBEa07446DdF4518b1a7BA2B4f11Bd140a8DF41",
    topics: [
      "0x4182eb95d486b42fddcea225162f9a5f93b06dfebeddf5819d0f57f2c6af3e1b",
    ],
    fromBlock: 16349429,
    toBlock: await provider.getBlockNumber(),
  };

  const logs = await getAllLogs(provider, filter);

  console.log(logs.length);
}
