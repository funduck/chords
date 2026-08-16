#!/usr/bin/env sh
set -e

# Generate the TypeScript API client from the on-disk OpenAPI spec produced by the
# api (`swag init` -> api/docs/swagger.json). No running API is required.
#
# The repo root is mounted into the generator container so it can read the spec
# (api/docs/swagger.json) and write the client (app/generated/api).

cd "$(dirname "$0")" # app/

rm -rf generated/api

docker run --rm \
  -u "$(id -u):$(id -g)" \
  -v "${PWD}/..:/local" openapitools/openapi-generator-cli generate \
  -i /local/api/docs/swagger.json \
  -g typescript-fetch \
  --additional-properties=fileNaming=kebab-case,paramNaming=snake_case,modelPropertyNaming=snake_case,supportsES6=true \
  -o /local/app/generated/api
