package common

import (
	"regexp"
	"strings"
)

var chinaMobilePattern = regexp.MustCompile(`^1[3-9]\d{9}$`)

// NormalizeChinaPhone accepts a mainland China mobile number with an optional
// +86, 86, or 0086 prefix and returns the 11-digit form expected by Aliyun SMS.
func NormalizeChinaPhone(phone string) (string, bool) {
	normalized := strings.NewReplacer(" ", "", "-", "", "(", "", ")", "").Replace(strings.TrimSpace(phone))
	for _, prefix := range []string{"+86", "0086", "86"} {
		if strings.HasPrefix(normalized, prefix) {
			normalized = strings.TrimPrefix(normalized, prefix)
			break
		}
	}
	if !chinaMobilePattern.MatchString(normalized) {
		return "", false
	}
	return normalized, true
}
