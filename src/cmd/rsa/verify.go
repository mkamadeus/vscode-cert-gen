package rsa

import (
	"math/big"

	"github.com/mkamadeus/vscode-cert-gen/sha"
	"github.com/mkamadeus/vscode-cert-gen/utils"
)

func Verify(message []byte, signature string, publicKey big.Int, n big.Int) bool {
	// 1. compute hash
	hashed := sha.Hash(message)
	bigintHash := utils.Uint32ArrayToBigint(hashed)

	// 2. sign
	bigintSignature := big.NewInt(0)
	signatureHash := big.NewInt(0)
	bigintSignature.SetString(signature, 10)
	signatureHash.Exp(bigintSignature, &publicKey, &n)

	// 3. compare
	bigintHash = *bigintHash.Mod(&bigintHash, &n)
	return bigintHash.Cmp(signatureHash) == 0
}
