INSERT INTO shipments (
    id,
    client,
    tracking_code,
    dispatch_date,
    status,
    status_date,
    proof_of_delivery,
    exported_at
) VALUES
      (
          '0f4b65e8-29ce-45f3-8975-9a2e1193a001',
          'aasim',
          'QB183609979MA',
          '2026-06-11 12:22:00',
          'DELIVERED',
          '2026-06-22 00:00:00',
          'MISSING',
          NULL
      ),
      (
          '0f4b65e8-29ce-45f3-8975-9a2e1193a002',
          'aasim',
          'QB100000001MA',
          '2026-06-19 13:51:00',
          'DELIVERED',
          '2026-06-22 13:17:00',
          'MISSING',
          NULL
      ),
      (
          '0f4b65e8-29ce-45f3-8975-9a2e1193a003',
          'aasim',
          'QB100000002MA',
          '2026-06-16 14:05:00',
          'DELIVERED',
          '2026-07-06 23:00:00',
          'AVAILABLE',
          '2026-07-07 09:30:00'
      ),
      (
          '0f4b65e8-29ce-45f3-8975-9a2e1193a004',
          'aasim',
          'QB100000003MA',
          '2026-06-15 09:45:00',
          'IN_TRANSIT',
          '2026-06-16 13:16:00',
          'MISSING',
          NULL
      ),
      (
          '0f4b65e8-29ce-45f3-8975-9a2e1193a005',
          'aasim',
          'QB100000004MA',
          '2026-06-08 12:01:00',
          'FAILED_DELIVERY',
          '2026-06-12 14:54:00',
          'MISSING',
          NULL
      ),
      (
          '0f4b65e8-29ce-45f3-8975-9a2e1193a006',
          'aasim',
          'QB100000005MA',
          '2026-06-10 13:12:00',
          'RETURNED',
          '2026-06-11 23:00:00',
          'AVAILABLE',
          '2026-06-12 10:00:00'
      ),
      (
          '0f4b65e8-29ce-45f3-8975-9a2e1193a007',
          'aasim',
          'QB100000006MA',
          '2026-05-21 14:52:00',
          'CREATED',
          '2026-05-21 23:00:00',
          'MISSING',
          NULL
      );