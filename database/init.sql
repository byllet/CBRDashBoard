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
    parameter_value FLOAT NOT NULL,

    CONSTRAINT fk_parameter
        FOREIGN KEY (parameter_id)
        REFERENCES economic_parameters(parameter_id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_region
        FOREIGN KEY (region_id)
        REFERENCES regions(region_id)
        ON DELETE RESTRICT
);