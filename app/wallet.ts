import crypto from "node:crypto";
import { WalletFactory } from "pouch";
import { walletMnemonic, walletNetworkType, wallets as walletConfigs } from '@app/config.js';

export const walletId = crypto.createHash('sha256').update(walletMnemonic).digest('hex');

export default new WalletFactory(walletMnemonic, walletNetworkType, walletConfigs);
