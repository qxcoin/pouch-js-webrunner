#!/usr/bin/env sh
set -e

if [[ "$1" != "start" ]]; then
  exec "$@"
fi

npm --version
npm install --dev --no-progress --no-audit --no-fund

npm run clear
npm run build

npx typeorm migration:run -d ./dist/data-source.js

exec supervisord -c /etc/supervisord.conf
