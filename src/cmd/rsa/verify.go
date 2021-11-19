package rsa

import (
	"fmt"
	"math/big"

	"github.com/mkamadeus/vscode-cert-gen/sha"
	"github.com/mkamadeus/vscode-cert-gen/utils"
)

func Verify(message []byte, signature []byte, publicKey big.Int, n big.Int) bool {
	fmt.Printf("signature : %v\n", signature)
	// 1. compute hash
	hashed := sha.Hash(message)
	fmt.Printf("SHA256(message) : %v\n", hashed)
	bigintHash := utils.Uint32ArrayToBigint(hashed)

	// 2. sign
	bigintSignature := big.NewInt(0)
	signatureHash := big.NewInt(0)
	bigintSignature.SetBytes(signature)
	signatureHash.Exp(bigintSignature, &publicKey, &n)
	fmt.Printf("h' : %v\n", signatureHash)

	// 3. compare
	bigintHash = *bigintHash.Mod(&bigintHash, &n)
	fmt.Printf("h : %v\n", bigintHash)
	return bigintHash.Cmp(signatureHash) == 0
}
