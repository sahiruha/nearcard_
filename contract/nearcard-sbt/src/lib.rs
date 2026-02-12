use near_sdk::borsh::BorshSerialize;
use near_sdk::json_types::U128;
use near_sdk::store::LookupMap;
use near_sdk::{env, log, near, AccountId, BorshStorageKey, NearToken, PanicOnDefault, Promise};

#[derive(BorshStorageKey, BorshSerialize)]
#[borsh(crate = "near_sdk::borsh")]
enum StorageKey {
    SbtsById,
    SbtsByOwner,
}

#[near(serializers = [borsh, json])]
#[derive(Clone)]
pub struct ConnectionSBT {
    pub token_id: u64,
    pub party_a: AccountId,
    pub party_b: AccountId,
    pub timestamp_ns: u64,
    pub event_name: String,
}

#[near(contract_state)]
#[derive(PanicOnDefault)]
pub struct NearCardContract {
    pub owner: AccountId,
    pub sbt_counter: u64,
    pub sbts_by_id: LookupMap<u64, ConnectionSBT>,
    pub sbts_by_owner: LookupMap<AccountId, Vec<u64>>,
    pub funding_pool_balance: u128,
    pub transfer_amount: u128,
}

#[near]
impl NearCardContract {
    #[init]
    pub fn new(owner: AccountId, transfer_amount: U128) -> Self {
        assert!(!env::state_exists(), "Already initialized");
        Self {
            owner,
            sbt_counter: 0,
            sbts_by_id: LookupMap::new(StorageKey::SbtsById),
            sbts_by_owner: LookupMap::new(StorageKey::SbtsByOwner),
            funding_pool_balance: 0,
            transfer_amount: transfer_amount.0,
        }
    }

    // === Change Methods ===

    #[payable]
    pub fn deposit(&mut self) {
        let deposit = env::attached_deposit();
        assert!(deposit > NearToken::from_near(0), "Must attach NEAR to deposit");
        self.funding_pool_balance += deposit.as_yoctonear();
        log!(
            "Deposited {} yoctoNEAR into pool. New balance: {}",
            deposit.as_yoctonear(),
            self.funding_pool_balance
        );
    }

    #[payable]
    pub fn exchange_cards(&mut self, party_b: AccountId, event_name: String) -> (u64, u64) {
        let party_a = env::predecessor_account_id();
        assert_ne!(party_a, party_b, "Cannot exchange cards with yourself");

        assert!(
            self.funding_pool_balance >= self.transfer_amount,
            "Insufficient pool balance for transfer"
        );

        let timestamp_ns = env::block_timestamp();

        // Mint SBT for party_a
        self.sbt_counter += 1;
        let sbt_a_id = self.sbt_counter;
        let sbt_a = ConnectionSBT {
            token_id: sbt_a_id,
            party_a: party_a.clone(),
            party_b: party_b.clone(),
            timestamp_ns,
            event_name: event_name.clone(),
        };
        self.sbts_by_id.insert(sbt_a_id, sbt_a);
        let mut a_tokens = self.sbts_by_owner.get(&party_a).cloned().unwrap_or_default();
        a_tokens.push(sbt_a_id);
        self.sbts_by_owner.insert(party_a.clone(), a_tokens);

        // Mint SBT for party_b
        self.sbt_counter += 1;
        let sbt_b_id = self.sbt_counter;
        let sbt_b = ConnectionSBT {
            token_id: sbt_b_id,
            party_a: party_a.clone(),
            party_b: party_b.clone(),
            timestamp_ns,
            event_name,
        };
        self.sbts_by_id.insert(sbt_b_id, sbt_b);
        let mut b_tokens = self.sbts_by_owner.get(&party_b).cloned().unwrap_or_default();
        b_tokens.push(sbt_b_id);
        self.sbts_by_owner.insert(party_b.clone(), b_tokens);

        // Transfer NEAR from pool to party_b
        self.funding_pool_balance -= self.transfer_amount;
        let _ = Promise::new(party_b.clone()).transfer(NearToken::from_yoctonear(self.transfer_amount));

        log!(
            "Cards exchanged! SBT #{} for {}, SBT #{} for {}. Transferred {} yoctoNEAR to {}",
            sbt_a_id,
            party_a,
            sbt_b_id,
            party_b,
            self.transfer_amount,
            party_b
        );

        (sbt_a_id, sbt_b_id)
    }

    pub fn set_transfer_amount(&mut self, amount: U128) {
        assert_eq!(
            env::predecessor_account_id(),
            self.owner,
            "Only owner can change transfer amount"
        );
        self.transfer_amount = amount.0;
        log!("Transfer amount updated to {}", amount.0);
    }

    // === View Methods ===

    pub fn get_sbt(&self, token_id: u64) -> Option<ConnectionSBT> {
        self.sbts_by_id.get(&token_id).cloned()
    }

    pub fn get_sbts_by_owner(&self, account_id: AccountId) -> Vec<ConnectionSBT> {
        match self.sbts_by_owner.get(&account_id) {
            Some(token_ids) => token_ids
                .iter()
                .filter_map(|id| self.sbts_by_id.get(id).cloned())
                .collect(),
            None => vec![],
        }
    }

    pub fn get_pool_balance(&self) -> U128 {
        U128(self.funding_pool_balance)
    }

    pub fn get_sbt_count(&self) -> u64 {
        self.sbt_counter
    }

    pub fn get_transfer_amount(&self) -> U128 {
        U128(self.transfer_amount)
    }

    pub fn get_owner(&self) -> AccountId {
        self.owner.clone()
    }
}

// === Unit Tests ===
#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::test_utils::VMContextBuilder;
    use near_sdk::testing_env;

    fn get_context(predecessor: &str) -> VMContextBuilder {
        let mut builder = VMContextBuilder::new();
        builder
            .predecessor_account_id(predecessor.parse().unwrap())
            .current_account_id("contract.testnet".parse().unwrap());
        builder
    }

    #[test]
    fn test_new() {
        let context = get_context("owner.testnet");
        testing_env!(context.build());

        let contract = NearCardContract::new(
            "owner.testnet".parse().unwrap(),
            U128(10_000_000_000_000_000_000_000),
        );

        assert_eq!(contract.get_sbt_count(), 0);
        assert_eq!(contract.get_pool_balance().0, 0);
        assert_eq!(contract.get_transfer_amount().0, 10_000_000_000_000_000_000_000);
        assert_eq!(contract.get_owner().to_string(), "owner.testnet");
    }

    #[test]
    fn test_deposit() {
        let mut context = get_context("funder.testnet");
        context.attached_deposit(NearToken::from_near(5));
        testing_env!(context.build());

        let mut contract = NearCardContract::new(
            "owner.testnet".parse().unwrap(),
            U128(10_000_000_000_000_000_000_000),
        );

        contract.deposit();
        assert_eq!(contract.get_pool_balance().0, 5_000_000_000_000_000_000_000_000);
    }

    #[test]
    fn test_exchange_cards() {
        let mut context = get_context("owner.testnet");
        testing_env!(context.build());

        let mut contract = NearCardContract::new(
            "owner.testnet".parse().unwrap(),
            U128(10_000_000_000_000_000_000_000),
        );

        context.attached_deposit(NearToken::from_near(5));
        testing_env!(context.build());
        contract.deposit();

        context = get_context("alice.testnet");
        context.attached_deposit(NearToken::from_near(0));
        testing_env!(context.build());

        let (sbt_a, sbt_b) = contract.exchange_cards(
            "bob.testnet".parse().unwrap(),
            "NEAR Conference 2026".to_string(),
        );

        assert_eq!(sbt_a, 1);
        assert_eq!(sbt_b, 2);
        assert_eq!(contract.get_sbt_count(), 2);

        let sbt = contract.get_sbt(1).unwrap();
        assert_eq!(sbt.party_a.to_string(), "alice.testnet");
        assert_eq!(sbt.party_b.to_string(), "bob.testnet");
        assert_eq!(sbt.event_name, "NEAR Conference 2026");

        let alice_sbts = contract.get_sbts_by_owner("alice.testnet".parse().unwrap());
        assert_eq!(alice_sbts.len(), 1);
        let bob_sbts = contract.get_sbts_by_owner("bob.testnet".parse().unwrap());
        assert_eq!(bob_sbts.len(), 1);

        let expected_balance = 5_000_000_000_000_000_000_000_000u128 - 10_000_000_000_000_000_000_000u128;
        assert_eq!(contract.get_pool_balance().0, expected_balance);
    }

    #[test]
    #[should_panic(expected = "Cannot exchange cards with yourself")]
    fn test_exchange_with_self() {
        let mut context = get_context("owner.testnet");
        testing_env!(context.build());

        let mut contract = NearCardContract::new(
            "owner.testnet".parse().unwrap(),
            U128(10_000_000_000_000_000_000_000),
        );

        context.attached_deposit(NearToken::from_near(5));
        testing_env!(context.build());
        contract.deposit();

        context = get_context("alice.testnet");
        context.attached_deposit(NearToken::from_near(0));
        testing_env!(context.build());

        contract.exchange_cards("alice.testnet".parse().unwrap(), "Test".to_string());
    }

    #[test]
    #[should_panic(expected = "Insufficient pool balance")]
    fn test_exchange_insufficient_pool() {
        let mut context = get_context("owner.testnet");
        testing_env!(context.build());

        let mut contract = NearCardContract::new(
            "owner.testnet".parse().unwrap(),
            U128(10_000_000_000_000_000_000_000),
        );

        context = get_context("alice.testnet");
        context.attached_deposit(NearToken::from_near(0));
        testing_env!(context.build());

        contract.exchange_cards("bob.testnet".parse().unwrap(), "Test".to_string());
    }

    #[test]
    fn test_set_transfer_amount() {
        let context = get_context("owner.testnet");
        testing_env!(context.build());

        let mut contract = NearCardContract::new(
            "owner.testnet".parse().unwrap(),
            U128(10_000_000_000_000_000_000_000),
        );

        contract.set_transfer_amount(U128(20_000_000_000_000_000_000_000));
        assert_eq!(contract.get_transfer_amount().0, 20_000_000_000_000_000_000_000);
    }

    #[test]
    #[should_panic(expected = "Only owner can change transfer amount")]
    fn test_set_transfer_amount_not_owner() {
        let mut context = get_context("owner.testnet");
        testing_env!(context.build());

        let mut contract = NearCardContract::new(
            "owner.testnet".parse().unwrap(),
            U128(10_000_000_000_000_000_000_000),
        );

        context = get_context("alice.testnet");
        testing_env!(context.build());

        contract.set_transfer_amount(U128(20_000_000_000_000_000_000_000));
    }
}
