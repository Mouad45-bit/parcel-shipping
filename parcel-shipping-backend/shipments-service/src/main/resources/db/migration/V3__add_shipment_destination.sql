ALTER TABLE shipments
ADD COLUMN destination VARCHAR(120);

UPDATE shipments
SET destination = CASE tracking_code
    WHEN 'QB183609979MA' THEN 'Casablanca'
    WHEN 'QB100000001MA' THEN 'Rabat'
    WHEN 'QB100000002MA' THEN 'Marrakech'
    WHEN 'QB100000003MA' THEN 'Tangier'
    WHEN 'QB100000004MA' THEN 'Agadir'
    WHEN 'QB100000005MA' THEN 'Fes'
    WHEN 'QB100000006MA' THEN 'Oujda'
    ELSE 'Unknown'
END;

ALTER TABLE shipments
ALTER COLUMN destination SET NOT NULL;

CREATE INDEX idx_shipments_destination
ON shipments (destination);
