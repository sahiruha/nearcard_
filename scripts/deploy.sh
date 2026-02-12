#!/bin/bash
set -e

# NEAR Digital Card - Contract Build & Deploy Script
# Usage: ./scripts/deploy.sh <account-id>
# Example: ./scripts/deploy.sh sbt.nearcard-dev.testnet

CONTRACT_ACCOUNT=${1:-"sbt.nearcard-dev.testnet"}
OWNER_ACCOUNT=${2:-"nearcard-dev.testnet"}
TRANSFER_AMOUNT="10000000000000000000000"  # 0.01 NEAR in yoctoNEAR

echo "=== Building NEAR Digital Card Contract ==="
cd "$(dirname "$0")/../contract"

# Build the contract
echo "Building with cargo near..."
export PATH="$HOME/.cargo/bin:$PATH"
cargo near build non-reproducible-wasm 2>&1 || {
  echo "cargo near build failed, trying manual build..."
  cargo build --target wasm32-unknown-unknown --release
  mkdir -p target/near
  cp target/wasm32-unknown-unknown/release/nearcard_sbt.wasm target/near/nearcard_sbt.wasm
}

WASM_FILE=$(find target -name "nearcard_sbt.wasm" | head -1)

if [ -z "$WASM_FILE" ]; then
  echo "ERROR: WASM file not found"
  exit 1
fi

echo "WASM file: $WASM_FILE"
echo "Size: $(wc -c < "$WASM_FILE") bytes"

echo ""
echo "=== Deploying to $CONTRACT_ACCOUNT ==="
near contract deploy "$CONTRACT_ACCOUNT" \
  use-file "$WASM_FILE" \
  with-init-call new \
  json-args "{\"owner\":\"$OWNER_ACCOUNT\",\"transfer_amount\":\"$TRANSFER_AMOUNT\"}" \
  prepaid-gas '30 Tgas' attached-deposit '0 NEAR' \
  network-config testnet sign-with-keychain send

echo ""
echo "=== Deploy Complete ==="
echo "Contract: $CONTRACT_ACCOUNT"
echo "Owner: $OWNER_ACCOUNT"
echo "Transfer Amount: 0.01 NEAR"
