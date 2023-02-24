import { providers } from "ethers";
import { Interface } from "ethers/lib/utils";
import { getAllLogs, LogFilter } from "../utils/getAllLogs";

const ULTRA_LIGHT_NODE_V2 = "0x4D73AdB72bC3DD368966edD0f0b2148401A178E2";
const INBOUND_PROOF_TOPIC =
  "0x802d55279d51813cb7a9a98e8fd2d7bec5346cb830901c11b85d1650cb857e9a";
const CONTRACT_CREATION_BLOCK = 15416271;

const abi = new Interface([
  "function defaultAppConfig(uint16 chainId) external view returns (ApplicationConfiguration)",
  "function inboundProofLibrary(uint16 chainId, uint16 libraryId) external view returns (string)",
]);

export async function getChainIds(provider: providers.AlchemyProvider) {
  const filter: LogFilter = {
    address: ULTRA_LIGHT_NODE_V2,
    topics: [INBOUND_PROOF_TOPIC],
    fromBlock: CONTRACT_CREATION_BLOCK,
    toBlock: await provider.getBlockNumber(),
  };

  console.log("fetching logs...");
  const logs = await getAllLogs(provider, filter);
  console.log("logs fetched");

  const unique = new Set<string>();

  logs.map((l) => {
    unique.add(l.topics[1]);
  });

  console.log("unique chainIds: ");

  const chainIds: number[] = [];
  for (const chainId of unique.keys()) {
    chainIds.push(parseInt(chainId.slice(26), 16));
  }
  console.log(chainIds);

  const defaultAppConfigs: {
    chainId: number;
    inboundProofLibraryVersion: number;
    inboundBlockConfirmations: number;
    relayer: string;
    outboundProofType: number;
    outboundBlockConfirmations: number;
    oracle: string;
  }[] = [];

  for (const chainId of chainIds) {
    const call = await provider.call({
      to: ULTRA_LIGHT_NODE_V2,
      data: abi.encodeFunctionData("defaultAppConfig", [chainId]),
    });
    const data = cutData(call);

    defaultAppConfigs.push({
      inboundProofLibraryVersion: parseInt(data[0], 16),
      inboundBlockConfirmations: parseInt(data[1], 16),
      relayer: data[2],
      outboundProofType: parseInt(data[3], 16),
      outboundBlockConfirmations: parseInt(data[4], 16),
      oracle: data[5],
      chainId,
    });
  }
  console.log(JSON.stringify(defaultAppConfigs, null, 2));

  for (const config of defaultAppConfigs) {
    const call = await provider.call({
      to: ULTRA_LIGHT_NODE_V2,
      data: abi.encodeFunctionData("inboundProofLibrary", [
        config.chainId,
        config.inboundProofLibraryVersion,
      ]),
    });
    const data = cutData(call);
    console.log(
      "chainId: ",
      config.chainId,
      "| libVersion: ",
      config.inboundProofLibraryVersion,
      "| lib:",
      `0x${data[0].slice(24)}`
    );
  }
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
