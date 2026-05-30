#!/usr/bin/env bash
export DEVELOPER_DIR="${DEVELOPER_DIR:-/Applications/Xcode.app/Contents/Developer}"
export LANG="${LANG:-en_US.UTF-8}"
export LC_ALL="${LC_ALL:-en_US.UTF-8}"
if [[ ! -d "$DEVELOPER_DIR" ]]; then
  echo "ERROR: Xcode not found at $DEVELOPER_DIR"
  exit 1
fi
exec npx expo "$@"
