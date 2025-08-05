#!/bin/bash

rm api/dev.sqlite

./download-5lad.sh

cd api && ./bin/uploader -f ../data/5lad/www.5lad.net/akkordy/zemfira -lib 5lad