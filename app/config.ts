import type { NetworkType, WalletConfigs as PouchWalletConfigs } from 'pouch';

export const port = 3000;

type WalletConfig<WalletName extends keyof PouchWalletConfigs> = PouchWalletConfigs[WalletName] & {
  coin: string,
  tokens: Record<string, string>,
  requiredConfirmations: number,
  blockTime: number,
}
type WalletConfigs = {
  bitcoin: WalletConfig<'bitcoin'>,
  monero: WalletConfig<'monero'>,
  tron: WalletConfig<'tron'>,
  ethereum: WalletConfig<'ethereum'>,
  bsc: WalletConfig<'bsc'>,
}

const bitcoin: WalletConfig<'bitcoin'> = {
  rpcServer: process.env['BITCOIN_RPC_SERVER']!,
  fee: BigInt(process.env['BITCOIN_FEE']!),
  coin: 'BTC',
  tokens: {},
  requiredConfirmations: 1,
  blockTime: 10 * 60 * 1000,
}
const monero: WalletConfig<'monero'> = {
  server: process.env['MONERO_SERVER']!,
  coin: 'XMR',
  tokens: {},
  requiredConfirmations: 10,
  blockTime: 2 * 60 * 1000,
}
const tron: WalletConfig<'tron'> = {
  provider: process.env['TRONGRID_API_ENDPOINT']!,
  headers: { 'TRON-PRO-API-KEY': process.env['TRONGRID_API_KEY']! },
  coin: 'TRX',
  tokens: {},
  requiredConfirmations: 1,
  blockTime: 3 * 1000,
}
const ethereum: WalletConfig<'ethereum'> = {
  provider: process.env['ETHEREUM_PROVIDER']!,
  coin: 'ETH',
  contracts: {},
  tokens: {},
  requiredConfirmations: 1,
  blockTime: 12 * 1000,
}
const bsc: WalletConfig<'bsc'> = {
  provider: process.env['BSC_PROVIDER']!,
  coin: 'BNB',
  tokens: {},
  requiredConfirmations: 1,
  blockTime: 3 * 1000,
}
export const walletNetworkType: NetworkType = process.env['WALLET_NETWORK_TYPE'] as NetworkType;
export const walletMnemonic: string = process.env['WALLET_MNEMONIC']!;
export const wallets: WalletConfigs = {
  bitcoin,
  monero,
  tron,
  ethereum,
  bsc,
}
