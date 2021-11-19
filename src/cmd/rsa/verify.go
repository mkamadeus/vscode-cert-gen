package rsa

import (
	"math/big"

	"github.com/mkamadeus/vscode-cert-gen/sha"
	"github.com/mkamadeus/vscode-cert-gen/utils"
)

func Verify(message []byte, signature []byte, publicKey big.Int, n big.Int) bool {
	// 1. compute hash
	hashed := sha.Hash(message)
	bigintHash := utils.Uint32ArrayToBigint(hashed)

	// 2. sign
	bigintSignature := big.NewInt(0)
	signatureHash := big.NewInt(0)
	bigintSignature.SetBytes(signature)
	signatureHash.Exp(bigintSignature, &publicKey, &n)

	return bigintHash.Cmp(signatureHash) == 0
}
