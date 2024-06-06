#!/usr/bin/env sh
set -e

npm --version
npm install --no-progress --no-audit --no-fund

npm run clear
npm run build

if [[ "$1" != "start" ]]; then
  exec "$@"
fi

/usr/local/bin/wait

npx typeorm migration:run -d ./dist/data-source.js

exec supervisord -c /etc/supervisord.conf
