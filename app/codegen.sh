source .env

# In dev mode
# API
echo api-dev:8080/swagger/doc.json
curl -sL api-dev:8080/swagger/doc.json -o api.json

rm -rf generated/api

docker run --rm \
  -u $(id -u):$(id -g) \
  -v ${PWD}:/local openapitools/openapi-generator-cli generate \
  -i /local/api.json \
  -g typescript-fetch \
  --additional-properties=fileNaming=kebab-case,paramNaming=snake_case,modelPropertyNaming=snake_case,supportsES6=true, \
  -o /local/generated/api

rm api.json

