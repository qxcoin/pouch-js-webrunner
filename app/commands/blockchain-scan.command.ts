import { Command } from "commander";
import { DaemonCommand } from "./daemon.command";
import { WalletTypes } from "pouch";
import w from "@app/wallet";

export class BlockchainScanCommand extends DaemonCommand {

  public build(): Command {
    const program = new Command();
    program.name('blockchain:scan').argument('<wallet>').action(this.run.bind(this));
    return program;
  }

  public override async tick(walletType: WalletTypes) {
    // const wallet = w.createBitcoinWallet();
    // console.log(await wallet.getTransactions(1, 2));
  }

}
