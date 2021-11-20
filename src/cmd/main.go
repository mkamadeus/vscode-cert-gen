package main

import (
	"fmt"
	"math/big"
	"strings"

	"github.com/alexflint/go-arg"
	"github.com/mkamadeus/vscode-cert-gen/rsa"
)

type PublicKey struct {
	N *big.Int
	E *big.Int
}

func (key *PublicKey) UnmarshalText(b []byte) error {
	s := string(b)
	k := strings.Split(s, ",")
	if len(k) != 2 {
		return fmt.Errorf("expected 2 comma-separated values, found %d values", len(k))
	}
	key.N = big.NewInt(0)
	key.E = big.NewInt(0)

	_, success1 := key.N.SetString(k[0], 10)
	_, success2 := key.E.SetString(k[1], 10)

	if !success1 || !success2 {
		return fmt.Errorf("failed to parse key")
	}
	return nil
}

type PrivateKey struct {
	N *big.Int
	D *big.Int
}

func (key *PrivateKey) UnmarshalText(b []byte) error {
	s := string(b)
	k := strings.Split(s, ",")
	if len(k) != 2 {
		return fmt.Errorf("expected 2 comma-separated values, found %d values", len(k))
	}
	key.N = big.NewInt(0)
	key.D = big.NewInt(0)

	_, success1 := key.N.SetString(k[0], 10)
	_, success2 := key.D.SetString(k[1], 10)
	if !success1 || !success2 {
		return fmt.Errorf("failed to parse key")
	}
	return nil
}

type CertGenArgs struct {
	IsSign     bool       `arg:"--sign" help:"for signing a certificate"`
	PrivateKey PrivateKey `arg:"--private" help:"private key: n,d (for --sign)"`
	IsVerify   bool       `arg:"--verify" help:"for verifying a certificate"`
	PublicKey  PublicKey  `arg:"--public" help:"public key: n,e (for --verify)"`
	Signature  string     `arg:"-s,--signature" help:"message signature (for --verify)"`
	Message    string     `arg:"-m,--message,required" help:"message for signing or verification"`
}

func (CertGenArgs) Version() string {
	return "certgen-cli v0.0.0 by @mkamadeus & COSKIozer"
}

func ParseArgs() (*CertGenArgs, error) {
	args := &CertGenArgs{}
	arg.MustParse(args)

	if !args.IsSign && !args.IsVerify {
		return nil, fmt.Errorf("--sign or --verify must be supplied")
	}
	if args.IsSign && args.IsVerify {
		return nil, fmt.Errorf("--sign and --verify must be mutually exclusive")
	}
	if args.IsSign && (args.PrivateKey.N == nil || args.PrivateKey.D == nil) {
		return nil, fmt.Errorf("--sign must have --private key supplied")
	}
	if args.IsVerify && (args.PublicKey.N == nil || args.PublicKey.E == nil || args.Signature == "") {
		return nil, fmt.Errorf("--verify must have --public key supplied")
	}
	return args, nil
}

func main() {
	args, err := ParseArgs()
	if err != nil {
		panic(err)
	}

	if args.IsSign {
		signature := rsa.Sign([]byte(args.Message), *args.PrivateKey.D, *args.PrivateKey.N)
		fmt.Println(signature)
	} else if args.IsVerify {
		verify := rsa.Verify([]byte(args.Message), args.Signature, *args.PublicKey.E, *args.PublicKey.N)
		fmt.Println(verify)
	}
}
