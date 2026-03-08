# cs35l-project-w26
## Week4
### Backend D
#### Completed Tasks
- ✅ Add `Flask-SQLAlchemy`, `Flask-Migrate`, `supabase` dependencies to `requirements.txt`
- ✅ Create `models/` folder
- ✅ Create 1 test model
- ✅ Initialize SQLAlchemy with the Flask app (`db.init_app(app)`)
- ✅ Initialize migration (`flask db init`)
- ✅ Add `instance/` to `.gitignore`
- ✅ Create `.env.example` to clarify the expected `DATABASE_URL` format

#### Important: Read this before running migrations
- Migrations are intended to run against **Supabase Postgres**, not a local DB. Make sure `DATABASE_URL` is set in your `.env` file and matches this format: *postgresql://postgres:&lt;password&gt;@db.&lt;project-ref&gt;.supabase.co:5432/postgres*
- Run `flask db migrate -m "Describe your schema change"` **only if you changed schema**.
- **Caution:** `flask db upgrade` applies migrations to the DB in `DADABASE_URL`. If it points to Supabase Postgres, `flask db upgrade` will update the remote DB, so double-check before running it.