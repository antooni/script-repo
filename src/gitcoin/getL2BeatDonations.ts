import { providers } from "ethers";
import { getAllLogs, LogFilter } from "../../utils/getAllLogs";

const L2BEAT_GRANT = "6c5a2688c83c806150ca9dd0b2f10f16f8f1c33e";
const TOKENS = {
  "0000000000000000000000000000000000000000000000000000000000000000": "ETH",
  "0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f": "DAI",
};

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

  const result: Record<string, number> = {};
  const uniqueDonors: Set<string> = new Set();

  for (const log of logs) {
    const [token, amount, grant] = cutData(log.data);
    const decimalAmount = parseInt(amount, 16) / 1e18;

    if (grant.includes(L2BEAT_GRANT)) {
      uniqueDonors.add(log.topics[1]);
      if (result[token] === undefined) {
        result[token] = decimalAmount;
      } else {
        result[token] += decimalAmount;
      }
    }
  }

  printResult(result, uniqueDonors.size);
}

function printResult(result: Record<string, number>, uniqueDonors: number) {
  console.log(
    `\nL2Beat Gitcoin alpha stats @ ${new Date().toLocaleString("en")}`
  );
  console.log("\nSummary of donations: ");
  for (const [key, value] of Object.entries(result)) {
    console.log(TOKENS[key], Math.round(value * 100) / 100);
  }
  console.log("\nUnique donors:", uniqueDonors);
}

function cutData(data: string): string[] {
  const result: string[] = [];

  let id = 2;

  while (id + 64 <= data.length) {
    result.push(data.slice(id, id + 64));
    id += 64;
  }

  return result;
}
