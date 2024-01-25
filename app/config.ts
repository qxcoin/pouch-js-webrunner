import type { NetworkType, WalletConfigs as PouchWalletConfigs } from 'pouch';

export const port = 3000;

type CoinCode = string;
type TokenCode = string;
type ContractAddress = string;
type CoinConfig = { code: CoinCode, name: string, decimals: number };
type TokenConfig = { code: TokenCode, name: string, decimals: number, standard: string, stable: boolean, contractAddress: ContractAddress };
type NetworkConfig = {
  code: string,
  name: string,
  coin: CoinConfig,
  tokens: TokenConfig[],
  requiredConfirmations: number,
};
type WalletConfig<WalletName extends keyof PouchWalletConfigs> = PouchWalletConfigs[WalletName] & NetworkConfig & {
  blockTime: number,
};

const bitcoin = { code: 'BTC', name: 'Bitcoin', decimals: 8 };
const monero = { code: 'XMR', name: 'Monero', decimals: 12 };
const tron = { code: 'TRX', name: 'TRON', decimals: 6 };
const ethereum = { code: 'ETH', name: 'Ethereum', decimals: 18 };
const binanceCoin = { code: 'BNB', name: 'Binance Coin', decimals: 18 };
const tether = { code: 'USDT', name: 'Tether', decimals: 6, stable: true };

const bitcoinNetwork: NetworkConfig = {
  code: 'BTC',
  name: 'Bitcoin',
  coin: bitcoin,
  tokens: [],
  requiredConfirmations: 1,
}
const moneroNetwork: NetworkConfig = {
  code: 'XMR',
  name: 'Monero',
  coin: monero,
  tokens: [],
  requiredConfirmations: 10,
}
const tronNetwork: NetworkConfig = {
  code: 'TRX',
  name: 'TRON',
  coin: tron,
  tokens: [
    { ...tether, standard: 'TRC-20', contractAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t' },
  ],
  requiredConfirmations: 1,
}
const ethereumNetwork: NetworkConfig = {
  code: 'ETH',
  name: 'Ethereum',
  coin: ethereum,
  tokens: [],
  requiredConfirmations: 1,
}
const bscNetwork: NetworkConfig = {
  code: 'BSC',
  name: 'Binance Smart Chain',
  coin: binanceCoin,
  tokens: [],
  requiredConfirmations: 1,
}

export const networks = {
  bitcoin: bitcoinNetwork,
  monero: moneroNetwork,
  tron: tronNetwork,
  ethereum: ethereumNetwork,
  bsc: bscNetwork,
}

const bitcoinWallet: WalletConfig<'bitcoin'> = {
  rpcServer: process.env['BITCOIN_RPC_SERVER']!,
  fee: BigInt(process.env['BITCOIN_FEE']!),
  blockTime: 10 * 60 * 1000,
  ...networks['bitcoin'],
}
const moneroWallet: WalletConfig<'monero'> = {
  server: process.env['MONERO_SERVER']!,
  blockTime: 2 * 60 * 1000,
  ...networks['monero'],
}
const tronWallet: WalletConfig<'tron'> = {
  provider: process.env['TRONGRID_API_ENDPOINT']!,
  headers: { 'TRON-PRO-API-KEY': process.env['TRONGRID_API_KEY']! },
  blockTime: 3 * 1000,
  ...networks['tron'],
}
const ethereumWallet: WalletConfig<'ethereum'> = {
  provider: process.env['ETHEREUM_PROVIDER']!,
  contracts: {},
  blockTime: 12 * 1000,
  ...networks['ethereum'],
}
const bscWallet: WalletConfig<'bsc'> = {
  provider: process.env['BSC_PROVIDER']!,
  contracts: {},
  blockTime: 3 * 1000,
  ...networks['bsc'],
}

export const walletNetworkType: NetworkType = process.env['WALLET_NETWORK_TYPE'] as NetworkType;
export const walletMnemonic: string = process.env['WALLET_MNEMONIC']!;
export const wallets = {
  bitcoin: bitcoinWallet,
  monero: moneroWallet,
  tron: tronWallet,
  ethereum: ethereumWallet,
  bsc: bscWallet,
}
