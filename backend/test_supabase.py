from supabase_client import supabase

supabase.table("test_table").insert({
    "name": "hello from vscode"
}).execute()

data = supabase.table("test_table").select("*").execute()
print(data.data)
