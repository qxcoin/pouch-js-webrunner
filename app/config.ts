import type { NetworkType, WalletConfigs as PouchWalletConfigs } from 'pouch';

export const port = 3000;

type CoinCode = string;
type TokenCode = string;
type ContractAddress = string;
type CoinConfig = { code: CoinCode, label: string, decimals: number };
type TokenConfig = { code: TokenCode, label: string, decimals: number, standard: string, stable: boolean, contractAddress: ContractAddress };
type NetworkConfig = {
  name: string,
  label: string,
  coin: CoinConfig,
  tokens: TokenConfig[],
  requiredConfirmations: number,
};
type WalletConfig<WalletName extends keyof PouchWalletConfigs> = PouchWalletConfigs[WalletName] & NetworkConfig & {
  blockTime: number,
};

const bitcoin = { code: 'BTC', label: 'Bitcoin', decimals: 8 };
const monero = { code: 'XMR', label: 'Monero', decimals: 12 };
const tron = { code: 'TRX', label: 'TRON', decimals: 6 };
const ethereum = { code: 'ETH', label: 'Ethereum', decimals: 18 };
const binanceCoin = { code: 'BNB', label: 'Binance Coin', decimals: 18 };
const tether = { code: 'USDT', label: 'Tether', decimals: 6, stable: true };

const bitcoinNetwork: NetworkConfig = {
  name: 'bitcoin',
  label: 'Bitcoin',
  coin: bitcoin,
  tokens: [],
  requiredConfirmations: 1,
}
const moneroNetwork: NetworkConfig = {
  name: 'monero',
  label: 'Monero',
  coin: monero,
  tokens: [],
  requiredConfirmations: 10,
}
const tronNetwork: NetworkConfig = {
  name: 'tron',
  label: 'TRON',
  coin: tron,
  tokens: [
    { ...tether, standard: 'TRC-20', contractAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t' },
  ],
  requiredConfirmations: 1,
}
const ethereumNetwork: NetworkConfig = {
  name: 'ethereum',
  label: 'Ethereum',
  coin: ethereum,
  tokens: [],
  requiredConfirmations: 1,
}
const bscNetwork: NetworkConfig = {
  name: 'bsc',
  label: 'Binance Smart Chain',
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
  blockTime: 12 * 1000,
  ...networks['ethereum'],
}
const bscWallet: WalletConfig<'bsc'> = {
  provider: process.env['BSC_PROVIDER']!,
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
