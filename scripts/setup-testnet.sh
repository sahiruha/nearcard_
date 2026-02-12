#!/bin/bash
set -e

# NEAR Digital Card - Testnet Account Setup
# Prerequisites: Create nearcard-dev.testnet at https://testnet.mynearwallet.com/

PARENT_ACCOUNT=${1:-"nearcard-dev.testnet"}
SUB_ACCOUNT="sbt.$PARENT_ACCOUNT"

echo "=== NEAR Digital Card - Testnet Setup ==="
echo ""
echo "Step 1: Create a testnet account"
echo "  Go to: https://testnet.mynearwallet.com/"
echo "  Create account: $PARENT_ACCOUNT"
echo ""
echo "Step 2: Create sub-account for contract deployment"
echo "  Running: near account create-account ..."
echo ""

near account create-account fund-myself "$SUB_ACCOUNT" \
  '5 NEAR' autogenerate-new-keypair save-to-keychain \
  sign-as "$PARENT_ACCOUNT" network-config testnet sign-with-keychain send

echo ""
echo "=== Setup Complete ==="
echo "Parent account: $PARENT_ACCOUNT"
echo "Contract account: $SUB_ACCOUNT"
echo ""
echo "Next steps:"
echo "  1. Run: ./scripts/deploy.sh $SUB_ACCOUNT $PARENT_ACCOUNT"
echo "  2. Run: ./scripts/seed-data.sh $SUB_ACCOUNT $PARENT_ACCOUNT"
