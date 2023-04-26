import { sleep } from "@utils/helpers";

export class DaemonCommand {

  public delay: number = 1 * 1000;

  public async run(...args: any[]) {
    while (true) {
      const t0 = performance.now();
      await this.tick.apply(this, args);
      const t1 = performance.now();
      await sleep(this.delay - Math.round(t1 - t0));
    }
  }

  public async tick(...args: any[]) {
    console.time('tick');
  }

}
