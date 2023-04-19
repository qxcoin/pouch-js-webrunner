import { WalletFactory } from "pouch";
import { walletMnemonic, walletNetworkType, wallets as walletConfigs } from '@App/config.js';

export default new WalletFactory(walletMnemonic, walletNetworkType, walletConfigs);
