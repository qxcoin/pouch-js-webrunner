import type { NetworkType, WalletConfigs as PouchWalletConfigs } from 'pouch';

export const port = 3000;

type CoinCode = string;
type TokenCode = string;
type ContractAddress = string;
type CoinConfig = { code: CoinCode, decimals: number };
type TokenConfig = { code: TokenCode, decimals: number, standard: string, contractAddress: ContractAddress };
type WalletConfig<WalletName extends keyof PouchWalletConfigs> = PouchWalletConfigs[WalletName] & {
  coin: CoinConfig,
  tokens: TokenConfig[],
  requiredConfirmations: number,
  blockTime: number,
}

const tether: Record<'tron', TokenConfig> = {
  'tron': { code: 'USDT', decimals: 6, standard: 'TRC-20', contractAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t' },
};

const bitcoin: WalletConfig<'bitcoin'> = {
  rpcServer: process.env['BITCOIN_RPC_SERVER']!,
  fee: BigInt(process.env['BITCOIN_FEE']!),
  coin: { code: 'BTC', decimals: 8 },
  tokens: [],
  requiredConfirmations: 1,
  blockTime: 10 * 60 * 1000,
}
const monero: WalletConfig<'monero'> = {
  server: process.env['MONERO_SERVER']!,
  coin: { code: 'XMR', decimals: 12 },
  tokens: [],
  requiredConfirmations: 10,
  blockTime: 2 * 60 * 1000,
}
const tron: WalletConfig<'tron'> = {
  provider: process.env['TRONGRID_API_ENDPOINT']!,
  headers: { 'TRON-PRO-API-KEY': process.env['TRONGRID_API_KEY']! },
  coin: { code: 'TRX', decimals: 6 },
  tokens: [tether['tron']],
  requiredConfirmations: 1,
  blockTime: 3 * 1000,
}
const ethereum: WalletConfig<'ethereum'> = {
  provider: process.env['ETHEREUM_PROVIDER']!,
  coin: { code: 'ETH', decimals: 18 },
  tokens: [],
  contracts: {},
  requiredConfirmations: 1,
  blockTime: 12 * 1000,
}
const bsc: WalletConfig<'bsc'> = {
  provider: process.env['BSC_PROVIDER']!,
  coin: { code: 'BNB', decimals: 18 },
  tokens: [],
  contracts: {},
  requiredConfirmations: 1,
  blockTime: 3 * 1000,
}

export const walletNetworkType: NetworkType = process.env['WALLET_NETWORK_TYPE'] as NetworkType;
export const walletMnemonic: string = process.env['WALLET_MNEMONIC']!;
export const wallets = {
  bitcoin,
  monero,
  tron,
  ethereum,
  bsc,
}
