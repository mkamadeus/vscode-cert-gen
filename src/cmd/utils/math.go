package utils

import "math/big"

func isPrime(x big.Int) bool {
	if x.Cmp(big.NewInt(2)) == -1 {
		return false
	} else if x.Cmp(big.NewInt(2)) == 0 {
		return true
	} else if x.Mod(&x, big.NewInt(2)).Cmp(big.NewInt(0)) == 0 {
		return false
	}

	for i := big.NewInt(3); x.Cmp(i.Mul(i, i)) == 1; i.Add(i, big.NewInt(2)) {
		if x.Mod(&x, i).Cmp(big.NewInt(0)) == 0 {
			return false
		}
	}
	return true
}
