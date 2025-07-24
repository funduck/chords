#!/bin/bash
# filepath: start-caddy.sh
set -a  # automatically export all variables
source .env
set +a
caddy run --config Caddyfile