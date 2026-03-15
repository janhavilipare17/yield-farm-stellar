#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short,
    token, Address, Env, String,
};

#[contracttype]
pub enum DataKey {
    Admin,
    TokenAddress,
}

#[contract]
pub struct TokenContract;

#[contractimpl]
impl TokenContract {
    pub fn initialize(
        env: Env,
        admin: Address,
        decimal: u32,
        name: String,
        symbol: String,
    ) {
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);

        soroban_sdk::token::StellarAssetClient::new(&env, &env.current_contract_address())
            .set_admin(&admin);
    }

    pub fn mint(env: Env, to: Address, amount: i128) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        soroban_sdk::token::StellarAssetClient::new(&env, &env.current_contract_address())
            .mint(&to, &amount);

        env.events().publish((symbol_short!("minted"), to), amount);
    }

    pub fn balance(env: Env, id: Address) -> i128 {
        soroban_sdk::token::TokenClient::new(&env, &env.current_contract_address())
            .balance(&id)
    }

    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();
        soroban_sdk::token::TokenClient::new(&env, &env.current_contract_address())
            .transfer(&from, &to, &amount);

        env.events().publish((symbol_short!("transfer"), from), (to, amount));
    }

    pub fn admin(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Admin).unwrap()
    }
}