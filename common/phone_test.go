package common

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNormalizeChinaPhone(t *testing.T) {
	tests := []struct {
		input string
		want  string
		ok    bool
	}{
		{input: "13800138000", want: "13800138000", ok: true},
		{input: "+86 138-0013-8000", want: "13800138000", ok: true},
		{input: "0086 13800138000", want: "13800138000", ok: true},
		{input: "8613800138000", want: "13800138000", ok: true},
		{input: "12800138000", ok: false},
		{input: "+85212345678", ok: false},
		{input: "", ok: false},
	}

	for _, test := range tests {
		got, ok := NormalizeChinaPhone(test.input)
		assert.Equal(t, test.ok, ok, test.input)
		assert.Equal(t, test.want, got, test.input)
	}
}
