CREATE TABLE economic_parameters (
    parameter_id SERIAL PRIMARY KEY,
    parameter_name TEXT NOT NULL
);

CREATE TABLE regions (
    region_id SERIAL PRIMARY KEY,
    region_name TEXT NOT NULL
);

CREATE TABLE economic_data (
    id SERIAL PRIMARY KEY,
    parameter_id INT NOT NULL,
    region_id INT,
    record_date DATE NOT NULL,
    parameter_value FLOAT,

    CONSTRAINT fk_parameter
        FOREIGN KEY (parameter_id)
        REFERENCES economic_parameters(parameter_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_region
        FOREIGN KEY (region_id)
        REFERENCES regions(region_id)
        ON DELETE RESTRICT
);


INSERT INTO economic_parameters (parameter_id, parameter_name) 
    VALUES 
    (82, 'money_aggregates_total'),
    (89, 'money_aggregates_m1'),
    (90, 'money_aggregates_financial_orgs'),
    (91, 'money_aggregates_nonfinancial_orgs'),
    (92, 'money_aggregates_households'),
    (257, 'credits_stats_short_term'),
    (259, 'credits_stats_1_to_3_years'),
    (260, 'credits_stats_over_3_years'),
    (371, 'deposit_rates_on_demand'),
    (378, 'deposit_rates_short_term'),
    (379, 'deposit_rates_1_to_3_years'),
    (380, 'deposit_rates_over_3_years'),
    (445, 'loan_rates_total'),
    (446, 'loan_rates_rubles'),
    (450, 'loan_ratest_other_currencies'),
    (1368, 'currency_rates_dollar'),
    (1369, 'currency_rates_euro'),
    (1370, 'currency_rates_yuan')
;

INSERT INTO regions (region_id, region_name)
VALUES 
(22, 'Russian Federation');