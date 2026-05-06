CREATE TABLE mcc_scores (
    mcc_code    VARCHAR(4)    PRIMARY KEY,
    category    VARCHAR(100)  NOT NULL,
    description VARCHAR(255)  NOT NULL,
    co2_per_eur DECIMAL(10,4) NOT NULL,
    esg_score   INT           NOT NULL
);
