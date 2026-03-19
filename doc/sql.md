SELECT
    c.table_name,
    c.column_name,
    c.ordinal_position as pos,
    c.data_type,
    c.character_maximum_length as max_length,
    c.is_nullable,
    c.column_default,
    tc.constraint_type,
    kcu.constraint_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.columns c
LEFT JOIN information_schema.key_column_usage kcu
    ON c.table_name = kcu.table_name
    AND c.column_name = kcu.column_name
    AND c.table_schema = kcu.table_schema
LEFT JOIN information_schema.table_constraints tc
    ON kcu.constraint_name = tc.constraint_name
    AND kcu.table_schema = tc.table_schema
LEFT JOIN information_schema.constraint_column_usage ccu
    ON tc.constraint_name = ccu.constraint_name
    AND tc.table_schema = ccu.table_schema
WHERE c.table_schema = 'public'
ORDER BY c.table_name, c.ordinal_position;
