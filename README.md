# Briefing

Run the migration, then create a source and a user in PostgreSQL.
The source URL is the public WordPress site URL; the client requests `/wp-json/wp/v2/posts` from it.

```sql
INSERT INTO source (name, base_url)
VALUES ('My news source', 'https://news.example.com')
RETURNING source_id;

INSERT INTO app_user DEFAULT VALUES
RETURNING app_user_id;
```

Copy the returned IDs into `.env` as `SOURCE_ID` and `USER_ID`, respectively.
Then start the web application with `npm run dev:web`.
