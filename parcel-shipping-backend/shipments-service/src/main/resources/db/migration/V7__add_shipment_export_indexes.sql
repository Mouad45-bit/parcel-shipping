CREATE INDEX idx_shipment_exports_generated_at
    ON shipment_exports (generated_at);

CREATE INDEX idx_shipment_exports_archived_generated
    ON shipment_exports (archived_at, generated_at);
