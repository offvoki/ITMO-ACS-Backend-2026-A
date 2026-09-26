#!/usr/bin/env bash
set -euo pipefail

release_dir="${1:?Pass the absolute release directory}"
case "$release_dir" in
  /opt/jobby/releases/*) ;;
  *) echo 'Release must be under /opt/jobby/releases' >&2; exit 1 ;;
esac

compose_dir="$release_dir/lab23"
deploy_file="$release_dir/lab4/docker-compose.deploy.yml"
env_file=/opt/jobby/lab4/.env.deploy

test -f "$compose_dir/docker-compose.yml"
test -f "$deploy_file"
mkdir -p /opt/jobby/lab4
if [ ! -f "$env_file" ]; then
  sh "$release_dir/lab4/prepare-env.sh" "$env_file"
fi
chmod 600 "$env_file"

cd "$compose_dir"
compose=(docker compose -p jobby --env-file "$env_file" \
  -f docker-compose.yml -f "$deploy_file")
"${compose[@]}" config --quiet

# The lab server has limited memory, so build one service at a time.
for service in dictionary-service user-service vacancy-service \
  resume-service application-service notification-service; do
  "${compose[@]}" build "$service"
done

"${compose[@]}" up --no-build -d --remove-orphans

for service in user vacancy resume application dictionary; do
  ready=0
  for attempt in $(seq 1 30); do
    if curl --fail --silent --show-error --max-time 3 \
      "http://127.0.0.1/health/$service" >/dev/null 2>&1; then
      ready=1
      break
    fi
    sleep 2
  done
  if [ "$ready" -ne 1 ]; then
    echo "Health check failed: $service" >&2
    "${compose[@]}" ps >&2
    exit 1
  fi
done

notification_id="$("${compose[@]}" ps -q notification-service)"
if [ -z "$notification_id" ] || \
  [ "$(docker inspect -f '{{.State.Running}}' "$notification_id")" != true ]; then
  echo 'Notification service is not running' >&2
  "${compose[@]}" ps >&2
  exit 1
fi

ln -sfn "$release_dir" /opt/jobby/current
echo "Deployment succeeded: $release_dir"
