#!/usr/bin/env bash

set -e
function realpath() { python -c "import os,sys; print(os.path.realpath(sys.argv[1]))" "$0"; }
APP="$(dirname "$(dirname "$(dirname "$(realpath "$0")")")")"
open -a "$APP" --args --executed-from="$(pwd)" --pid=$$ --path-environment="$PATH" "$@"
