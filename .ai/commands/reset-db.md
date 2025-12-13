# Reset Database Command

Clean up all data from the PostgreSQL database and optionally re-initialize services.

## Task

Execute the following steps to reset the database:

1. **Truncate all tables** with CASCADE to handle foreign key constraints:
   - verifications
   - session
   - account
   - auth_log
   - premium_users
   - api_keys
   - api_usage_logs
   - daily_stats
   - organisation_members
   - wallets
   - test_wallets
   - organisations
   - user
   - services
   - stripe_events

2. **Restart identity sequences** to reset auto-increment IDs

3. **Verify cleanup** by counting rows in all tables

4. **Ask user** if they want to re-initialize the services table with the 3 base services:
   - PDF Service (pdf:read, pdf:write)
   - AI Service (ai:read, ai:write)
   - Mileage Service (mileage:read, mileage:calculate)

## Implementation

Use Docker exec to connect to the PostgreSQL container and run SQL commands:

```bash
docker exec -i key-api-manager-postgres psql -U postgres -d key_api_manager_db -c "
TRUNCATE TABLE
  verifications,
  session,
  account,
  auth_log,
  premium_users,
  api_keys,
  api_usage_logs,
  daily_stats,
  organisation_members,
  wallets,
  test_wallets,
  organisations,
  \"user\",
  services,
  stripe_events
RESTART IDENTITY CASCADE;
"
```

Then verify and optionally re-initialize services if requested.

## Expected Output

- Confirmation message: "Database cleaned successfully!"
- Table row count verification showing 0 for all tables
- If services re-initialization requested: confirmation of 3 services inserted
