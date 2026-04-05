-- Supabase Schema for Garden AI Application
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgvector for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    location JSONB,
    dimensions JSONB,
    notes TEXT,
    status TEXT DEFAULT 'draft',
    analysis JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project images table
CREATE TABLE project_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    type TEXT NOT NULL, -- 'upload' or 'generated'
    prompt TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    messages JSONB DEFAULT '[]'::jsonb,
    context JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Style references table
CREATE TABLE style_references (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_url TEXT NOT NULL,
    description TEXT,
    tags TEXT[],
    embedding VECTOR(1536), -- OpenAI text-embedding-3-small
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE style_references ENABLE ROW LEVEL SECURITY;

-- Create policies (for demo: allow all access - adjust for production)
CREATE POLICY "Allow all access" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON project_images FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON conversations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access" ON style_references FOR ALL USING (true) WITH CHECK (true);

-- Create vector search function
CREATE OR REPLACE FUNCTION match_styles(
    query_embedding VECTOR(1536),
    match_threshold FLOAT,
    match_count INT
)
RETURNS TABLE(
    id UUID,
    image_url TEXT,
    description TEXT,
    tags TEXT[],
    similarity FLOAT
)
LANGUAGE SQL STABLE
AS $$
    SELECT
        id,
        image_url,
        description,
        tags,
        1 - (embedding <=> query_embedding) AS similarity
    FROM style_references
    WHERE 1 - (embedding <=> query_embedding) > match_threshold
    ORDER BY embedding <=> query_embedding
    LIMIT match_count;
$$;

-- Create indexes
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_project_images_project_id ON project_images(project_id);
CREATE INDEX idx_conversations_project_id ON conversations(project_id);
-- Note: For vectors >2000 dims, ivfflat is not supported. Using default index or reduce dims.

-- Create storage buckets (run in Supabase Storage settings)
-- Bucket: project-images
-- Bucket: style-references
-- Make sure to set public access for these buckets
