import { providers } from "ethers";
import { getAllLogs, LogFilter } from "../utils/getAllLogs";
import fetch from "node-fetch";

const ULTRA_LIGHT_NODE_V2 = '0x4D73AdB72bC3DD368966edD0f0b2148401A178E2'
const PACKET_RECEIVED_TOPIC = '0x2bd2d8a84b748439fd50d79a49502b4eb5faa25b864da6a9ab5c150704be9a4d'
const CONTRACT_CREATION_BLOCK = 15416271

export async function getOmnichain(provider: providers.JsonRpcProvider) {
    const filter: LogFilter = {
        address: ULTRA_LIGHT_NODE_V2,
        topics: [PACKET_RECEIVED_TOPIC],
        fromBlock: CONTRACT_CREATION_BLOCK,
        toBlock: await provider.getBlockNumber(),
    };

    console.log('fetching logs...')
    const logs = await getAllLogs(provider, filter);
    console.log('logs fetched')


    const interactions = new Map<string, number>()

    logs.map(l => {
        const current = interactions.get('0x' + l.topics[2].slice(26))
        if (current === undefined) {
            interactions.set('0x' + l.topics[2].slice(26), 1)
        } else {
            interactions.set('0x' + l.topics[2].slice(26), current + 1)
        }
    })

    const ranking: { address: string, count: number }[] = []
    for (const [address, count] of interactions.entries()) {
        ranking.push({ address, count })
    }

    const ERC20: string[] = [...interactions.keys()]

    console.log('fetching tokens list...')
    const listRequest = `https://api.coingecko.com/api/v3/coins/list?include_platform=true`;
    const listResponse = await fetch(listRequest);
    const list = await listResponse.json();
    console.log('tokens list fetched')

    console.log('Omnichain tokens known to coingecko: ')
    for(const l of list) {
        if(l.platforms.ethereum) {
            const address = l.platforms.ethereum
            const f = ERC20.find(erc => erc == address)
            if(f !== undefined) [
                console.log(l.id)
            ]
        }
    }

    console.log('TOP10 by amount of interactions')
    console.log(ranking.sort((a, b) => b.count - a.count).slice(0, 10).map(r => r.address + ' | ' + r.count))
}
