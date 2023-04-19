import type { NetworkType, WalletConfigs } from 'pouch';

export const port = 3000;

const bitcoin: WalletConfigs['bitcoin'] = {
  rpcServer: process.env['BITCOIN_RPC_SERVER']!,
  fee: BigInt(process.env['BITCOIN_FEE']!),
}
const monero: WalletConfigs['monero'] = {
  server: process.env['MONERO_SERVER']!,
}
const tron: WalletConfigs['tron'] = {
  provider: process.env['TRON_PROVIDER']!,
}
const ethereum: WalletConfigs['ethereum'] = {
  provider: process.env['ETHEREUM_PROVIDER']!,
}
const bsc: WalletConfigs['bsc'] = {
  provider: process.env['BSC_PROVIDER']!,
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
