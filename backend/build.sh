#!/bin/bash

(
  # Save and move into root
  cd "$(dirname "$0")/.." || exit 1

  # Build from root using Dockerfile in backend/
  docker build -f backend/Dockerfile -t zkkzkk32312/insighthub-backend .
)

# Back to original directory automatically after subshell exits
