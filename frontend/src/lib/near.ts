import { JsonRpcProvider } from 'near-api-js';
import type { ConnectionSBT } from './types';

const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID || 'sbt.nearcard-dev.testnet';
const NETWORK_ID = process.env.NEXT_PUBLIC_NETWORK_ID || 'testnet';

const RPC_URL =
  NETWORK_ID === 'mainnet'
    ? 'https://rpc.mainnet.near.org'
    : 'https://rpc.testnet.near.org';

const provider = new JsonRpcProvider({ url: RPC_URL });

async function viewMethod<T>(methodName: string, args: Record<string, unknown> = {}): Promise<T> {
  const res = await provider.query({
    request_type: 'call_function',
    account_id: CONTRACT_ID,
    method_name: methodName,
    args_base64: btoa(JSON.stringify(args)),
    finality: 'final',
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const resultBytes = (res as any).result as number[];
  return JSON.parse(String.fromCharCode(...resultBytes));
}

export async function getSbt(tokenId: number): Promise<ConnectionSBT | null> {
  return viewMethod<ConnectionSBT | null>('get_sbt', { token_id: tokenId });
}

export async function getSbtsByOwner(accountId: string): Promise<ConnectionSBT[]> {
  return viewMethod<ConnectionSBT[]>('get_sbts_by_owner', { account_id: accountId });
}

export async function getPoolBalance(): Promise<string> {
  return viewMethod<string>('get_pool_balance');
}

export async function getSbtCount(): Promise<number> {
  return viewMethod<number>('get_sbt_count');
}

export async function getTransferAmount(): Promise<string> {
  return viewMethod<string>('get_transfer_amount');
}

export function getExplorerUrl(txHash: string): string {
  return NETWORK_ID === 'mainnet'
    ? `https://nearblocks.io/txns/${txHash}`
    : `https://testnet.nearblocks.io/txns/${txHash}`;
}

export { CONTRACT_ID, NETWORK_ID };
