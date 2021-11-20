package utils

import "fmt"

func PrintByteArray(bytes []byte) {
	for i, b := range bytes {
		fmt.Printf("%08b ", b)
		if (i-7)%8 == 0 {
			fmt.Println()
		}
	}
	fmt.Println()
}

func PrintUint32Array(uints []uint32) {
	for i, b := range uints {
		fmt.Printf("%032b ", b)
		if (i-1)%2 == 0 {
			fmt.Println()
		}
	}
	fmt.Println()
}

func SprintByteArrayAsHex(arr []byte) string {
	s := ""
	for _, b := range arr {
		s += fmt.Sprintf("%x", b)
	}
	return s
}
