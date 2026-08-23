package middleware

import (
	"fmt"
	"net/http"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/gin-gonic/gin"
)

const (
	smsVerificationIPMaxRequests = 10
	smsVerificationIPDuration    = int64(time.Minute / time.Second)
)

type smsVerificationWindow struct {
	mark       string
	maxRequest int
	duration   int64
}

var smsVerificationPhoneWindows = []smsVerificationWindow{
	{mark: "SV-MINUTE", maxRequest: 1, duration: int64(time.Minute / time.Second)},
	{mark: "SV-HOUR", maxRequest: 5, duration: int64(time.Hour / time.Second)},
	{mark: "SV-DAY", maxRequest: 10, duration: int64(24 * time.Hour / time.Second)},
}

func smsVerificationRateLimitKey(mark string, phone string) string {
	fingerprint := common.GenerateHMAC("sms-rate-limit:" + phone)
	return fmt.Sprintf("%s:phone:%s:%s", redisRateLimitNamespace, mark, fingerprint[:32])
}

func rejectSMSVerificationRateLimit(c *gin.Context, waitSeconds int64) {
	if waitSeconds <= 0 {
		waitSeconds = 60
	}
	c.Header("Retry-After", fmt.Sprintf("%d", waitSeconds))
	c.JSON(http.StatusTooManyRequests, gin.H{
		"success": false,
		"message": fmt.Sprintf("短信发送过于频繁，请等待 %d 秒后再试", waitSeconds),
	})
	c.Abort()
}

func redisSMSVerificationAllowed(c *gin.Context, phone string) (bool, int64, error) {
	allowed, _, ttl, err := redisFixedWindowTake(
		c.Request.Context(),
		redisIPRateLimitKey("SV-IP", c.ClientIP()),
		smsVerificationIPMaxRequests,
		smsVerificationIPDuration,
	)
	if err != nil || !allowed {
		return allowed, ttl, err
	}
	for _, window := range smsVerificationPhoneWindows {
		allowed, _, ttl, err = redisFixedWindowTake(
			c.Request.Context(),
			smsVerificationRateLimitKey(window.mark, phone),
			window.maxRequest,
			window.duration,
		)
		if err != nil || !allowed {
			return allowed, ttl, err
		}
	}
	return true, 0, nil
}

func memorySMSVerificationAllowed(c *gin.Context, phone string) bool {
	if !inMemoryRateLimiter.Request("SV-IP:"+c.ClientIP(), smsVerificationIPMaxRequests, smsVerificationIPDuration) {
		return false
	}
	for _, window := range smsVerificationPhoneWindows {
		if !inMemoryRateLimiter.Request(window.mark+":"+phone, window.maxRequest, window.duration) {
			return false
		}
	}
	return true
}

func SMSVerificationRateLimit() gin.HandlerFunc {
	inMemoryRateLimiter.Init(common.RateLimitKeyExpirationDuration)
	return func(c *gin.Context) {
		phone, valid := common.NormalizeChinaPhone(c.Query("phone"))
		if !valid {
			c.Next()
			return
		}
		if common.RedisEnabled && common.RDB != nil {
			allowed, ttl, err := redisSMSVerificationAllowed(c, phone)
			if err == nil {
				if allowed {
					c.Next()
					return
				}
				rejectSMSVerificationRateLimit(c, ttl)
				return
			}
		}
		if !memorySMSVerificationAllowed(c, phone) {
			rejectSMSVerificationRateLimit(c, 60)
			return
		}
		c.Next()
	}
}
