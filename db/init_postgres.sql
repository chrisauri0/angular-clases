
BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Optional app schema to keep objects grouped.
CREATE SCHEMA IF NOT EXISTS erp;
SET search_path TO erp, public;

-- ===== Core auth / RBAC =====
CREATE TABLE IF NOT EXISTS roles (
    id              BIGSERIAL PRIMARY KEY,
    code            VARCHAR(50) NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permissions (
    id              BIGSERIAL PRIMARY KEY,
    code            VARCHAR(100) NOT NULL UNIQUE,
    resource        VARCHAR(50) NOT NULL,
    action          VARCHAR(50) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id         BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id   BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS users (
    id              BIGSERIAL PRIMARY KEY,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    username        VARCHAR(100),
    full_name       VARCHAR(200) NOT NULL,
    phone           VARCHAR(20),
    address         TEXT,
    is_adult        BOOLEAN NOT NULL DEFAULT FALSE,
    accepted_terms  BOOLEAN NOT NULL DEFAULT FALSE,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id         BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

-- Optional direct grants if later you want custom per-user permissions.
CREATE TABLE IF NOT EXISTS user_permissions (
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission_id   BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, permission_id)
);

-- ===== Groups =====
CREATE TABLE IF NOT EXISTS groups (
    id              BIGSERIAL PRIMARY KEY,
    slug            VARCHAR(120) NOT NULL UNIQUE,
    name            VARCHAR(150) NOT NULL,
    level_name      VARCHAR(80),
    description     TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS group_members (
    group_id        BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (group_id, user_id)
);

-- ===== Tickets =====
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ticket_status') THEN
        CREATE TYPE ticket_status AS ENUM ('Pendiente', 'En progreso', 'Revision', 'Hecho');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ticket_priority') THEN
        CREATE TYPE ticket_priority AS ENUM ('Baja', 'Media', 'Alta', 'Critica');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS tickets (
    id              BIGSERIAL PRIMARY KEY,
    public_id       BIGINT UNIQUE,
    group_id        BIGINT REFERENCES groups(id) ON DELETE SET NULL,
    title           VARCHAR(200) NOT NULL,
    description     TEXT NOT NULL,
    status          ticket_status NOT NULL DEFAULT 'Pendiente',
    priority        ticket_priority NOT NULL DEFAULT 'Media',
    created_by      BIGINT REFERENCES users(id) ON DELETE SET NULL,
    assignee_id     BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_date        TIMESTAMPTZ,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_assignee ON tickets(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tickets_group ON tickets(group_id);

CREATE TABLE IF NOT EXISTS ticket_comments (
    id              BIGSERIAL PRIMARY KEY,
    ticket_id       BIGINT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_id         BIGINT REFERENCES users(id) ON DELETE SET NULL,
    message         TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket ON ticket_comments(ticket_id);

CREATE TABLE IF NOT EXISTS ticket_history (
    id              BIGSERIAL PRIMARY KEY,
    ticket_id       BIGINT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_id         BIGINT REFERENCES users(id) ON DELETE SET NULL,
    action          TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ticket_history_ticket ON ticket_history(ticket_id);

-- ===== Generic updated_at trigger =====
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_groups_updated_at ON groups;
CREATE TRIGGER trg_groups_updated_at
BEFORE UPDATE ON groups
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_tickets_updated_at ON tickets;
CREATE TRIGGER trg_tickets_updated_at
BEFORE UPDATE ON tickets
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ===== Seed data =====
INSERT INTO roles (code, name)
VALUES
    ('admin', 'Administrador'),
    ('user', 'Usuario Base')
ON CONFLICT (code) DO NOTHING;

INSERT INTO permissions (code, resource, action)
VALUES
    ('tickets:ver', 'tickets', 'ver'),
    ('tickets:crear', 'tickets', 'crear'),
    ('tickets:editar', 'tickets', 'editar'),
    ('tickets:eliminar', 'tickets', 'eliminar'),
    ('grupos:ver', 'grupos', 'ver'),
    ('grupos:crear', 'grupos', 'crear'),
    ('grupos:editar', 'grupos', 'editar'),
    ('grupos:eliminar', 'grupos', 'eliminar'),
    ('usuarios:ver', 'usuarios', 'ver'),
    ('usuarios:crear', 'usuarios', 'crear'),
    ('usuarios:editar', 'usuarios', 'editar'),
    ('usuarios:eliminar', 'usuarios', 'eliminar')
ON CONFLICT (code) DO NOTHING;

-- Admin gets all permissions.
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.code = 'admin'
ON CONFLICT DO NOTHING;

-- Base user permissions from current frontend PermisoBase.
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.code IN (
    'tickets:ver',
    'grupos:ver',
    'usuarios:ver',
    'usuarios:editar',
    'tickets:crear'
)
WHERE r.code = 'user'
ON CONFLICT DO NOTHING;

-- Demo users aligned with current login service.
INSERT INTO users (email, password_hash, username, full_name, is_adult, accepted_terms)
VALUES
    ('admin@uteq.edu.mx', crypt('admin123', gen_salt('bf')), 'admin', 'Admin Demo', TRUE, TRUE),
    ('user@uteq.edu.mx', crypt('user123', gen_salt('bf')), 'user', 'User Demo', TRUE, TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON (
    (u.email = 'admin@uteq.edu.mx' AND r.code = 'admin') OR
    (u.email = 'user@uteq.edu.mx' AND r.code = 'user')
)
ON CONFLICT DO NOTHING;

-- Demo groups from routes and static data.
INSERT INTO groups (slug, name, level_name, description)
VALUES
    ('equipo-dev', 'Equipo Dev', 'Nivel 1', 'Grupo de desarrollo principal'),
    ('soporte-tecnico', 'Soporte Tecnico', 'Nivel 2', 'Grupo de soporte tecnico'),
    ('grupo-a', 'Grupo A', 'Nivel 1', 'Grupo de ejemplo A'),
    ('grupo-b', 'Grupo B', 'Nivel 2', 'Grupo de ejemplo B'),
    ('grupo-c', 'Grupo C', 'Nivel 3', 'Grupo de ejemplo C')
ON CONFLICT (slug) DO NOTHING;

COMMIT;

-- Notes:
-- 1) To verify password: SELECT (password_hash = crypt('admin123', password_hash)) FROM erp.users WHERE email='admin@uteq.edu.mx';
-- 2) If you prefer accents in enums ('Crítica', 'Revisión'), keep app/backend normalized or switch to VARCHAR + CHECK.
