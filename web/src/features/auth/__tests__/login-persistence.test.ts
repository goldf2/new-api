/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { login } from '../api'

const mocks = vi.hoisted(() => ({
  post: vi.fn(),
}))

vi.mock('@/lib/api', () => ({
  api: { post: mocks.post },
  refreshAuthentication: vi.fn(),
}))

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: {
    getState: vi.fn(),
  },
}))

describe('login persistence', () => {
  beforeEach(() => {
    mocks.post.mockReset()
    mocks.post.mockResolvedValue({ data: { success: true } })
  })

  test.each([true, false])(
    'sends remember_me=%s to the password login endpoint',
    async (rememberMe) => {
      await login({
        username: 'demo-user',
        password: 'demo-password',
        remember_me: rememberMe,
      })

      expect(mocks.post).toHaveBeenCalledWith(
        '/api/user/login?turnstile=',
        {
          username: 'demo-user',
          password: 'demo-password',
          remember_me: rememberMe,
        },
        { skipAuthRefresh: true }
      )
    }
  )
})
