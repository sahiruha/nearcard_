#!/bin/bash
set -e

# NEAR Digital Card - Seed Data (Fund the pool)
# Usage: ./scripts/seed-data.sh <contract-account> <funder-account>

CONTRACT_ACCOUNT=${1:-"sbt.nearcard-dev.testnet"}
FUNDER_ACCOUNT=${2:-"nearcard-dev.testnet"}
DEPOSIT_AMOUNT=${3:-"5 NEAR"}  # 500 exchanges worth

echo "=== Funding Pool ==="
echo "Contract: $CONTRACT_ACCOUNT"
echo "Funder: $FUNDER_ACCOUNT"
echo "Amount: $DEPOSIT_AMOUNT"
echo ""

near contract call-function as-transaction "$CONTRACT_ACCOUNT" \
  deposit json-args '{}' prepaid-gas '10 Tgas' attached-deposit "$DEPOSIT_AMOUNT" \
  sign-as "$FUNDER_ACCOUNT" network-config testnet sign-with-keychain send

echo ""
echo "=== Verifying ==="

echo "Pool balance:"
near contract call-function as-read-only "$CONTRACT_ACCOUNT" \
  get_pool_balance json-args '{}' network-config testnet now

echo ""
echo "Transfer amount:"
near contract call-function as-read-only "$CONTRACT_ACCOUNT" \
  get_transfer_amount json-args '{}' network-config testnet now

echo ""
echo "SBT count:"
near contract call-function as-read-only "$CONTRACT_ACCOUNT" \
  get_sbt_count json-args '{}' network-config testnet now

echo ""
echo "=== Pool Funded! Ready for exchanges ==="
