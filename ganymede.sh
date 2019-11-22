#!/usr/bin/env bash

set -e
function realpath() { python -c "import os,sys; print(os.path.realpath(sys.argv[1]))" "$0"; }
APP="$(dirname "$(dirname "$(realpath "$0")")")"
"$APP/MacOS/Ganymede" --executed-from="$(pwd)" --pid=$$ --path-environment="$PATH" "$@" > /dev/null 2>&1 &
