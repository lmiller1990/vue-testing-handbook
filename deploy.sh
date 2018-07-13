#!/usr/bin/env sh

# abort on errors
set -e

# build
yarn docs:build

# navigate into the build output directory
rm -rf docs

mv src/.vuepress/dist docs

# if you are deploying to a custom domain
# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m 'deploy'

# if you are deploying to https://<USERNAME>.github.io/<REPO>
git push -f git@github.com:lmiller1990/vue-testing-handbook.git master

cd -
