#!/bin/sh
# Generate htpasswd from env vars
htpasswd -bc /etc/nginx/.htpasswd "${DEVSTATION_USER:-admin}" "${DEVSTATION_PASS:-devstation}"
exec "$@"
