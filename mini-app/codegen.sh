source .env

# API
echo $CODEGEN_API_URI/swagger/doc.json
curl -sL $CODEGEN_API_URI/swagger/doc.json -o api.json

rm -rf src/generated/api

docker run --rm \
  -u $(id -u):$(id -g) \
  -v ${PWD}:/local openapitools/openapi-generator-cli generate \
  -i /local/api.json \
  -g typescript-fetch \
  --additional-properties=fileNaming=kebab-case,paramNaming=snake_case,modelPropertyNaming=snake_case,supportsES6=true, \
  -o /local/src/generated/api

rm api.json

