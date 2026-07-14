CREATE TABLE shipment_exports (
    id UUID PRIMARY KEY,
    shipment_id UUID NOT NULL,
    storage_key VARCHAR(255) NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    archived_at TIMESTAMP WITH TIME ZONE NULL,

    CONSTRAINT fk_shipment_exports_shipment
        FOREIGN KEY (shipment_id)
        REFERENCES shipments (id)
        ON DELETE CASCADE,

    CONSTRAINT uq_shipment_exports_shipment
        UNIQUE (shipment_id),

    CONSTRAINT uq_shipment_exports_storage_key
        UNIQUE (storage_key),

    CONSTRAINT chk_shipment_exports_archive_date
        CHECK (
            archived_at IS NULL
            OR archived_at >= generated_at
        )
);
