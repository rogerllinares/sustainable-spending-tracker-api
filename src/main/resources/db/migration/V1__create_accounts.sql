CREATE TABLE accounts (
    id          UUID         PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    iban        VARCHAR(34)  NOT NULL,
    currency    VARCHAR(3)   NOT NULL DEFAULT 'EUR',
    balance     DECIMAL(15,2) NOT NULL
);
