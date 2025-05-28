# Supabase Schema for GatherContent-like App

## 1. users (profile metadata, not auth.users)
```sql
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  avatar_url text,
  created_at timestamp with time zone default now()
);
```

## 2. workspaces
```sql
create table workspaces (
  id bigint generated always as identity primary key,
  name text not null,
  owner_id uuid references users(id),
  created_at timestamp with time zone default now()
);
```

## 3. workspace_members
```sql
create table workspace_members (
  id bigint generated always as identity primary key,
  workspace_id bigint references workspaces(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  role text check (role in ('admin', 'editor', 'viewer')),
  created_at timestamp with time zone default now(),
  unique (workspace_id, user_id)
);
```

## 4. projects
```sql
create table projects (
  id bigint generated always as identity primary key,
  workspace_id bigint references workspaces(id) on delete cascade,
  name text not null,
  allowed_user_ids uuid[] default '{}',
  created_at timestamp with time zone default now()
);
```

## 5. nodes (folders & pages)
```sql
create table nodes (
  id bigint generated always as identity primary key,
  project_id bigint references projects(id) on delete cascade,
  parent_id bigint references nodes(id) on delete cascade,
  type text check (type in ('folder', 'page')) not null,
  name text not null,
  template_id bigint references templates(id),
  data jsonb,
  due_date date,
  updated timestamp with time zone,
  comments integer default 0,
  status text,
  assignees uuid[] default '{}',
  sort_order integer default 0,
  created_at timestamp with time zone default now()
);
```

## 6. templates
```sql
create table templates (
  id bigint generated always as identity primary key,
  workspace_id bigint references workspaces(id) on delete cascade,
  name text not null,
  fields jsonb,
  created_at timestamp with time zone default now()
);
```

## 7. activities
```sql
create table activities (
  id bigint generated always as identity primary key,
  project_id bigint references projects(id) on delete cascade,
  user_id uuid references users(id),
  user_name text,
  action text,
  node_id bigint references nodes(id) on delete cascade,
  node_name text,
  timestamp timestamp with time zone default now(),
  details text
);
```

## 8. media
```sql
create table media (
  id bigint generated always as identity primary key,
  project_id bigint references projects(id) on delete set null,
  workspace_id bigint references workspaces(id) on delete cascade,
  name text not null,
  url text not null,
  uploaded_by uuid references users(id),
  created_at timestamp with time zone default now()
);
``` 