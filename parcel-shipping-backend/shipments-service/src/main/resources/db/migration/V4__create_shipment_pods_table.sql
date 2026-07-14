CREATE TABLE shipment_pods (
    id UUID PRIMARY KEY,
    shipment_id UUID NOT NULL,
    position INTEGER NOT NULL,
    storage_key VARCHAR(255) NOT NULL,
    mime_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT fk_shipment_pods_shipment
        FOREIGN KEY (shipment_id)
        REFERENCES shipments (id)
        ON DELETE CASCADE,

    CONSTRAINT uq_shipment_pods_position
        UNIQUE (shipment_id, position),

    CONSTRAINT uq_shipment_pods_storage_key
        UNIQUE (storage_key),

    CONSTRAINT chk_shipment_pods_position
        CHECK (position BETWEEN 1 AND 3),

    CONSTRAINT chk_shipment_pods_mime_type
        CHECK (mime_type = 'image/png')
);
