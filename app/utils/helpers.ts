export async function sleep(ms: number) {
  if (ms > 0) await new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Speed is really important here.
 * NOTE: Can we make this even faster? complexity is O(4N) now.
 */
export function arrayDiff(arr1: any[], arr2: any[]): any[] {
  let obj1: Record<any, any> = {};
  for (const value of arr1) obj1[value] = {};
  let obj2: Record<any, any> = {};
  for (const value of arr2) obj2[value] = {};
  const arr: any[] = [];
  for (const value of arr1) {
    if (!obj2.hasOwnProperty(value)) {
      arr.push(value);
    }
  }
  for (const value of arr2) {
    if (!obj1.hasOwnProperty(value)) {
      arr.push(value);
    }
  }
  return arr;
}
