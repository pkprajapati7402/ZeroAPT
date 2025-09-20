module gasless_wallet::AptosGasless {
    use aptos_framework::account;
    use aptos_framework::coin;
    use aptos_framework::timestamp;
    use aptos_token_objects::collection;
    use aptos_token_objects::token;
    use std::error;
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use std::option::{Self, Option};

    // Error codes
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_INVALID_POLL: u64 = 2;
    const E_ALREADY_VOTED: u64 = 3;
    const E_INSUFFICIENT_BALANCE: u64 = 4;
    const E_POLL_NOT_EXISTS: u64 = 5;

    // Resource to store user votes
    struct UserVotes has key {
        votes: vector<Vote>
    }

    struct Vote has store, drop {
        poll_id: u64,
        choice: u8,
        timestamp: u64
    }

    // Resource to manage polls  
    struct PollManager has key {
        polls: vector<Poll>,
        next_poll_id: u64
    }

    struct Poll has store, drop {
        id: u64,
        title: String,
        options: vector<String>,
        votes: vector<u64>,
        created_at: u64,
        active: bool
    }

    // Simple test token resource
    struct TestToken has key {
        balance: u64
    }

    // Collection constants
    const COLLECTION_NAME: vector<u8> = b"Event Badges";
    const COLLECTION_DESCRIPTION: vector<u8> = b"Gasless wallet event participation badges";
    const COLLECTION_URI: vector<u8> = b"https://gaslesswallet.com/badges";

    // Events
    struct BadgeMinted has drop, store {
        user: address,
        token_name: String,
        timestamp: u64
    }

    struct VoteCast has drop, store {
        user: address,
        poll_id: u64,
        choice: u8,
        timestamp: u64
    }

    struct TokenTransferred has drop, store {
        from: address,
        to: address,
        amount: u64,
        timestamp: u64
    }

    // Initialize module
    fun init_module(admin: &signer) {
        // Create collection for event badges
        collection::create_unlimited_collection(
            admin,
            string::utf8(COLLECTION_DESCRIPTION),
            string::utf8(COLLECTION_NAME),
            option::none(),
            string::utf8(COLLECTION_URI)
        );

        // Initialize poll manager
        move_to(admin, PollManager {
            polls: vector::empty(),
            next_poll_id: 1
        });

        // Give admin test tokens
        move_to(admin, TestToken {
            balance: 10000
        });
    }

    // Mint NFT badge to user
    public entry fun mint_badge(
        relayer: &signer,
        user: address
    ) {
        let token_name = string::utf8(b"Event Badge NFT");
        let token_description = string::utf8(b"Badge for gasless wallet participation");
        let token_uri = string::utf8(b"https://gaslesswallet.com/badge.png");

        let token_constructor_ref = token::create_named_token(
            relayer,
            string::utf8(COLLECTION_NAME),
            token_description,
            token_name,
            option::none(),
            token_uri
        );

        let transfer_ref = token::generate_transfer_ref(&token_constructor_ref);
        token::transfer_with_ref(&transfer_ref, user);

        // Emit event
        0x1::event::emit(BadgeMinted {
            user,
            token_name,
            timestamp: timestamp::now_seconds()
        });
    }

    // Cast vote in poll
    public entry fun cast_vote(
        _relayer: &signer,
        user: address,
        poll_id: u64,
        choice: u8
    ) acquires UserVotes, PollManager {
        // Initialize user votes if needed
        if (!exists<UserVotes>(user)) {
            move_to(&account::create_signer_with_capability(
                &account::create_test_signer_cap(user)
            ), UserVotes {
                votes: vector::empty()
            });
        };

        let user_votes = borrow_global_mut<UserVotes>(user);
        let poll_manager = borrow_global_mut<PollManager>(@gasless_wallet);

        // Find and validate poll
        let poll_found = false;
        let poll_index = 0;
        let i = 0;
        let polls_len = vector::length(&poll_manager.polls);
        
        while (i < polls_len) {
            let poll = vector::borrow(&poll_manager.polls, i);
            if (poll.id == poll_id && poll.active) {
                poll_found = true;
                poll_index = i;
                break
            };
            i = i + 1;
        };

        assert!(poll_found, error::not_found(E_POLL_NOT_EXISTS));

        // Check for duplicate votes
        let j = 0;
        let votes_len = vector::length(&user_votes.votes);
        while (j < votes_len) {
            let vote = vector::borrow(&user_votes.votes, j);
            assert!(vote.poll_id != poll_id, error::already_exists(E_ALREADY_VOTED));
            j = j + 1;
        };

        // Record vote
        vector::push_back(&mut user_votes.votes, Vote {
            poll_id,
            choice,
            timestamp: timestamp::now_seconds()
        });

        // Update poll counts
        let poll = vector::borrow_mut(&mut poll_manager.polls, poll_index);
        let choice_index = (choice as u64);
        if (choice_index < vector::length(&poll.votes)) {
            let current_votes = vector::borrow_mut(&mut poll.votes, choice_index);
            *current_votes = *current_votes + 1;
        };

        // Emit event
        0x1::event::emit(VoteCast {
            user,
            poll_id,
            choice,
            timestamp: timestamp::now_seconds()
        });
    }

    // Transfer tokens on behalf of user
    public entry fun transfer_token(
        _relayer: &signer,
        user: address,
        recipient: address,
        amount: u64
    ) acquires TestToken {
        // Initialize user tokens if needed
        if (!exists<TestToken>(user)) {
            move_to(&account::create_signer_with_capability(
                &account::create_test_signer_cap(user)
            ), TestToken {
                balance: 100
            });
        };

        // Initialize recipient tokens if needed
        if (!exists<TestToken>(recipient)) {
            move_to(&account::create_signer_with_capability(
                &account::create_test_signer_cap(recipient)
            ), TestToken {
                balance: 0
            });
        };

        let user_tokens = borrow_global_mut<TestToken>(user);
        let recipient_tokens = borrow_global_mut<TestToken>(recipient);

        assert!(user_tokens.balance >= amount, error::invalid_argument(E_INSUFFICIENT_BALANCE));

        user_tokens.balance = user_tokens.balance - amount;
        recipient_tokens.balance = recipient_tokens.balance + amount;

        // Emit event
        0x1::event::emit(TokenTransferred {
            from: user,
            to: recipient,
            amount,
            timestamp: timestamp::now_seconds()
        });
    }

    // Utility function to create polls
    public entry fun create_poll(
        admin: &signer,
        title: String,
        options: vector<String>
    ) acquires PollManager {
        let admin_address = signer::address_of(admin);
        assert!(admin_address == @gasless_wallet, error::permission_denied(E_NOT_AUTHORIZED));

        let poll_manager = borrow_global_mut<PollManager>(@gasless_wallet);
        let poll_id = poll_manager.next_poll_id;
        poll_manager.next_poll_id = poll_id + 1;

        let votes = vector::empty<u64>();
        let i = 0;
        while (i < vector::length(&options)) {
            vector::push_back(&mut votes, 0);
            i = i + 1;
        };

        vector::push_back(&mut poll_manager.polls, Poll {
            id: poll_id,
            title,
            options,
            votes,
            created_at: timestamp::now_seconds(),
            active: true
        });
    }

    // View functions
    #[view]
    public fun get_user_votes(user: address): vector<Vote> acquires UserVotes {
        if (!exists<UserVotes>(user)) {
            return vector::empty()
        };
        *&borrow_global<UserVotes>(user).votes
    }

    #[view]
    public fun get_token_balance(user: address): u64 acquires TestToken {
        if (!exists<TestToken>(user)) {
            return 0
        };
        borrow_global<TestToken>(user).balance
    }

    #[view]
    public fun get_polls(): vector<Poll> acquires PollManager {
        if (!exists<PollManager>(@gasless_wallet)) {
            return vector::empty()
        };
        *&borrow_global<PollManager>(@gasless_wallet).polls
    }

    // Test helper
    public entry fun mint_test_tokens(
        _admin: &signer,
        user: address,
        amount: u64
    ) acquires TestToken {
        if (!exists<TestToken>(user)) {
            move_to(&account::create_signer_with_capability(
                &account::create_test_signer_cap(user)
            ), TestToken {
                balance: amount
            });
        } else {
            let user_tokens = borrow_global_mut<TestToken>(user);
            user_tokens.balance = user_tokens.balance + amount;
        };
    }
}