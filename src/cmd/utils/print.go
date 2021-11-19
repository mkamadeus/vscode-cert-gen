package utils

import "fmt"

func printByteArray(bytes []byte) {
	for i, b := range bytes {
		fmt.Printf("%08b ", b)
		if (i-7)%8 == 0 {
			fmt.Println()
		}
	}
	fmt.Println()
}

func printUint32Array(uints []uint32) {
	for i, b := range uints {
		fmt.Printf("%032b ", b)
		if (i-1)%2 == 0 {
			fmt.Println()
		}
	}
	fmt.Println()
}
