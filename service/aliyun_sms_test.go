package service

import (
	"context"
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestSendAliyunVerificationSMSUsesEnvironmentConfiguration(t *testing.T) {
	t.Setenv("ALIBABA_CLOUD_ACCESS_KEY_ID", "test-key-id")
	t.Setenv("ALIBABA_CLOUD_ACCESS_KEY_SECRET", "test-key-secret")
	t.Setenv("ALIYUN_SMS_REGION_ID", "cn-hangzhou")
	t.Setenv("ALIYUN_SMS_SIGN_NAME", "测试签名")
	t.Setenv("ALIYUN_SMS_TEMPLATE_CODE", "SMS_123456789")

	previousSender := sendAliyunSMSRequest
	t.Cleanup(func() { sendAliyunSMSRequest = previousSender })
	called := false
	sendAliyunSMSRequest = func(_ context.Context, config common.AliyunSMSConfig, phone string, code string) error {
		called = true
		assert.Equal(t, "test-key-id", config.AccessKeyID)
		assert.Equal(t, "test-key-secret", config.AccessKeySecret)
		assert.Equal(t, "13800138000", phone)
		assert.Equal(t, "123456", code)
		return nil
	}

	require.NoError(t, SendAliyunVerificationSMS(context.Background(), "13800138000", "123456"))
	assert.True(t, called)
}

func TestSendAliyunVerificationSMSRejectsMissingConfiguration(t *testing.T) {
	for _, name := range []string{
		"ALIBABA_CLOUD_ACCESS_KEY_ID",
		"ALIBABA_CLOUD_ACCESS_KEY_SECRET",
		"ALIYUN_SMS_REGION_ID",
		"ALIYUN_SMS_SIGN_NAME",
		"ALIYUN_SMS_TEMPLATE_CODE",
	} {
		t.Setenv(name, "")
	}

	err := SendAliyunVerificationSMS(context.Background(), "13800138000", "123456")
	assert.ErrorContains(t, err, "not configured")
}
