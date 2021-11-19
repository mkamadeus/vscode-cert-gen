package main

import (
	"fmt"
	"math/big"

	"github.com/alexflint/go-arg"
	"github.com/mkamadeus/vscode-cert-gen/rsa"
)

type CertGenArgs struct {
	Message string `arg:"-m,--message,required"`
}

func main() {
	args := CertGenArgs{}
	arg.MustParse(&args)

	sign := rsa.Sign([]byte(args.Message), *big.NewInt(3), *big.NewInt(33))
	fmt.Println(sign)
	verify := rsa.Verify([]byte(args.Message), sign, *big.NewInt(7), *big.NewInt(33))
	fmt.Println(verify)
	// fmt.Println(utils.Uint32ArrayToBigint([]uint32{0xFFFFEEEE, 0xFFFFDDDD, 0xFFFFAAAA}))
}
