#! /bin/bash
yarn build && cd dist &&
  git init && git add -A && git commit -m "deploy" && git push -f git@github.com:jeffreyyang3/jeffreyyang3.github.io.git master:gh-pages
