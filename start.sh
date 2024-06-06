#!/usr/bin/env sh

if [[ "$APP_ENV" == "development" && "$1" == "web" ]]; then
  exec npm run watch -- "$@";
elif [[ "$APP_ENV" == "development" ]]; then
  exec npm run dev -- "$@";
elif [[ "$APP_ENV" == "production" ]]; then
  exec npm run prod -- "$@";
fi
