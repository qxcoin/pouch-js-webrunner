import type { NetworkType, WalletConfigs as PouchWalletConfigs } from 'pouch';
import path from 'node:path';

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

export const walletNetworkType: NetworkType = process.env['WALLET_NETWORK_TYPE'] as NetworkType;
export const walletMnemonic: string = process.env['WALLET_MNEMONIC'] as string;

// Bitcoin config
// ----------------------------------------

const bitcoin = { code: 'BTC', label: 'Bitcoin', decimals: 8 };

const bitcoinNetwork: NetworkConfig = {
  name: 'bitcoin',
  label: 'Bitcoin',
  coin: bitcoin,
  tokens: [],
  requiredConfirmations: 1,
}

const bitcoinWallet: WalletConfig<'bitcoin'> = {
  server: process.env['BITCOIN_SERVER']!,
  electrumServer: process.env['BITCOIN_ELECTRUM_SERVER']!,
  fee: BigInt(process.env['BITCOIN_FEE']!),
  blockTime: 10 * 60 * 1000,
  ...bitcoinNetwork,
}

// end Bitcoin config

// Monero config
// ----------------------------------------

const monero = { code: 'XMR', label: 'Monero', decimals: 12 };

const moneroNetwork: NetworkConfig = {
  name: 'monero',
  label: 'Monero',
  coin: monero,
  tokens: [],
  requiredConfirmations: 10,
}

const moneroWallet: WalletConfig<'monero'> = {
  path: path.resolve(`storage/monero/${walletNetworkType}-wallet`),
  server: process.env['MONERO_SERVER']!,
  blockTime: 2 * 60 * 1000,
  ...moneroNetwork,
}

// end Bitcoin config

// Tron config
// ----------------------------------------

const tron = { code: 'TRX', label: 'TRON', decimals: 6 };

const tronNetwork: NetworkConfig = {
  name: 'tron',
  label: 'TRON',
  coin: tron,
  tokens: [],
  requiredConfirmations: 1,
}

const tronWallet: WalletConfig<'tron'> = {
  provider: process.env['TRONGRID_API_ENDPOINT']!,
  headers: { 'TRON-PRO-API-KEY': process.env['TRONGRID_API_KEY']! },
  blockTime: 16 * 1000, // the actual block time is 3 seconds, we increase it to 16 seconds for resource efficiency
  ...tronNetwork,
}

// end Tron config

// Ethereum config
// ----------------------------------------

const ethereum = { code: 'ETH', label: 'Ethereum', decimals: 18 };

const ethereumNetwork: NetworkConfig = {
  name: 'ethereum',
  label: 'Ethereum',
  coin: ethereum,
  tokens: [],
  requiredConfirmations: 1,
}

const ethereumWallet: WalletConfig<'ethereum'> = {
  provider: process.env['ETHEREUM_PROVIDER']!,
  blockTime: 16 * 1000, // the actual block time is 12 seconds, we increase it to 16 seconds for resource efficiency
  ...ethereumNetwork,
}

// end Ethereum config

// BinanceSmartChain config
// ----------------------------------------

const binanceCoin = { code: 'BNB', label: 'Binance Coin', decimals: 18 };

const bscNetwork: NetworkConfig = {
  name: 'bsc',
  label: 'Binance Smart Chain',
  coin: binanceCoin,
  tokens: [],
  requiredConfirmations: 1,
}

// const bscWallet: WalletConfig<'bsc'> = {
//   provider: process.env['BSC_PROVIDER']!,
//   blockTime: 16 * 1000, // the actual block time is 3 seconds, we increase it to 16 seconds for resource efficiency
//   ...bscNetwork,
// }

// end BinanceSmartChain config

// Tether config
// ----------------------------------------

const tether = { code: 'USDT', label: 'Tether', decimals: 6, stable: true };

ethereumNetwork.tokens.push({ ...tether, standard: 'ERC-20', contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7' });
tronNetwork.tokens.push({ ...tether, standard: 'TRC-20', contractAddress: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t' });

// end Tron config

// ShibaInu config
// ----------------------------------------

const shiba = { code: 'SHIB', label: 'Shiba Inu', decimals: 18, stable: false };

ethereumNetwork.tokens.push({ ...shiba, standard: 'ERC-20', contractAddress: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE' });

// end Tron config

export const networks = {
  bitcoin: bitcoinNetwork,
  monero: moneroNetwork,
  tron: tronNetwork,
  ethereum: ethereumNetwork,
  // bsc: bscNetwork,
}

export const wallets = {
  bitcoin: bitcoinWallet,
  monero: moneroWallet,
  tron: tronWallet,
  ethereum: ethereumWallet,
  // bsc: bscWallet,
}
