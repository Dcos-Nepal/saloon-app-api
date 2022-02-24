#!/usr/bin/env bash

set -Eexo pipefail

main() {
  local function_name="$1"
  local image_uri="$2"
  local region="$3"

  aws lambda update-function-code --function-name "$function_name" --image-uri "$image_uri" --region "$region"
}

main "$@"
