package utils

import (
	"math/big"
)

func Uint32ArrayToBigint(value []uint32) big.Int {
	bytes := make([]byte, len(value)*4)
	for i := 0; i < len(value); i++ {
		v := value[i]
		bytes[4*i] = byte((v >> 24) & 0xff)
		bytes[4*i+1] = byte((v >> 16) & 0xff)
		bytes[4*i+2] = byte((v >> 8) & 0xff)
		bytes[4*i+3] = byte((v >> 0) & 0xff)
	}
	z := big.Int{}
	z.SetBytes(bytes)
	return z
}
