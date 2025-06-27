#!/usr/bin/env bash

set -e

SERVER_PORT=${1:-8888}

current_dir=$(pwd)
script_dir=$(dirname "$0")

cd "${script_dir}"

java -Dspring.profiles.active=local -Dserver.port="${SERVER_PORT}" -jar api-app.jar

cd "${current_dir}"
