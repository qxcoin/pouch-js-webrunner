import { sleep } from "@utils/helpers.js";

export class DaemonCommand {

  public delay: number = 1 * 1000;

  public async run(...args: unknown[]) {
    while (true) {
      const t0 = performance.now();
      await this.callTickWithTimeout(...args);
      const t1 = performance.now();
      await sleep(this.delay - Math.round(t1 - t0));
    }
  }

  private async callTickWithTimeout(...args: unknown[]) {
    const timeoutId = setTimeout(() => { throw new Error('Tick timeout.') }, 300_000);
    await this.tick.apply(this, args);
    clearTimeout(timeoutId);
  }

  public async tick(...args: unknown[]) {
    console.log('tick');
  }

}
