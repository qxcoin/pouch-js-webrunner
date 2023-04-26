export async function sleep(ms: number) {
  if (ms > 0) await new Promise(resolve => setTimeout(resolve, ms));
}
