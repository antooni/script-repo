import { providers } from "ethers";
import { getAllLogs, LogFilter } from "../../utils/getAllLogs";
import { getCurrentPrice } from "../../utils/getEtherPrice";

const GITCOIN_CONTRACT_EMITTING_EVENTS =
  "0x8fBEa07446DdF4518b1a7BA2B4f11Bd140a8DF41";
const CONTRACT_CREATION_BLOCK = 16349429;
const VOTE_EVENT_TOPIC =
  "0x4182eb95d486b42fddcea225162f9a5f93b06dfebeddf5819d0f57f2c6af3e1b";
const L2BEAT_GRANT = "6c5a2688c83c806150ca9dd0b2f10f16f8f1c33e";
const TOKENS = {
  "0000000000000000000000000000000000000000000000000000000000000000": "ETH",
  "0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f": "DAI",
};

const projects = [
  {
    name: "L2BEAT",
    grant: L2BEAT_GRANT,
  },
  {
    name: "Chainlist",
    grant: "08a3c2A819E3de7ACa384c798269B3Ce1CD0e437",
  },
];

export async function getL2BeatDonations(provider: providers.JsonRpcProvider) {
  const filter: LogFilter = {
    address: GITCOIN_CONTRACT_EMITTING_EVENTS,
    topics: [VOTE_EVENT_TOPIC],
    fromBlock: CONTRACT_CREATION_BLOCK,
    toBlock: await provider.getBlockNumber(),
  };

  const logs = await getAllLogs(provider, filter);
  const ethereumPrice = await getCurrentPrice("ethereum");

  const { result, uniqueDonors } = getResult(logs);
  printResult("OVERALL", result, uniqueDonors.size, ethereumPrice);

  for (const project of projects) {
    const { result, uniqueDonors } = getResult(
      logs.filter((l) =>
        l.data.toLowerCase().includes(project.grant.toLowerCase())
      )
    );
    printResult(project.name, result, uniqueDonors.size, ethereumPrice);
  }

  console.log("\n");
}

function getResult(logs: providers.Log[]) {
  const result: Record<string, number> = {};
  const uniqueDonors: Set<string> = new Set();

  for (const log of logs) {
    const [token, amount] = cutData(log.data);
    const decimalAmount = parseInt(amount, 16) / 1e18;

    uniqueDonors.add(log.topics[1]);
    if (result[token] === undefined) {
      result[token] = decimalAmount;
    } else {
      result[token] += decimalAmount;
    }
  }

  return { result, uniqueDonors };
}

function printResult(
  project: string,
  result: Record<string, number>,
  uniqueDonors: number,
  ethereumPrice: number
) {
  console.log(
    `\n${project} Gitcoin alpha stats @ ${new Date().toLocaleString("en")}`
  );
  console.log("\nSummary of donations: ");

  let sum = 0;
  for (const [key, value] of Object.entries(result)) {
    if (TOKENS[key] === "ETH") sum += value * ethereumPrice;
    else sum += value;
    console.log(TOKENS[key], Math.round(value * 100) / 100);
  }
  console.log("\nsum =", Math.round(sum * 100) / 100, "$");

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
