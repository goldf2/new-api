package common

import (
	"context"
	"crypto/rand"
	"crypto/subtle"
	"fmt"
	"math/big"
	"strings"
	"sync"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/google/uuid"
)

type verificationValue struct {
	code string
	time time.Time
}

const (
	EmailVerificationPurpose = "v"
	PasswordResetPurpose     = "r"
)

var verificationMutex sync.Mutex
var verificationMap map[string]verificationValue
var verificationMapMaxSize = 10
var VerificationValidMinutes = 10

func GenerateVerificationCode(length int) string {
	code := uuid.New().String()
	code = strings.Replace(code, "-", "", -1)
	if length == 0 {
		return code
	}
	return code[:length]
}

func GenerateNumericVerificationCode(length int) (string, error) {
	if length <= 0 {
		return "", fmt.Errorf("verification code length must be positive")
	}
	code := make([]byte, length)
	for i := range code {
		digit, err := rand.Int(rand.Reader, big.NewInt(10))
		if err != nil {
			return "", err
		}
		code[i] = byte('0' + digit.Int64())
	}
	return string(code), nil
}

func verificationStorageKey(key string, purpose string) string {
	return "verification:v2:" + purpose + ":" + GenerateHMAC("verification-key:"+purpose+":"+key)
}

func verificationCodeHash(key string, code string, purpose string) string {
	return GenerateHMAC("verification-code:" + purpose + ":" + key + ":" + code)
}

func RegisterVerificationCodeWithKey(key string, code string, purpose string) {
	hashedCode := verificationCodeHash(key, code, purpose)
	if RedisEnabled && RDB != nil {
		if err := RDB.Set(
			context.Background(),
			verificationStorageKey(key, purpose),
			hashedCode,
			time.Duration(VerificationValidMinutes)*time.Minute,
		).Err(); err != nil {
			SysLog("failed to store verification code in Redis: " + err.Error())
		}
	}
	verificationMutex.Lock()
	defer verificationMutex.Unlock()
	verificationMap[purpose+key] = verificationValue{
		code: hashedCode,
		time: time.Now(),
	}
	if len(verificationMap) > verificationMapMaxSize {
		removeExpiredPairs()
	}
}

func VerifyCodeWithKey(key string, code string, purpose string) bool {
	expectedHash := verificationCodeHash(key, code, purpose)
	if RedisEnabled && RDB != nil {
		storedHash, err := RDB.Get(context.Background(), verificationStorageKey(key, purpose)).Result()
		if err == nil {
			return subtle.ConstantTimeCompare([]byte(storedHash), []byte(expectedHash)) == 1
		}
		if err != redis.Nil {
			SysLog("failed to read verification code from Redis: " + err.Error())
		}
	}
	verificationMutex.Lock()
	defer verificationMutex.Unlock()
	value, okay := verificationMap[purpose+key]
	now := time.Now()
	if !okay || int(now.Sub(value.time).Seconds()) >= VerificationValidMinutes*60 {
		return false
	}
	return subtle.ConstantTimeCompare([]byte(value.code), []byte(expectedHash)) == 1
}

func DeleteKey(key string, purpose string) {
	if RedisEnabled && RDB != nil {
		if err := RDB.Del(context.Background(), verificationStorageKey(key, purpose)).Err(); err != nil {
			SysLog("failed to delete verification code from Redis: " + err.Error())
		}
	}
	verificationMutex.Lock()
	defer verificationMutex.Unlock()
	delete(verificationMap, purpose+key)
}

// no lock inside, so the caller must lock the verificationMap before calling!
func removeExpiredPairs() {
	now := time.Now()
	for key := range verificationMap {
		if int(now.Sub(verificationMap[key].time).Seconds()) >= VerificationValidMinutes*60 {
			delete(verificationMap, key)
		}
	}
}

func init() {
	verificationMutex.Lock()
	defer verificationMutex.Unlock()
	verificationMap = make(map[string]verificationValue)
}
