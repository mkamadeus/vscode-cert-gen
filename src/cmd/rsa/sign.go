package rsa

import (
	"math/big"

	"github.com/mkamadeus/vscode-cert-gen/sha"
	"github.com/mkamadeus/vscode-cert-gen/utils"
)

func Sign(message []byte, secretKey big.Int, n big.Int) string {
	// 1. compute hash
	hashed := sha.Hash(message)
	bigintHash := utils.Uint32ArrayToBigint(hashed)

	// 2. sign
	s := big.NewInt(0)
	s = s.Exp(&bigintHash, &secretKey, &n)

	return s.String()

}
