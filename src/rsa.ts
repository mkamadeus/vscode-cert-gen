import { sha256 } from "./sha256";

type RSAKey = {
  priv: string;
  pub: string;
};

export const rsa = (m: string, key: RSAKey) => {
  // 1. hash message
  const hash = sha256(m);

  // 2.
  const cert = 
};
