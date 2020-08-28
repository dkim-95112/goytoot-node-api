#!/bin/sh

# Decrypt the file
OUT_FILE=./keys/dkim_private_key.pem
if [ ! -f "$OUT_FILE" ]; then
  IN_FILE=./keys/dkim_private_key.pem.gpg
  # --batch to prevent interactive command
  # --yes to assume "yes" for questions
  gpg --batch --yes --decrypt --passphrase="$DKIM_PRIVATE_KEY_PASSPHRASE" \
  --output "$OUT_FILE" $IN_FILE
fi
