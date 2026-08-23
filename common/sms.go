package common

import (
	"os"
	"strings"
)

const defaultAliyunSMSRegionID = "cn-hangzhou"

type AliyunSMSConfig struct {
	AccessKeyID     string
	AccessKeySecret string
	RegionID        string
	SignName        string
	TemplateCode    string
}

func GetAliyunSMSConfig() AliyunSMSConfig {
	regionID := strings.TrimSpace(os.Getenv("ALIYUN_SMS_REGION_ID"))
	if regionID == "" {
		regionID = defaultAliyunSMSRegionID
	}
	return AliyunSMSConfig{
		AccessKeyID:     strings.TrimSpace(os.Getenv("ALIBABA_CLOUD_ACCESS_KEY_ID")),
		AccessKeySecret: strings.TrimSpace(os.Getenv("ALIBABA_CLOUD_ACCESS_KEY_SECRET")),
		RegionID:        regionID,
		SignName:        strings.TrimSpace(os.Getenv("ALIYUN_SMS_SIGN_NAME")),
		TemplateCode:    strings.TrimSpace(os.Getenv("ALIYUN_SMS_TEMPLATE_CODE")),
	}
}

func (config AliyunSMSConfig) Ready() bool {
	return config.AccessKeyID != "" &&
		config.AccessKeySecret != "" &&
		config.RegionID != "" &&
		config.SignName != "" &&
		config.TemplateCode != ""
}

func AliyunSMSReady() bool {
	return GetAliyunSMSConfig().Ready()
}
