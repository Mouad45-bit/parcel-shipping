UPDATE shipments
SET exported_at = NULL
WHERE exported_at IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM shipment_exports
      WHERE shipment_exports.shipment_id = shipments.id
  );
