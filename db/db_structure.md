[
  {
    "table_name": "api_configs",
    "column_name": "id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "key_type": "PRIMARY KEY"
  },
  {
    "table_name": "api_configs",
    "column_name": "user_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": "FOREIGN KEY -> users(id)"
  },
  {
    "table_name": "api_configs",
    "column_name": "service",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "api_configs",
    "column_name": "config",
    "data_type": "jsonb",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "'{}'::jsonb",
    "key_type": null
  },
  {
    "table_name": "api_configs",
    "column_name": "is_active",
    "data_type": "boolean",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "true",
    "key_type": null
  },
  {
    "table_name": "api_configs",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "now()",
    "key_type": null
  },
  {
    "table_name": "api_configs",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "now()",
    "key_type": null
  },
  {
    "table_name": "app_feed_configs",
    "column_name": "id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "uuid_generate_v4()",
    "key_type": "PRIMARY KEY"
  },
  {
    "table_name": "app_feed_configs",
    "column_name": "user_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": "FOREIGN KEY -> users(id)"
  },
  {
    "table_name": "app_feed_configs",
    "column_name": "app_type",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "app_feed_configs",
    "column_name": "feeds",
    "data_type": "ARRAY",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "'{}'::text[]",
    "key_type": null
  },
  {
    "table_name": "app_feed_configs",
    "column_name": "settings",
    "data_type": "jsonb",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "'{}'::jsonb",
    "key_type": null
  },
  {
    "table_name": "app_feed_configs",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "now()",
    "key_type": null
  },
  {
    "table_name": "app_feed_configs",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "now()",
    "key_type": null
  },
  {
    "table_name": "board_activities",
    "column_name": "id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "key_type": "PRIMARY KEY"
  },
  {
    "table_name": "board_activities",
    "column_name": "board_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": "FOREIGN KEY -> boards(id)"
  },
  {
    "table_name": "board_activities",
    "column_name": "session_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null,
    "key_type": "FOREIGN KEY -> collaboration_sessions(id)"
  },
  {
    "table_name": "board_activities",
    "column_name": "activity_type",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "board_activities",
    "column_name": "activity_data",
    "data_type": "jsonb",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "'{}'::jsonb",
    "key_type": null
  },
  {
    "table_name": "board_activities",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "now()",
    "key_type": null
  },
  {
    "table_name": "board_shares",
    "column_name": "id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "key_type": "PRIMARY KEY"
  },
  {
    "table_name": "board_shares",
    "column_name": "board_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": "FOREIGN KEY -> boards(id)"
  },
  {
    "table_name": "board_shares",
    "column_name": "owner_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": "FOREIGN KEY -> users(id)"
  },
  {
    "table_name": "board_shares",
    "column_name": "share_token",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "board_shares",
    "column_name": "share_type",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "board_shares",
    "column_name": "access_level",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "'view'::text",
    "key_type": null
  },
  {
    "table_name": "board_shares",
    "column_name": "password_hash",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "board_shares",
    "column_name": "expires_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "board_shares",
    "column_name": "is_active",
    "data_type": "boolean",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "true",
    "key_type": null
  },
  {
    "table_name": "board_shares",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "now()",
    "key_type": null
  },
  {
    "table_name": "board_shares",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "now()",
    "key_type": null
  },
  {
    "table_name": "boards",
    "column_name": "id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "key_type": "PRIMARY KEY"
  },
  {
    "table_name": "boards",
    "column_name": "user_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": "FOREIGN KEY -> users(id)"
  },
  {
    "table_name": "boards",
    "column_name": "name",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "boards",
    "column_name": "is_main_board",
    "data_type": "boolean",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "false",
    "key_type": null
  },
  {
    "table_name": "boards",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "now()",
    "key_type": null
  },
  {
    "table_name": "boards",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "now()",
    "key_type": null
  },
  {
    "table_name": "cards",
    "column_name": "id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "key_type": "PRIMARY KEY"
  },
  {
    "table_name": "cards",
    "column_name": "board_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": "FOREIGN KEY -> boards(id)"
  },
  {
    "table_name": "cards",
    "column_name": "type",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "cards",
    "column_name": "content",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "cards",
    "column_name": "position_x",
    "data_type": "double precision",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "cards",
    "column_name": "position_y",
    "data_type": "double precision",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "cards",
    "column_name": "width",
    "data_type": "double precision",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "cards",
    "column_name": "height",
    "data_type": "double precision",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "cards",
    "column_name": "metadata",
    "data_type": "jsonb",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "cards",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "now()",
    "key_type": null
  },
  {
    "table_name": "cards",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "now()",
    "key_type": null
  },
  {
    "table_name": "chat_messages",
    "column_name": "id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "key_type": "PRIMARY KEY"
  },
  {
    "table_name": "chat_messages",
    "column_name": "user_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": "FOREIGN KEY -> users(id)"
  },
  {
    "table_name": "chat_messages",
    "column_name": "content",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "chat_messages",
    "column_name": "sender",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "chat_messages",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "now()",
    "key_type": null
  },
  {
    "table_name": "collaboration_sessions",
    "column_name": "id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "key_type": "PRIMARY KEY"
  },
  {
    "table_name": "collaboration_sessions",
    "column_name": "share_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": "FOREIGN KEY -> board_shares(id)"
  },
  {
    "table_name": "collaboration_sessions",
    "column_name": "user_name",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "collaboration_sessions",
    "column_name": "user_color",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "collaboration_sessions",
    "column_name": "socket_id",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "collaboration_sessions",
    "column_name": "cursor_position",
    "data_type": "jsonb",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "collaboration_sessions",
    "column_name": "last_activity",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "now()",
    "key_type": null
  },
  {
    "table_name": "collaboration_sessions",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "now()",
    "key_type": null
  },
  {
    "table_name": "custom_app_data",
    "column_name": "id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "key_type": "PRIMARY KEY"
  },
  {
    "table_name": "custom_app_data",
    "column_name": "user_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": "FOREIGN KEY -> users(id)"
  },
  {
    "table_name": "custom_app_data",
    "column_name": "app_id",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "custom_app_data",
    "column_name": "data",
    "data_type": "jsonb",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "'{}'::jsonb",
    "key_type": null
  },
  {
    "table_name": "custom_app_data",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "now()",
    "key_type": null
  },
  {
    "table_name": "custom_app_data",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "now()",
    "key_type": null
  },
  {
    "table_name": "document_templates",
    "column_name": "id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "key_type": "PRIMARY KEY"
  },
  {
    "table_name": "document_templates",
    "column_name": "title",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "document_templates",
    "column_name": "content",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "document_templates",
    "column_name": "format",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "document_templates",
    "column_name": "category",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "document_templates",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "now()",
    "key_type": null
  },
  {
    "table_name": "document_templates",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "now()",
    "key_type": null
  },
  {
    "table_name": "document_versions",
    "column_name": "id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "key_type": "PRIMARY KEY"
  },
  {
    "table_name": "document_versions",
    "column_name": "document_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": "FOREIGN KEY -> documents(id)"
  },
  {
    "table_name": "document_versions",
    "column_name": "content",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "document_versions",
    "column_name": "version",
    "data_type": "integer",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "document_versions",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "now()",
    "key_type": null
  },
  {
    "table_name": "document_versions",
    "column_name": "created_by",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": "FOREIGN KEY -> users(id)"
  },
  {
    "table_name": "documents",
    "column_name": "id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "key_type": "PRIMARY KEY"
  },
  {
    "table_name": "documents",
    "column_name": "user_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": "FOREIGN KEY -> users(id)"
  },
  {
    "table_name": "documents",
    "column_name": "title",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "documents",
    "column_name": "content",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "documents",
    "column_name": "format",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "documents",
    "column_name": "version",
    "data_type": "integer",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "1",
    "key_type": null
  },
  {
    "table_name": "documents",
    "column_name": "tags",
    "data_type": "ARRAY",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "ARRAY[]::text[]",
    "key_type": null
  },
  {
    "table_name": "documents",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "now()",
    "key_type": null
  },
  {
    "table_name": "documents",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "now()",
    "key_type": null
  },
  {
    "table_name": "email_configs",
    "column_name": "id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "key_type": "PRIMARY KEY"
  },
  {
    "table_name": "email_configs",
    "column_name": "user_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": "FOREIGN KEY -> users(id)"
  },
  {
    "table_name": "email_configs",
    "column_name": "smtp_host",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "email_configs",
    "column_name": "smtp_port",
    "data_type": "integer",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "email_configs",
    "column_name": "smtp_username",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "email_configs",
    "column_name": "smtp_password",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "email_configs",
    "column_name": "sender_name",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "email_configs",
    "column_name": "sender_email",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "email_configs",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "now()",
    "key_type": null
  },
  {
    "table_name": "email_configs",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "now()",
    "key_type": null
  },
  {
    "table_name": "kanban_boards",
    "column_name": "id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "key_type": "PRIMARY KEY"
  },
  {
    "table_name": "kanban_boards",
    "column_name": "board_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": "FOREIGN KEY -> boards(id)"
  },
  {
    "table_name": "kanban_boards",
    "column_name": "custom_todo_title",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "'To Do'::text",
    "key_type": null
  },
  {
    "table_name": "kanban_boards",
    "column_name": "custom_in_progress_title",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "'In Progress'::text",
    "key_type": null
  },
  {
    "table_name": "kanban_boards",
    "column_name": "custom_done_title",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "'Done'::text",
    "key_type": null
  },
  {
    "table_name": "kanban_boards",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "now()",
    "key_type": null
  },
  {
    "table_name": "kanban_boards",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "now()",
    "key_type": null
  },
  {
    "table_name": "kanban_tasks",
    "column_name": "id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "gen_random_uuid()",
    "key_type": "PRIMARY KEY"
  },
  {
    "table_name": "kanban_tasks",
    "column_name": "board_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": "FOREIGN KEY -> kanban_boards(id)"
  },
  {
    "table_name": "kanban_tasks",
    "column_name": "title",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "kanban_tasks",
    "column_name": "description",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "kanban_tasks",
    "column_name": "status",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "kanban_tasks",
    "column_name": "priority",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "'medium'::text",
    "key_type": null
  },
  {
    "table_name": "kanban_tasks",
    "column_name": "due_date",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "kanban_tasks",
    "column_name": "labels",
    "data_type": "ARRAY",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "ARRAY[]::text[]",
    "key_type": null
  },
  {
    "table_name": "kanban_tasks",
    "column_name": "position",
    "data_type": "integer",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "0",
    "key_type": null
  },
  {
    "table_name": "kanban_tasks",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "now()",
    "key_type": null
  },
  {
    "table_name": "kanban_tasks",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "now()",
    "key_type": null
  },
  {
    "table_name": "notification_settings",
    "column_name": "id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "uuid_generate_v4()",
    "key_type": "PRIMARY KEY"
  },
  {
    "table_name": "notification_settings",
    "column_name": "user_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": "FOREIGN KEY -> users(id)"
  },
  {
    "table_name": "notification_settings",
    "column_name": "app_type",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "notification_settings",
    "column_name": "enabled",
    "data_type": "boolean",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "true",
    "key_type": null
  },
  {
    "table_name": "notification_settings",
    "column_name": "types",
    "data_type": "jsonb",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "'{\"info\": true, \"error\": true, \"success\": true, \"warning\": true, \"new_content\": true}'::jsonb",
    "key_type": null
  },
  {
    "table_name": "notification_settings",
    "column_name": "delivery_methods",
    "data_type": "jsonb",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "'{\"push\": false, \"email\": false, \"inApp\": true}'::jsonb",
    "key_type": null
  },
  {
    "table_name": "notification_settings",
    "column_name": "quiet_hours",
    "data_type": "jsonb",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "notification_settings",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "now()",
    "key_type": null
  },
  {
    "table_name": "notification_settings",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "now()",
    "key_type": null
  },
  {
    "table_name": "notifications",
    "column_name": "id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "uuid_generate_v4()",
    "key_type": "PRIMARY KEY"
  },
  {
    "table_name": "notifications",
    "column_name": "user_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": "FOREIGN KEY -> users(id)"
  },
  {
    "table_name": "notifications",
    "column_name": "app_type",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "notifications",
    "column_name": "type",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "notifications",
    "column_name": "title",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "notifications",
    "column_name": "message",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "notifications",
    "column_name": "metadata",
    "data_type": "jsonb",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "'{}'::jsonb",
    "key_type": null
  },
  {
    "table_name": "notifications",
    "column_name": "is_read",
    "data_type": "boolean",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "false",
    "key_type": null
  },
  {
    "table_name": "notifications",
    "column_name": "action_url",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "notifications",
    "column_name": "action_label",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "notifications",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "now()",
    "key_type": null
  },
  {
    "table_name": "notifications",
    "column_name": "expires_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "search_index",
    "column_name": "id",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": "PRIMARY KEY"
  },
  {
    "table_name": "search_index",
    "column_name": "user_id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": "FOREIGN KEY -> users(id)"
  },
  {
    "table_name": "search_index",
    "column_name": "type",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "search_index",
    "column_name": "app_type",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "search_index",
    "column_name": "title",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "search_index",
    "column_name": "content",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "search_index",
    "column_name": "metadata",
    "data_type": "jsonb",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "'{}'::jsonb",
    "key_type": null
  },
  {
    "table_name": "search_index",
    "column_name": "tags",
    "data_type": "ARRAY",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "'{}'::text[]",
    "key_type": null
  },
  {
    "table_name": "search_index",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "search_index",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "now()",
    "key_type": null
  },
  {
    "table_name": "user_profiles",
    "column_name": "id",
    "data_type": "uuid",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": "PRIMARY KEY"
  },
  {
    "table_name": "user_profiles",
    "column_name": "preferred_username",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": null,
    "key_type": null
  },
  {
    "table_name": "user_profiles",
    "column_name": "created_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "now()",
    "key_type": null
  },
  {
    "table_name": "user_profiles",
    "column_name": "updated_at",
    "data_type": "timestamp with time zone",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "now()",
    "key_type": null
  },
  {
    "table_name": "user_profiles",
    "column_name": "theme",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "'default'::text",
    "key_type": null
  },
  {
    "table_name": "user_profiles",
    "column_name": "app_theme",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "'default'::text",
    "key_type": null
  },
  {
    "table_name": "user_profiles",
    "column_name": "card_theme",
    "data_type": "text",
    "character_maximum_length": null,
    "is_nullable": "YES",
    "column_default": "'default'::text",
    "key_type": null
  },
  {
    "table_name": "user_profiles",
    "column_name": "card_transparency",
    "data_type": "numeric",
    "character_maximum_length": null,
    "is_nullable": "NO",
    "column_default": "1.0",
    "key_type": null
  }
]