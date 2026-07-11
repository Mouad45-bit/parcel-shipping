UPDATE users
SET password_hash =
    '$2y$12$AOTUhCBKFoNTTfIlLTXZX.T7p81f0srN/.ChgoMg7Vt5/2d/Y06gi',
    updated_at = CURRENT_TIMESTAMP
WHERE LOWER(username) = 'backoffice';
