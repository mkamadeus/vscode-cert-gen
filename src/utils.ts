// is prime for bigint
export const isPrime = (n: bigint): boolean => {
  if (n <= 1n) {
    return false;
  }
  if (n === 2n) {
    return true;
  }
  if (n % 2n === 0n) {
    return false;
  }

  for (let i = 3n; i * i < n; i += 2n) {
    if (n % i === 0n) {
      return false;
    }
  }

  return true;
};

// gcd for bigint
export const gcd = (x: bigint, y: bigint): bigint => {
  if (y == 0n) {
    return x;
  }
  return gcd(y, x % y);
};

// iscoprime for bigint
export const isCoprime = (x: bigint, y: bigint): boolean => {
  return gcd(x, y) == 1n;
};

// fast expo for bigint
export const pow = (n: bigint, p: bigint): bigint => {
  if (p < 0n) {
    throw Error("yo pow can't be negative >:(");
  }

  if (p == 0n) {
    return 1n;
  }
  if (p == 1n) {
    return n;
  }
  if (p % 2n == 1n) {
    return pow(n, p - 1n) * n;
  }

  const half = pow(n, p / 2n);
  return half * half;
};

// inverse modulo with prime mod value
export const fermatModInv = (num: bigint, den: bigint): bigint => {
  if (gcd(num, den) != 1n) {
    return 0n;
  } else {
    return pow(num, den - 2n) % den;
  }
};

// Calculate the nth root of val
// https://stackoverflow.com/questions/53683995/javascript-big-integer-square-root/58863398#58863398
export const rootNth = (val: bigint, k = 2n): bigint => {
  let o = 0n; // old approx value
  let x = val;
  let limit = 100;

  while (x ** k !== k && x !== o && --limit) {
    o = x;
    x = ((k - 1n) * x + val / pow(x, k - 1n)) / k;
  }

  return x;
};

// Modulo for negative numerators
export const mod = (num: bigint, den: bigint): bigint => {
  return ((num % den) + den) % den;
};

// Euler's Criterion - Check if square root under modulo p exists
export const eulerCrit = (n: bigint, p: bigint): boolean => {
  return pow(n, (p - 1n) / 2n) % p == 1n;
};

export const randbigint = (limit: bigint): bigint => {
  return BigInt(
    Math.floor(Math.random() * parseInt(limit.toString()))
  ).valueOf();
};

export const cast = (x: number): bigint => {
  return BigInt(x).valueOf();
};

export const biggestSmallerPow256 = (n: bigint): bigint => {
  if (n <= 256) {
    return 0n;
  }

  let pow256 = 256n;
  let i = 256n;
  while (true) {
    i = i << 8n;

    if (i >= n) {
      break;
    }

    pow256 = i;
  }

  return pow256;
};

export const calcArrayBatchSize = (n: bigint): bigint => {
  if (n <= 256) {
    return 0n;
  }

  let temp = 256n;
  let i = 1n;
  while (true) {
    temp = temp << 8n;

    if (temp >= n) {
      break;
    }

    i++;
  }

  return i;
};

export const bigintToBytes = (n: bigint): Uint8Array => {
  // Convert to hex, make it easier to calc byte count
  let hex = n.toString(16);
  if (hex.length % 2 !== 0) {
    hex = "0" + hex;
  }
  return Uint8Array.from(
    hex.match(/[\da-fA-F]{2}/g)!.map((h) => {
      return parseInt(h, 16);
    })
  );
};

export const bytesToBigint = (arr: Uint8Array): bigint => {
  let ret = 0n;
  for (const byte of arr.values()) {
    ret = (ret << 8n) + BigInt(byte);
  }
  return ret;
};

export const strToBytes = (str: string): Uint8Array => {
  return new TextEncoder().encode(str);
};

export const bytesToStr = (arr: Uint8Array): string => {
  return new TextDecoder().decode(arr);
};
