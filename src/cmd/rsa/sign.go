package rsa

import (
	"fmt"
	"math/big"

	"github.com/mkamadeus/vscode-cert-gen/sha"
	"github.com/mkamadeus/vscode-cert-gen/utils"
)

func Sign(message []byte, secretKey big.Int, n big.Int) []byte {
	// 1. compute hash
	hashed := sha.Hash(message)
	fmt.Printf("SHA256(message) : %v\n", hashed)

	bigintHash := utils.Uint32ArrayToBigint(hashed)

	// 2. sign
	s := big.NewInt(0)
	s = s.Exp(&bigintHash, &secretKey, &n)
	fmt.Printf("signature : %v\n", s)

	return s.Bytes()

}
