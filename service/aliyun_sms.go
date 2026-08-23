package service

import (
	"context"
	"fmt"
	"regexp"

	"github.com/QuantumNous/new-api/common"

	openapiutil "github.com/alibabacloud-go/darabonba-openapi/v2/utils"
	smsclient "github.com/alibabacloud-go/dysmsapi-20170525/v5/client"
	"github.com/alibabacloud-go/tea/dara"
)

type aliyunSMSSender func(context.Context, common.AliyunSMSConfig, string, string) error

var sendAliyunSMSRequest aliyunSMSSender = sendAliyunSMSRequestWithSDK
var numericVerificationCodePattern = regexp.MustCompile(`^\d{6}$`)

func SendAliyunVerificationSMS(ctx context.Context, phone string, code string) error {
	config := common.GetAliyunSMSConfig()
	if !config.Ready() {
		return fmt.Errorf("Aliyun SMS is not configured")
	}
	if _, valid := common.NormalizeChinaPhone(phone); !valid {
		return fmt.Errorf("invalid mainland China mobile number")
	}
	if !numericVerificationCodePattern.MatchString(code) {
		return fmt.Errorf("verification code must contain 6 digits")
	}
	return sendAliyunSMSRequest(ctx, config, phone, code)
}

func sendAliyunSMSRequestWithSDK(ctx context.Context, config common.AliyunSMSConfig, phone string, code string) error {
	client, err := smsclient.NewClient(&openapiutil.Config{
		AccessKeyId:     dara.String(config.AccessKeyID),
		AccessKeySecret: dara.String(config.AccessKeySecret),
		RegionId:        dara.String(config.RegionID),
		Endpoint:        dara.String("dysmsapi.aliyuncs.com"),
	})
	if err != nil {
		return fmt.Errorf("create Aliyun SMS client: %w", err)
	}

	templateParam, err := common.Marshal(map[string]string{"code": code})
	if err != nil {
		return fmt.Errorf("encode Aliyun SMS template parameters: %w", err)
	}
	response, err := client.SendSmsWithContext(ctx, &smsclient.SendSmsRequest{
		PhoneNumbers:  dara.String(phone),
		SignName:      dara.String(config.SignName),
		TemplateCode:  dara.String(config.TemplateCode),
		TemplateParam: dara.String(string(templateParam)),
	}, &dara.RuntimeOptions{})
	if err != nil {
		return fmt.Errorf("send Aliyun SMS request: %w", err)
	}
	if response == nil || response.Body == nil || response.Body.Code == nil {
		return fmt.Errorf("Aliyun SMS returned an empty response")
	}
	if dara.StringValue(response.Body.Code) != "OK" {
		return fmt.Errorf(
			"Aliyun SMS rejected the request: code=%s message=%s request_id=%s",
			dara.StringValue(response.Body.Code),
			dara.StringValue(response.Body.Message),
			dara.StringValue(response.Body.RequestId),
		)
	}
	return nil
}
