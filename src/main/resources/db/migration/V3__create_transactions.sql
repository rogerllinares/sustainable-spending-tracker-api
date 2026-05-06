CREATE TABLE transactions (
    id            UUID          PRIMARY KEY,
    account_id    UUID          NOT NULL REFERENCES accounts(id),
    mcc_code      VARCHAR(4)    NOT NULL REFERENCES mcc_scores(mcc_code),
    date          TIMESTAMP     NOT NULL,
    amount        DECIMAL(15,2) NOT NULL,
    currency      VARCHAR(3)    NOT NULL DEFAULT 'EUR',
    merchant_name VARCHAR(255)  NOT NULL,
    category      VARCHAR(100)  NOT NULL,
    description   VARCHAR(500),
    co2_kg        DECIMAL(10,3) NOT NULL,
    esg_score     INT           NOT NULL
);

CREATE INDEX idx_transactions_date     ON transactions(date);
CREATE INDEX idx_transactions_category ON transactions(category);
CREATE INDEX idx_transactions_esg      ON transactions(esg_score);
