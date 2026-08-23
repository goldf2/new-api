package common

import (
	"context"
	"testing"

	"github.com/alicebob/miniredis/v2"
	"github.com/go-redis/redis/v8"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestNumericVerificationCode(t *testing.T) {
	code, err := GenerateNumericVerificationCode(6)
	require.NoError(t, err)
	assert.Regexp(t, `^\d{6}$`, code)
}

func TestVerificationCodeUsesRedisWithoutPlaintext(t *testing.T) {
	server := miniredis.RunT(t)
	client := redis.NewClient(&redis.Options{Addr: server.Addr()})
	require.NoError(t, client.Ping(context.Background()).Err())

	oldEnabled, oldClient := RedisEnabled, RDB
	RedisEnabled, RDB = true, client
	t.Cleanup(func() {
		_ = client.Close()
		RedisEnabled, RDB = oldEnabled, oldClient
	})

	RegisterVerificationCodeWithKey("13800138000", "123456", EmailVerificationPurpose)
	stored, err := server.Get(verificationStorageKey("13800138000", EmailVerificationPurpose))
	require.NoError(t, err)
	assert.NotEqual(t, "123456", stored)
	assert.True(t, VerifyCodeWithKey("13800138000", "123456", EmailVerificationPurpose))
	assert.False(t, VerifyCodeWithKey("13800138000", "654321", EmailVerificationPurpose))

	DeleteKey("13800138000", EmailVerificationPurpose)
	assert.False(t, VerifyCodeWithKey("13800138000", "123456", EmailVerificationPurpose))
}
