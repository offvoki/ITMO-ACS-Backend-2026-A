#!/bin/sh
set -eu

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
env_file="${1:-$script_dir/.env.deploy}"

if [ -e "$env_file" ]; then
  echo "Already exists: $env_file"
  exit 0
fi

umask 077
cat > "$env_file" <<EOF
JOBBY_DB_PASSWORD=$(openssl rand -hex 24)
JOBBY_RABBIT_USER=jobby
JOBBY_RABBIT_PASSWORD=$(openssl rand -hex 24)
JOBBY_INTERNAL_SECRET=$(openssl rand -hex 32)
JOBBY_JWT_SECRET=$(openssl rand -hex 32)
JOBBY_COOKIE_SECURE=false
EOF

echo "Created $env_file"
