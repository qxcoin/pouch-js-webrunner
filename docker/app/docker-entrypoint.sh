#!/usr/bin/env sh
set -e

npm --version
npm install --no-progress --no-audit --no-fund

if [[ "$1" != "start" ]]; then
  exec "$@"
fi

/usr/local/bin/wait

npm run build
npx typeorm-ts-node-esm migration:run -d ./dist/data-source.js

exec supervisord -c /etc/supervisord.conf
