export default function mergeOptionalArrays<T>(arrays: (T[] | undefined)[]): T[] | undefined {
  let result: T[] = [];

  let empty = 0;
  for (const array of arrays) {
    if (array === undefined) {
      empty++;
      continue;
    }

    result = result.concat(array);
  }

  if (empty === arrays.length) {
    return undefined;
  }

  return result;
}