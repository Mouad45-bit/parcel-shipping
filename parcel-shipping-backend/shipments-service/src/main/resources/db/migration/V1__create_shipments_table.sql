CREATE TABLE shipments (
                           id UUID PRIMARY KEY,
                           client VARCHAR(80) NOT NULL,
                           tracking_code VARCHAR(40) NOT NULL UNIQUE,
                           dispatch_date TIMESTAMP NOT NULL,
                           status VARCHAR(30) NOT NULL,
                           status_date TIMESTAMP NOT NULL,
                           proof_of_delivery VARCHAR(30) NOT NULL,
                           exported_at TIMESTAMP NULL
);

CREATE INDEX idx_shipments_client ON shipments (client);
CREATE INDEX idx_shipments_tracking_code ON shipments (tracking_code);
CREATE INDEX idx_shipments_dispatch_date ON shipments (dispatch_date);
CREATE INDEX idx_shipments_status ON shipments (status);
CREATE INDEX idx_shipments_status_date ON shipments (status_date);
CREATE INDEX idx_shipments_proof_of_delivery ON shipments (proof_of_delivery);