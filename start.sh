#!/usr/bin/env sh

if [[ "$NODE_ENV" == "development" && "$1" == "web" ]]; then
  exec npm run watch -- "$@";
elif [[ "$NODE_ENV" == "development" ]]; then
  exec npm run dev -- "$@";
elif [[ "$NODE_ENV" == "production" || "$NODE_ENV" == "staging" ]]; then
  exec npm run prod -- "$@";
fi
