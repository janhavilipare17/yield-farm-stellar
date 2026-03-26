#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    token, Address, Env,
};

#[contracttype]
pub enum DataKey {
    Admin,
    TokenAddress,
    RewardRate,
    StakeBalance(Address),
    StakeTimestamp(Address),
    TotalStaked,
}

#[contract]
pub struct StakingContract;

#[contractimpl]
impl StakingContract {
    pub fn initialize(
        env: Env,
        admin: Address,
        token_address: Address,
        reward_rate: u64,
    ) {
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TokenAddress, &token_address);
        env.storage().instance().set(&DataKey::RewardRate, &reward_rate);
        env.storage().instance().set(&DataKey::TotalStaked, &0i128);
    }

    pub fn stake(env: Env, user: Address, amount: i128) {
        user.require_auth();
        assert!(amount > 0, "Amount must be positive");

        let token_address: Address = env.storage()
            .instance()
            .get(&DataKey::TokenAddress)
            .unwrap();

        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&user, &env.current_contract_address(), &amount);

        let current_balance: i128 = env.storage()
            .persistent()
            .get(&DataKey::StakeBalance(user.clone()))
            .unwrap_or(0);

        env.storage()
            .persistent()
            .set(&DataKey::StakeBalance(user.clone()), &(current_balance + amount));

        env.storage()
            .persistent()
            .set(&DataKey::StakeTimestamp(user.clone()), &env.ledger().timestamp());

        let total: i128 = env.storage()
            .instance()
            .get(&DataKey::TotalStaked)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::TotalStaked, &(total + amount));

        env.events().publish((symbol_short!("staked"), user), amount);
    }

    pub fn unstake(env: Env, user: Address, amount: i128) {
        user.require_auth();

        let current_balance: i128 = env.storage()
            .persistent()
            .get(&DataKey::StakeBalance(user.clone()))
            .unwrap_or(0);

        assert!(current_balance >= amount, "Insufficient staked balance");

        let token_address: Address = env.storage()
            .instance()
            .get(&DataKey::TokenAddress)
            .unwrap();

        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&env.current_contract_address(), &user, &amount);

        env.storage()
            .persistent()
            .set(&DataKey::StakeBalance(user.clone()), &(current_balance - amount));

        let total: i128 = env.storage()
            .instance()
            .get(&DataKey::TotalStaked)
            .unwrap_or(0);
        env.storage()
            .instance()
            .set(&DataKey::TotalStaked, &(total - amount));

        env.events().publish((symbol_short!("unstaked"), user), amount);
    }

    pub fn claim_rewards(env: Env, user: Address) {
        user.require_auth();

        let rewards = Self::get_rewards(env.clone(), user.clone());
        assert!(rewards > 0, "No rewards to claim");

        let token_address: Address = env.storage()
            .instance()
            .get(&DataKey::TokenAddress)
            .unwrap();

        let token_client = token::Client::new(&env, &token_address);
        token_client.transfer(&env.current_contract_address(), &user, &rewards);

        env.storage()
            .persistent()
            .set(&DataKey::StakeTimestamp(user.clone()), &env.ledger().timestamp());

        env.events().publish((symbol_short!("rewarded"), user), rewards);
    }

    pub fn get_stake(env: Env, user: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::StakeBalance(user))
            .unwrap_or(0)
    }

    pub fn get_rewards(env: Env, user: Address) -> i128 {
        let stake: i128 = env.storage()
            .persistent()
            .get(&DataKey::StakeBalance(user.clone()))
            .unwrap_or(0);

        if stake == 0 {
            return 0;
        }

        let timestamp: u64 = env.storage()
            .persistent()
            .get(&DataKey::StakeTimestamp(user))
            .unwrap_or(env.ledger().timestamp());

        let reward_rate: u64 = env.storage()
            .instance()
            .get(&DataKey::RewardRate)
            .unwrap_or(100);

        let time_elapsed = env.ledger().timestamp() - timestamp;
        let rewards = (stake * time_elapsed as i128 * reward_rate as i128) / 1_000_000;

        rewards
    }

    pub fn get_total_staked(env: Env) -> i128 {
        env.storage()
            .instance()
            .get(&DataKey::TotalStaked)
            .unwrap_or(0)
    }

    pub fn get_admin(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Admin).unwrap()
    }

    pub fn get_reward_rate(env: Env) -> u64 {
        env.storage()
            .instance()
            .get(&DataKey::RewardRate)
            .unwrap_or(100)
    }
}