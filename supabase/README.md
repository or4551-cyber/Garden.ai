# Supabase Setup Instructions

## 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up and create a new project
3. Choose a name and region (select closest to Israel for better performance)
4. Save the database password - you'll need it

## 2. Get Connection Details

After project creation, go to **Settings > Database** and copy:
- **Supabase URL** (Project URL)
- **Service Role Key** (anon key for frontend, service_role for backend)

## 3. Run Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Create a new query
3. Copy and paste the contents of `supabase/schema.sql`
4. Click **Run**

## 4. Create Storage Buckets

1. Go to **Storage** in the sidebar
2. Click **New bucket**:
   - Name: `project-images`
   - Public bucket: ✅ (checked)
3. Create another bucket:
   - Name: `style-references`
   - Public bucket: ✅ (checked)

## 5. Configure Backend Environment

Copy the values to `backend/.env`:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIs...
```

## 6. (Optional) Seed Data

To add sample data for testing, run the contents of `supabase/seed.sql` in the SQL Editor.

## Storage Policies

Add these policies for storage buckets:

### project-images bucket:
```sql
CREATE POLICY "Allow public access" ON storage.objects
FOR ALL USING (bucket_id = 'project-images') WITH CHECK (bucket_id = 'project-images');
```

### style-references bucket:
```sql
CREATE POLICY "Allow public access" ON storage.objects
FOR ALL USING (bucket_id = 'style-references') WITH CHECK (bucket_id = 'style-references');
```

## Troubleshooting

- **Connection errors**: Check that you're using the Service Role Key (not the anon key) for backend operations
- **Storage upload fails**: Verify the buckets are public and policies are set
- **Vector search not working**: Make sure pgvector extension is enabled
