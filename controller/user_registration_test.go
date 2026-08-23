package controller

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestResolveRegistrationVerificationMethod(t *testing.T) {
	tests := []struct {
		name         string
		requested    string
		emailEnabled bool
		smsEnabled   bool
		email        string
		phone        string
		want         string
		wantError    bool
	}{
		{name: "disabled", want: ""},
		{name: "email only", emailEnabled: true, want: registrationVerificationEmail},
		{name: "sms only", smsEnabled: true, want: registrationVerificationSMS},
		{name: "both explicit email", requested: "email", emailEnabled: true, smsEnabled: true, want: registrationVerificationEmail},
		{name: "both explicit sms", requested: "sms", emailEnabled: true, smsEnabled: true, want: registrationVerificationSMS},
		{name: "both infer email", emailEnabled: true, smsEnabled: true, email: "user@example.com", want: registrationVerificationEmail},
		{name: "both infer sms", emailEnabled: true, smsEnabled: true, phone: "13800138000", want: registrationVerificationSMS},
		{name: "both ambiguous", emailEnabled: true, smsEnabled: true, email: "user@example.com", phone: "13800138000", wantError: true},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			got, err := resolveRegistrationVerificationMethod(
				test.requested,
				test.emailEnabled,
				test.smsEnabled,
				test.email,
				test.phone,
			)
			if test.wantError {
				require.Error(t, err)
				return
			}
			require.NoError(t, err)
			assert.Equal(t, test.want, got)
		})
	}
}
