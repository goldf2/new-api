#!/usr/bin/env bash

set -euo pipefail

SCRIPT_NAME="$(basename "$0")"
DEFAULT_BASE_URL="https://ai.ebm001.com/v1"
DEFAULT_MODEL="gpt-5.6-sol"
DEFAULT_REASONING="high"
KEY_SERVICE="codex-newapi-key"
MANAGED_BEGIN="# >>> codex-newapi managed >>>"
MANAGED_END="# <<< codex-newapi managed <<<"

ACTION="menu"
BASE_URL="$DEFAULT_BASE_URL"
MODEL="$DEFAULT_MODEL"
REASONING="$DEFAULT_REASONING"
LEGACY_HOME="${CODEX_NEWAPI_HOME:-$HOME/.codex-na}"
MANAGER_HOME="${CODEX_NEWAPI_MANAGER_HOME:-$HOME/.codex-newapi-manager}"
GLOBAL_HOME="${CODEX_NEWAPI_GLOBAL_HOME:-$HOME/.codex}"
GLOBAL_CONFIG="$GLOBAL_HOME/config.toml"
AUTH_CONFIG="$GLOBAL_HOME/auth.json"
PROFILE_CONFIG="$GLOBAL_HOME/newapi.config.toml"
PROFILE_BACKUP="$MANAGER_HOME/newapi.config.toml.before-newapi"
PROFILE_ORIGINAL_STATE="$MANAGER_HOME/profile-original-state"
GLOBAL_BACKUP="$MANAGER_HOME/config.toml.before-newapi"
GLOBAL_ORIGINAL_STATE="$MANAGER_HOME/global-original-state"
AUTH_BACKUP="$MANAGER_HOME/auth.json.before-newapi"
AUTH_ORIGINAL_STATE="$MANAGER_HOME/auth-original-state"
MODE_FILE="$MANAGER_HOME/mode"
SHELL_RC=""
DRY_RUN=0

# Keep interactive prompts attached to the user's terminal when the script is
# launched through `curl ... | bash`.
if [ -t 0 ]; then
  exec 3<&0
elif { exec 3</dev/tty; } 2>/dev/null; then
  :
else
  exec 3<&0
fi

log() {
  printf '[codex-newapi] %s\n' "$*"
}

warn() {
  printf '[codex-newapi] WARNING: %s\n' "$*" >&2
}

die() {
  printf '[codex-newapi] ERROR: %s\n' "$*" >&2
  exit 1
}

usage() {
  cat <<EOF
Usage:
  $SCRIPT_NAME
  $SCRIPT_NAME install [options]
  $SCRIPT_NAME desktop [options]
  $SCRIPT_NAME rotate-key
  $SCRIPT_NAME status [options]
  $SCRIPT_NAME restore [options]

Options:
  --base-url URL       New API base URL (default: $DEFAULT_BASE_URL)
  --model MODEL        Default model (default: $DEFAULT_MODEL)
  --reasoning LEVEL    minimal|low|medium|high|xhigh (default: $DEFAULT_REASONING)
  --shell-rc PATH      Shell startup file to update
  --dry-run            Show detected settings without changing files or credentials
  -h, --help           Show this help

Run without arguments to open the interactive menu.

"install" adds a CLI profile. "desktop" also switches the base config and API
login used by Codex Desktop. The original login is backed up and history stays
in the shared Codex home.
Run without an action to choose interactively.
EOF
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    menu|install|desktop|global|rotate-key|status|restore|uninstall)
      ACTION="$1"
      shift
      ;;
    --base-url)
      [ "$#" -ge 2 ] || die "--base-url requires a value"
      BASE_URL="$2"
      shift 2
      ;;
    --model)
      [ "$#" -ge 2 ] || die "--model requires a value"
      MODEL="$2"
      shift 2
      ;;
    --reasoning)
      [ "$#" -ge 2 ] || die "--reasoning requires a value"
      REASONING="$2"
      shift 2
      ;;
    --shell-rc)
      [ "$#" -ge 2 ] || die "--shell-rc requires a value"
      SHELL_RC="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      die "Unknown argument: $1"
      ;;
  esac
done

case "$REASONING" in
  minimal|low|medium|high|xhigh) ;;
  *) die "Unsupported reasoning level: $REASONING" ;;
esac

case "$MODEL" in
  *[!A-Za-z0-9._:-]*|'') die "model contains unsupported characters: $MODEL" ;;
esac

case "$BASE_URL" in
  *\"*|*\\*|*' '*) die "base URL contains unsupported whitespace or quoting characters" ;;
esac

detect_platform() {
  local kernel
  kernel="${CODEX_NEWAPI_PLATFORM_OVERRIDE:-$(uname -s)}"
  case "$kernel" in
    Darwin|macos)
      PLATFORM="macos"
      ;;
    Linux|linux)
      PLATFORM="linux"
      if [ -r /etc/os-release ]; then
        # shellcheck disable=SC1091
        . /etc/os-release
        LINUX_ID="${ID:-unknown}"
      else
        LINUX_ID="unknown"
      fi
      if [ "$LINUX_ID" != "ubuntu" ] && [ "$LINUX_ID" != "debian" ]; then
        warn "Linux distribution '$LINUX_ID' is not Ubuntu/Debian; continuing with the portable fallback"
      fi
      ;;
    *)
      die "Unsupported operating system: $kernel (supported: macOS and Ubuntu/Debian)"
      ;;
  esac
}

select_shell_rc() {
  if [ -n "$SHELL_RC" ]; then
    return
  fi

  case "${SHELL:-}" in
    */zsh) SHELL_RC="$HOME/.zshrc" ;;
    */bash) SHELL_RC="$HOME/.bashrc" ;;
    *)
      if [ "$PLATFORM" = "macos" ]; then
        SHELL_RC="$HOME/.zshrc"
      else
        SHELL_RC="$HOME/.bashrc"
      fi
      ;;
  esac
}

normalize_base_url() {
  BASE_URL="${BASE_URL%/}"
  case "$BASE_URL" in
    http://*|https://*) ;;
    *) die "base URL must begin with http:// or https://" ;;
  esac

  case "$BASE_URL" in
    */responses|*/chat/completions)
      die "base URL must stop at /v1; do not include an endpoint path"
      ;;
    */v1) ;;
    *) BASE_URL="$BASE_URL/v1" ;;
  esac
}

find_codex_binary() {
  if [ -n "${CODEX_NEWAPI_CODEX_BIN:-}" ]; then
    CODEX_BIN="$CODEX_NEWAPI_CODEX_BIN"
  else
    CODEX_BIN="$(command -v codex 2>/dev/null || true)"
  fi

  [ -n "$CODEX_BIN" ] || die "codex was not found in PATH; install Codex CLI first"
  case "$CODEX_BIN" in
    /*) ;;
    *) die "codex did not resolve to an absolute executable path: $CODEX_BIN" ;;
  esac
  [ -x "$CODEX_BIN" ] || die "codex is not executable: $CODEX_BIN"
}

timestamp() {
  date '+%Y%m%d-%H%M%S'
}

backup_file() {
  local path="$1"
  if [ -f "$path" ]; then
    local backup="${path}.backup.$(timestamp)"
    cp -p "$path" "$backup"
  fi
}

remove_managed_block() {
  local path="$1"
  [ -f "$path" ] || return 0

  local tmp="${path}.codex-newapi.tmp.$$"
  awk -v begin="$MANAGED_BEGIN" -v end="$MANAGED_END" '
    $0 == begin { skipping = 1; next }
    $0 == end { skipping = 0; next }
    !skipping { print }
  ' "$path" > "$tmp"
  local mode
  mode="$(stat -c '%a' "$path" 2>/dev/null || stat -f '%Lp' "$path")"
  chmod "$mode" "$tmp"
  mv "$tmp" "$path"
}

configure_macos_credential() {
  local force="${1:-0}"
  command -v security >/dev/null 2>&1 || die "macOS security command was not found"

  if [ "$force" -eq 0 ] && \
     security find-generic-password -a "$USER" -s "$KEY_SERVICE" >/dev/null 2>&1; then
    log "已找到保存的 New API 密钥"
  else
    [ -t 3 ] || die "interactive terminal required to store the New API key in Keychain"
    cat <<'EOF'

请粘贴 New API 密钥，然后按回车。
输入时屏幕上不会显示任何内容，这是正常的。
EOF
    security add-generic-password -U -a "$USER" -s "$KEY_SERVICE" -w <&3
    log "New API 密钥已保存"
  fi

  AUTH_KIND="macos-keychain"
  AUTH_COMMAND="/usr/bin/security"
  AUTH_ARGS="[\"find-generic-password\", \"-a\", \"$USER\", \"-s\", \"$KEY_SERVICE\", \"-w\"]"
}

configure_linux_credential() {
  local force="${1:-0}"
  local api_key=""
  local secret_tool=""

  secret_tool="$(command -v secret-tool 2>/dev/null || true)"
  if [ "$force" -eq 0 ]; then
    if [ -n "$secret_tool" ] && [ -n "${DBUS_SESSION_BUS_ADDRESS:-}" ] &&
       "$secret_tool" lookup service "$KEY_SERVICE" account "$USER" >/dev/null 2>&1; then
      AUTH_KIND="linux-secret-service"
      AUTH_COMMAND="$secret_tool"
      AUTH_ARGS="[\"lookup\", \"service\", \"$KEY_SERVICE\", \"account\", \"$USER\"]"
      log "已找到保存的 New API 密钥"
      return
    fi
    if [ -s "$MANAGER_HOME/credentials/newapi.key" ] &&
       [ -x "$MANAGER_HOME/bin/get-newapi-key" ]; then
      AUTH_KIND="mode-600-file"
      AUTH_COMMAND="$MANAGER_HOME/bin/get-newapi-key"
      AUTH_ARGS="[]"
      log "已找到保存的 New API 密钥"
      return
    fi
  fi

  [ -t 3 ] || die "interactive terminal required to read the New API key"
  cat <<'EOF'

请粘贴 New API 密钥，然后按回车。
输入时屏幕上不会显示任何内容，这是正常的。
EOF
  printf 'New API key: '
  IFS= read -r -s api_key <&3
  printf '\n'
  [ -n "$api_key" ] || die "empty API key"

  if [ -n "$secret_tool" ] && [ -n "${DBUS_SESSION_BUS_ADDRESS:-}" ]; then
    if printf '%s' "$api_key" | "$secret_tool" store \
      --label="Codex New API key" service "$KEY_SERVICE" account "$USER"; then
      unset api_key
      AUTH_KIND="linux-secret-service"
      AUTH_COMMAND="$secret_tool"
      AUTH_ARGS="[\"lookup\", \"service\", \"$KEY_SERVICE\", \"account\", \"$USER\"]"
      return
    fi
    warn "Secret Service storage failed; using a mode-600 credential file"
  fi

  local credential_dir="$MANAGER_HOME/credentials"
  local credential_file="$credential_dir/newapi.key"
  mkdir -p "$credential_dir"
  chmod 700 "$credential_dir"
  umask 077
  printf '%s' "$api_key" > "$credential_file"
  unset api_key
  chmod 600 "$credential_file"

  local helper_dir="$MANAGER_HOME/bin"
  local helper_file="$helper_dir/get-newapi-key"
  mkdir -p "$helper_dir"
  chmod 700 "$helper_dir"
  cat > "$helper_file" <<EOF
#!/usr/bin/env sh
set -eu
cat '$credential_file'
EOF
  chmod 700 "$helper_file"

  AUTH_KIND="mode-600-file"
  AUTH_COMMAND="$helper_file"
  AUTH_ARGS="[]"
}

print_install_expectations() {
  cat <<EOF

正在配置 Codex 使用 New API。
如果接下来提示输入密钥，请粘贴 New API 密钥并按回车。
配置完成后脚本会自动退出。

EOF
}

configure_credential() {
  local force="${1:-0}"
  if [ "$PLATFORM" = "macos" ]; then
    configure_macos_credential "$force"
  else
    configure_linux_credential "$force"
  fi
}

prepare_profile_backup() {
  ensure_manager_home
  if [ -f "$PROFILE_ORIGINAL_STATE" ]; then
    return
  fi
  if [ -f "$PROFILE_CONFIG" ]; then
    cp -p "$PROFILE_CONFIG" "$PROFILE_BACKUP"
    chmod 600 "$PROFILE_BACKUP"
    printf 'present\n' > "$PROFILE_ORIGINAL_STATE"
  else
    printf 'missing\n' > "$PROFILE_ORIGINAL_STATE"
  fi
  chmod 600 "$PROFILE_ORIGINAL_STATE"
}

write_profile_config() {
  prepare_profile_backup
  mkdir -p "$GLOBAL_HOME"
  chmod 700 "$GLOBAL_HOME"
  umask 077
  cat > "$PROFILE_CONFIG" <<EOF
model = "$MODEL"
model_provider = "newapi"
model_reasoning_effort = "$REASONING"

[model_providers.newapi]
name = "New API"
base_url = "$BASE_URL"
wire_api = "responses"
request_max_retries = 4
stream_max_retries = 10
stream_idle_timeout_ms = 300000

[model_providers.newapi.auth]
command = "$AUTH_COMMAND"
args = $AUTH_ARGS
timeout_ms = 5000
refresh_interval_ms = 0
EOF
  chmod 600 "$PROFILE_CONFIG"
  log "New API profile 已保存，官方配置和历史记录未改动"
}

ensure_manager_home() {
  mkdir -p "$MANAGER_HOME"
  chmod 700 "$MANAGER_HOME"
}

set_mode() {
  ensure_manager_home
  printf '%s\n' "$1" > "$MODE_FILE"
  chmod 600 "$MODE_FILE"
}

get_mode() {
  if [ -f "$MODE_FILE" ]; then
    sed -n '1p' "$MODE_FILE"
  elif [ -f "$GLOBAL_ORIGINAL_STATE" ]; then
    printf 'desktop\n'
  elif [ -f "$PROFILE_CONFIG" ]; then
    printf 'profile\n'
  elif [ -f "$SHELL_RC" ] && grep -qF "$MANAGED_BEGIN" "$SHELL_RC"; then
    printf 'legacy-cli\n'
  else
    printf 'official\n'
  fi
}

restore_profile_config() {
  [ -f "$PROFILE_ORIGINAL_STATE" ] || return 0

  case "$(sed -n '1p' "$PROFILE_ORIGINAL_STATE")" in
    present)
      [ -f "$PROFILE_BACKUP" ] || die "找不到原 profile 备份，无法安全恢复"
      cp -p "$PROFILE_BACKUP" "$PROFILE_CONFIG"
      ;;
    missing)
      if [ -f "$PROFILE_CONFIG" ]; then
        mv "$PROFILE_CONFIG" "$PROFILE_CONFIG.newapi-removed.$(timestamp)"
      fi
      ;;
    *)
      die "无法识别原 profile 状态，已停止以避免误操作"
      ;;
  esac

  rm -f "$PROFILE_BACKUP" "$PROFILE_ORIGINAL_STATE"
}

prepare_global_backup() {
  ensure_manager_home
  if [ -f "$GLOBAL_ORIGINAL_STATE" ]; then
    return
  fi

  if [ -f "$GLOBAL_CONFIG" ]; then
    cp -p "$GLOBAL_CONFIG" "$GLOBAL_BACKUP"
    chmod 600 "$GLOBAL_BACKUP"
    printf 'present\n' > "$GLOBAL_ORIGINAL_STATE"
  else
    printf 'missing\n' > "$GLOBAL_ORIGINAL_STATE"
  fi
  chmod 600 "$GLOBAL_ORIGINAL_STATE"
}

prepare_auth_backup() {
  ensure_manager_home
  if [ -f "$AUTH_ORIGINAL_STATE" ]; then
    return
  fi

  if [ -f "$AUTH_CONFIG" ]; then
    cp -p "$AUTH_CONFIG" "$AUTH_BACKUP"
    chmod 600 "$AUTH_BACKUP"
    printf 'present\n' > "$AUTH_ORIGINAL_STATE"
  else
    printf 'missing\n' > "$AUTH_ORIGINAL_STATE"
  fi
  chmod 600 "$AUTH_ORIGINAL_STATE"
}

write_desktop_config() {
  prepare_global_backup
  mkdir -p "$GLOBAL_HOME"
  chmod 700 "$GLOBAL_HOME"

  local source_config="/dev/null"
  local tmp="$GLOBAL_CONFIG.codex-newapi.tmp.$$"
  if [ "$(sed -n '1p' "$GLOBAL_ORIGINAL_STATE")" = "present" ]; then
    [ -f "$GLOBAL_BACKUP" ] || die "找不到原配置备份，已停止以避免覆盖现有配置"
    source_config="$GLOBAL_BACKUP"
  fi

  umask 077
  cat > "$tmp" <<EOF
# New API managed desktop defaults
model = "$MODEL"
model_provider = "newapi"
model_reasoning_effort = "$REASONING"

EOF

  awk '
    BEGIN { top_level = 1; skip_newapi = 0 }
    /^[[:space:]]*\[/ {
      top_level = 0
      if ($0 ~ /^[[:space:]]*\[model_providers\.newapi([.][^]]+)?\][[:space:]]*$/) {
        skip_newapi = 1
        next
      }
      skip_newapi = 0
    }
    skip_newapi { next }
    top_level && /^[[:space:]]*model[[:space:]]*=/ { next }
    top_level && /^[[:space:]]*model_provider[[:space:]]*=/ { next }
    top_level && /^[[:space:]]*model_reasoning_effort[[:space:]]*=/ { next }
    top_level && /^[[:space:]]*forced_login_method[[:space:]]*=/ { next }
    top_level && /^[[:space:]]*cli_auth_credentials_store[[:space:]]*=/ { next }
    { print }
  ' "$source_config" >> "$tmp"

  cat >> "$tmp" <<EOF

[model_providers.newapi]
name = "New API"
base_url = "$BASE_URL"
wire_api = "responses"
request_max_retries = 4
stream_max_retries = 10
stream_idle_timeout_ms = 300000

[model_providers.newapi.auth]
command = "$AUTH_COMMAND"
args = $AUTH_ARGS
timeout_ms = 5000
refresh_interval_ms = 0
EOF

  chmod 600 "$tmp"
  mv "$tmp" "$GLOBAL_CONFIG"
  log "Codex 桌面版和默认命令已切换到 New API"
}

remove_shell_wrapper() {
  if [ -f "$SHELL_RC" ] && grep -qF "$MANAGED_BEGIN" "$SHELL_RC"; then
    backup_file "$SHELL_RC"
    remove_managed_block "$SHELL_RC"
  fi
}

restore_global_config() {
  [ -f "$GLOBAL_ORIGINAL_STATE" ] || return 0

  case "$(sed -n '1p' "$GLOBAL_ORIGINAL_STATE")" in
    present)
      [ -f "$GLOBAL_BACKUP" ] || die "找不到原配置备份，无法安全恢复"
      mkdir -p "$GLOBAL_HOME"
      cp -p "$GLOBAL_BACKUP" "$GLOBAL_CONFIG"
      ;;
    missing)
      if [ -f "$GLOBAL_CONFIG" ]; then
        mv "$GLOBAL_CONFIG" "$GLOBAL_CONFIG.newapi-removed.$(timestamp)"
      fi
      ;;
    *)
      die "无法识别原配置状态，已停止以避免误操作"
      ;;
  esac

  rm -f "$GLOBAL_BACKUP" "$GLOBAL_ORIGINAL_STATE"
}

restore_auth_config() {
  [ -f "$AUTH_ORIGINAL_STATE" ] || return 0

  case "$(sed -n '1p' "$AUTH_ORIGINAL_STATE")" in
    present)
      [ -f "$AUTH_BACKUP" ] || die "找不到原登录状态备份，无法安全恢复"
      mkdir -p "$GLOBAL_HOME"
      cp -p "$AUTH_BACKUP" "$AUTH_CONFIG"
      ;;
    missing)
      rm -f "$AUTH_CONFIG"
      ;;
    *)
      die "无法识别原登录状态，已停止以避免误操作"
      ;;
  esac

  rm -f "$AUTH_BACKUP" "$AUTH_ORIGINAL_STATE"
}

write_shell_wrapper() {
  local rc_dir
  rc_dir="$(dirname "$SHELL_RC")"
  mkdir -p "$rc_dir"
  if [ -f "$SHELL_RC" ]; then
    backup_file "$SHELL_RC"
  else
    touch "$SHELL_RC"
  fi
  remove_managed_block "$SHELL_RC"

  local quoted_bin
  printf -v quoted_bin '%q' "$CODEX_BIN"

  cat >> "$SHELL_RC" <<EOF

$MANAGED_BEGIN
# New API uses a named profile while sharing the official Codex history store.
codex-newapi() {
  $quoted_bin --profile newapi "\$@"
}
$MANAGED_END
EOF
  log "codex-newapi 命令已设置"
}

print_cli_summary() {
  cat <<'EOF'

New API profile 已启用。
Codex App、ChatGPT 登录、Cloud、Remote Control 和历史记录保持不变。

重新打开终端，然后输入：
  codex-newapi
EOF
}

credential_exists() {
  if [ "$PLATFORM" = "macos" ]; then
    security find-generic-password -a "$USER" -s "$KEY_SERVICE" >/dev/null 2>&1
  elif command -v secret-tool >/dev/null 2>&1 && \
       [ -n "${DBUS_SESSION_BUS_ADDRESS:-}" ] && \
       secret-tool lookup service "$KEY_SERVICE" account "$USER" >/dev/null 2>&1; then
    return 0
  else
    [ -s "$MANAGER_HOME/credentials/newapi.key" ]
  fi
}

show_status() {
  local mode credential
  mode="$(get_mode)"
  if credential_exists; then
    credential="已保存"
  else
    credential="未保存"
  fi

  case "$mode" in
    profile) printf '\n当前模式：仅命令行使用 New API，桌面版保持官方\n' ;;
    desktop) printf '\n当前模式：桌面版和命令行使用 New API（共用历史）\n' ;;
    global) printf '\n当前模式：桌面版和命令行使用 New API（旧版配置，可直接重新安装）\n' ;;
    legacy-cli|cli) printf '\n当前模式：旧版隔离配置，请运行 install 共用历史\n' ;;
    *) printf '\n当前模式：官方默认\n' ;;
  esac
  printf 'New API 密钥：%s\n' "$credential"
}

install_profile_mode() {
  if [ -f "$GLOBAL_ORIGINAL_STATE" ]; then
    restore_global_config
  fi
  if [ -f "$AUTH_ORIGINAL_STATE" ]; then
    restore_auth_config
  fi
  configure_credential 0
  write_profile_config
  write_shell_wrapper
  set_mode "profile"
  print_cli_summary
}

install_desktop_mode() {
  # v0.0.23 replaced auth.json with a CLI API login. Restore the original
  # account state before switching back to provider-managed authentication.
  if [ -f "$AUTH_ORIGINAL_STATE" ]; then
    restore_auth_config
  fi
  configure_credential 0
  write_profile_config
  write_shell_wrapper
  prepare_auth_backup
  if ! write_desktop_config; then
    restore_global_config
    restore_auth_config
    set_mode "profile"
    die "桌面版登录配置失败，已恢复原配置"
  fi
  set_mode "desktop"

  cat <<'EOF'

Codex 桌面版和命令行已切换到 New API。
原 config.toml 和 auth.json 已备份，可从菜单恢复。
本地历史记录始终保留在默认 .codex 目录中，未搬移。
请完全退出并重新打开 Codex 桌面版。
Cloud 或 Remote Control 需要官方服务时，请重新运行脚本并选择方式 1。
EOF
}

rotate_credential() {
  configure_credential 1
  printf '\nNew API 密钥已更换。\n'
}

delete_credential() {
  if [ "$PLATFORM" = "macos" ]; then
    security delete-generic-password -a "$USER" -s "$KEY_SERVICE" >/dev/null 2>&1 || true
  else
    if command -v secret-tool >/dev/null 2>&1 && \
       [ -n "${DBUS_SESSION_BUS_ADDRESS:-}" ]; then
      secret-tool clear service "$KEY_SERVICE" account "$USER" >/dev/null 2>&1 || true
    fi
    if [ -f "$MANAGER_HOME/credentials/newapi.key" ]; then
      rm -f "$MANAGER_HOME/credentials/newapi.key"
    fi
  fi
}

restore_default() {
  local delete_key="${1:-0}"
  remove_shell_wrapper
  restore_global_config
  restore_auth_config
  restore_profile_config

  if [ "$delete_key" -eq 1 ]; then
    delete_credential
  fi

  rm -f "$MODE_FILE"

  cat <<'EOF'

已恢复官方默认配置。
请重新打开终端或 Codex 客户端。
EOF
}

confirm() {
  local answer=""
  printf '%s [y/N] ' "$1"
  IFS= read -r answer <&3
  case "$answer" in
    y|Y|yes|YES) return 0 ;;
    *) return 1 ;;
  esac
}

pause_menu() {
  printf '\n按回车返回菜单...'
  IFS= read -r _pause <&3
}

interactive_menu() {
  [ -t 3 ] || die "交互菜单需要在终端中运行"

  while true; do
    cat <<'EOF'

Codex New API 管理

  1. 仅命令行使用 New API（推荐）
     codex-newapi 使用 New API，桌面版保持官方

  2. 桌面版和命令行都使用 New API
     使用默认 .codex；原位保留历史；自动备份官方配置

  3. 更换 New API 密钥
  4. 查看当前状态
  5. 移除 New API 配置，恢复官方默认
  0. 退出
EOF
    printf '\n请选择：'
    local choice=""
    IFS= read -r choice <&3

    case "$choice" in
      1)
        install_profile_mode
        pause_menu
        ;;
      2)
        install_desktop_mode
        pause_menu
        ;;
      3)
        rotate_credential
        pause_menu
        ;;
      4)
        show_status
        pause_menu
        ;;
      5)
        if confirm "恢复官方默认？"; then
          local delete_key=0
          if confirm "同时删除已保存的 New API 密钥？"; then
            delete_key=1
          fi
          restore_default "$delete_key"
        else
          printf '\n已取消。\n'
        fi
        pause_menu
        ;;
      0)
        printf '\n已退出。\n'
        return
        ;;
      *)
        printf '\n请输入 0–5。\n'
        ;;
    esac
  done
}

detect_platform
select_shell_rc
normalize_base_url
LINUX_ID="${LINUX_ID:-}"
if [ "$ACTION" = "restore" ] || [ "$ACTION" = "uninstall" ]; then
  CODEX_BIN="$(command -v codex 2>/dev/null || true)"
else
  find_codex_binary
fi

if [ "$DRY_RUN" -eq 1 ]; then
  cat <<EOF
Dry run only; no files or credentials changed.
Action:         $ACTION
Platform:       $PLATFORM${LINUX_ID:+ ($LINUX_ID)}
Codex binary:   $CODEX_BIN
Base URL:       $BASE_URL
Model:          $MODEL
Reasoning:      $REASONING
Profile config: $PROFILE_CONFIG
Shell startup:  $SHELL_RC
EOF
  exit 0
fi

case "$ACTION" in
  menu)
    interactive_menu
    ;;
  install)
    print_install_expectations
    install_profile_mode
    ;;
  desktop)
    print_install_expectations
    install_desktop_mode
    ;;
  global)
    warn "global 已更名为 desktop；继续按桌面版 New API 模式配置"
    install_desktop_mode
    ;;
  rotate-key)
    rotate_credential
    ;;
  status)
    show_status
    ;;
  restore|uninstall)
    restore_default 0
    ;;
esac
