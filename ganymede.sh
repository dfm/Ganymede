#!/usr/bin/env bash

set -e
function realpath() { python -c "import os,sys; print(os.path.realpath(sys.argv[1]))" "$0"; }
CONTENTS="$(dirname "$(dirname "$(realpath "$0")")")"
APP="$CONTENTS/MacOS/Ganymede"
open -a "$APP" -n --args --executed-from="$(pwd)" --pid=$$ --path-environment="$PATH" "$@"
