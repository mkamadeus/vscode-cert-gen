import { TextDecoder, TextEncoder } from "util";
import * as crypto from "crypto";
import { kill } from "process";

// is prime with (probabilistic) miller-rabin test https://rosettacode.org/wiki/Miller–Rabin_primality_test
export function probablyPrime(n: bigint) {
  const k = 40; // Increase this for higher accuracy at the expense of computation time

  function millerTest(d: bigint, s: bigint, n: bigint): boolean {
    let a = 2n + randbigintlim(n-2n) % (n - 4n);

    let base = 13n;
    var x = powmod(a, d, n);
  
    if (x === 1n || x === n - 1n) {return true;}
  
    for (var i = 1; i <= s; i++) {
      x = (x * x) % n;
  
      if (x === 1n) {return false;}
      if (x === n - 1n) {return true;}
    }
    return false;
  }

  if (n === 2n || n === 3n) {return true;}
  if (n % 2n === 0n || n < 2n) {return false;}
 
  // Write (n - 1) as 2^s * d
  var s = 0n, d = n - 1n;
  while ((d & 1n) === 0n) {
    d >>= 1n;
    ++s;
  }
 
  for (let i = 0; i < k; i++) {
    if (!millerTest(d, s, n)) {
      return false;
    }
  }

  return true;
}

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
  if (y === 0n) {
    return x;
  }
  return gcd(y, x % y);
};

// iscoprime for bigint
export const isCoprime = (x: bigint, y: bigint): boolean => {
  return gcd(x, y) === 1n;
};

// fast expo for bigint
export const pow = (n: bigint, p: bigint): bigint => {
  if (p < 0n) {
    throw Error("yo pow can't be negative >:(");
  }

  if (p === 0n) {
    return 1n;
  }
  if (p === 1n) {
    return n;
  }
  // p is odd
  if (p & 1n) {
    return pow(n, p - 1n) * n;
  }

  // p >> 1n -> p / 2
  const half = pow(n, p / 2n);
  return half * half;
};

// fast expo for bigint
export const powmod = (x: bigint, n: bigint, p: bigint): bigint => {
  if (n < 0n) {
    throw Error("yo pow can't be negative >:(");
  }

  if (n === 0n) {
    return 1n;
  }
  else if (n === 1n) {
    return x;
  }
  // p is odd
  else if (n & 1n) {
    return (powmod(x, n - 1n, p) * x) % p;
  }

  // p >> 1n -> p / 2
  const half = (powmod(x, n / 2n, p)) % p;
  return half * half;
};

// inverse modulo with prime mod value
export const fermatModInv = (num: bigint, den: bigint): bigint => {
  if (gcd(num, den) !== 1n) {
    return 0n;
  } else {
    return pow(num, den - 2n) % den;
  }
};

// inverse modulo when mod value isnt prime https://www.geeksforgeeks.org/multiplicative-inverse-under-modulo-m/
export const modInv = (a: bigint, m: bigint): bigint => {
  let m0 = m;
  let y = 0n;
  let x = 1n;

  if (m === 1n) {return 0n;}

  while (a > 1) {
    let q = a / m;
    let t = m;

    m = a % m;
    a = t;
    t = y;

    y = x - q * y;
    x = t;
  }

  if (x < 0) {x += m0;}
  return x;
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
  return pow(n, (p - 1n) / 2n) % p === 1n;
};

export const genPrime = (byteCount: number): bigint => {
  let num = randbigint(byteCount);
  while (!probablyPrime(num)) {
    num = randbigint(byteCount);
  }
  return num;
};

export const randbigintlim = (limit: bigint): bigint => {
  return BigInt(
    Math.floor(Math.random() * parseInt(limit.toString()))
  ).valueOf();
};

// https://www.geeksforgeeks.org/node-js-crypto-randombytes-method/ 
export const randbigint = (byteCount: number): bigint => {
  const buf = crypto.randomBytes(byteCount);
  const arr = new Uint8Array(buf);
  
  // Set two highest bits
  arr[0] = (arr[0] % 64) + 192;
  
  // Set lowest bit
  const len = arr.length;
  arr[len-1] = (arr[len-1] & 1) ? arr[len-1] : (arr[len-1] + 1);

  return bytesToBigint(arr);
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
