const { Client } = require('pg');
const fs = require('fs');

const CONNECTION_STRING = process.argv[2] || 'postgresql://postgres.vftatwykyypaisjmkcql:bQG1WaZzJMfZ820N@aws-1-eu-north-1.pooler.supabase.com:6543/postgres';

async function dump() {
  const client = new Client({ connectionString: CONNECTION_STRING, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('Connected to Supabase.');

  const lines = [];
  const ln = (s = '') => lines.push(s);

  ln('-- ============================================================================');
  ln('-- SALON DASHBOARD — MASTER SCHEMA');
  ln('-- Generated: ' + new Date().toISOString());
  ln('-- Source: Supabase Cloud (schema-only, no data)');
  ln('-- ============================================================================');
  ln();

  // ── 1. Enums ──────────────────────────────────────────────────────────────
  const enums = await client.query(`
    SELECT t.typname, string_agg('''' || e.enumlabel || '''', ', ' ORDER BY e.enumsortorder) AS vals
    FROM pg_type t
    JOIN pg_enum e ON e.enumtypid = t.oid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
    GROUP BY t.typname ORDER BY t.typname;
  `);
  if (enums.rows.length) {
    ln('-- ═══════════════════════════════════════════════════');
    ln('-- ENUMS');
    ln('-- ═══════════════════════════════════════════════════');
    for (const r of enums.rows) {
      ln(`CREATE TYPE public.${r.typname} AS ENUM (${r.vals});`);
    }
    ln();
  }

  // ── 2. Tables ─────────────────────────────────────────────────────────────
  const tables = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `);

  for (const tbl of tables.rows) {
    const name = tbl.table_name;
    ln('-- ═══════════════════════════════════════════════════');
    ln(`-- TABLE: ${name}`);
    ln('-- ═══════════════════════════════════════════════════');

    // Columns
    const cols = await client.query(`
      SELECT column_name, data_type, udt_name, character_maximum_length,
             is_nullable, column_default, ordinal_position
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position;
    `, [name]);

    const colDefs = cols.rows.map(c => {
      let type;
      if (c.data_type === 'USER-DEFINED') type = c.udt_name;
      else if (c.data_type === 'ARRAY') type = c.udt_name;
      else if (c.character_maximum_length) type = `${c.data_type}(${c.character_maximum_length})`;
      else type = c.data_type;

      let def = `  "${c.column_name}" ${type}`;
      if (c.is_nullable === 'NO') def += ' NOT NULL';
      if (c.column_default !== null) def += ` DEFAULT ${c.column_default}`;
      return def;
    });

    // Primary keys
    const pk = await client.query(`
      SELECT tc.constraint_name,
             string_agg('"' || kcu.column_name || '"', ', ' ORDER BY kcu.ordinal_position) AS cols
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON kcu.constraint_name = tc.constraint_name AND kcu.table_schema = tc.table_schema
      WHERE tc.table_schema = 'public' AND tc.table_name = $1 AND tc.constraint_type = 'PRIMARY KEY'
      GROUP BY tc.constraint_name;
    `, [name]);

    if (pk.rows.length) {
      colDefs.push(`  CONSTRAINT "${pk.rows[0].constraint_name}" PRIMARY KEY (${pk.rows[0].cols})`);
    }

    ln(`CREATE TABLE IF NOT EXISTS public."${name}" (`);
    ln(colDefs.join(',\n'));
    ln(');');
    ln();

    // Unique constraints
    const uq = await client.query(`
      SELECT tc.constraint_name,
             string_agg('"' || kcu.column_name || '"', ', ' ORDER BY kcu.ordinal_position) AS cols
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON kcu.constraint_name = tc.constraint_name AND kcu.table_schema = tc.table_schema
      WHERE tc.table_schema = 'public' AND tc.table_name = $1 AND tc.constraint_type = 'UNIQUE'
      GROUP BY tc.constraint_name;
    `, [name]);
    for (const r of uq.rows) {
      ln(`ALTER TABLE public."${name}" ADD CONSTRAINT "${r.constraint_name}" UNIQUE (${r.cols});`);
    }

    // Foreign keys
    const fk = await client.query(`
      SELECT tc.constraint_name, kcu.column_name, ccu.table_name AS ref_table, ccu.column_name AS ref_col,
             rc.delete_rule, rc.update_rule
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON kcu.constraint_name = tc.constraint_name AND kcu.table_schema = tc.table_schema
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
      JOIN information_schema.referential_constraints rc
        ON rc.constraint_name = tc.constraint_name AND rc.constraint_schema = tc.table_schema
      WHERE tc.table_schema = 'public' AND tc.table_name = $1 AND tc.constraint_type = 'FOREIGN KEY';
    `, [name]);
    for (const r of fk.rows) {
      let stmt = `ALTER TABLE public."${name}" ADD CONSTRAINT "${r.constraint_name}" FOREIGN KEY ("${r.column_name}") REFERENCES public."${r.ref_table}"("${r.ref_col}")`;
      if (r.delete_rule === 'CASCADE') stmt += ' ON DELETE CASCADE';
      else if (r.delete_rule === 'SET NULL') stmt += ' ON DELETE SET NULL';
      if (r.update_rule === 'CASCADE') stmt += ' ON UPDATE CASCADE';
      stmt += ';';
      ln(stmt);
    }

    if (uq.rows.length || fk.rows.length) ln();
  }

  // ── 3. Indexes ────────────────────────────────────────────────────────────
  const idx = await client.query(`
    SELECT pg_get_indexdef(i.indexrelid) AS def
    FROM pg_index i
    JOIN pg_class c ON c.oid = i.indrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_class ic ON ic.oid = i.indexrelid
    WHERE n.nspname = 'public' AND NOT i.indisprimary AND NOT i.indisunique
    ORDER BY ic.relname;
  `);
  if (idx.rows.length) {
    ln('-- ═══════════════════════════════════════════════════');
    ln('-- INDEXES');
    ln('-- ═══════════════════════════════════════════════════');
    for (const r of idx.rows) ln(r.def + ';');
    ln();
  }

  // ── 4. RLS ────────────────────────────────────────────────────────────────
  const rls = await client.query(`
    SELECT c.relname, c.relrowsecurity
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r'
    ORDER BY c.relname;
  `);
  const rlsEnabled = rls.rows.filter(r => r.relrowsecurity);
  if (rlsEnabled.length) {
    ln('-- ═══════════════════════════════════════════════════');
    ln('-- ROW LEVEL SECURITY');
    ln('-- ═══════════════════════════════════════════════════');
    for (const r of rlsEnabled) {
      ln(`ALTER TABLE public."${r.relname}" ENABLE ROW LEVEL SECURITY;`);
    }
    ln();
  }

  // ── 5. RLS Policies ───────────────────────────────────────────────────────
  const policies = await client.query(`
    SELECT pol.polname AS policyname, c.relname,
           CASE pol.polpermissive WHEN true THEN 'PERMISSIVE' ELSE 'RESTRICTIVE' END AS permissive,
           CASE pol.polcmd
             WHEN 'r' THEN 'SELECT' WHEN 'a' THEN 'INSERT'
             WHEN 'w' THEN 'UPDATE' WHEN 'd' THEN 'DELETE' WHEN '*' THEN 'ALL'
           END AS cmd,
           pg_get_expr(pol.polqual, pol.polrelid) AS qual,
           pg_get_expr(pol.polwithcheck, pol.polrelid) AS withcheck
    FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
    ORDER BY c.relname, pol.polname;
  `);
  if (policies.rows.length) {
    ln('-- ═══════════════════════════════════════════════════');
    ln('-- RLS POLICIES');
    ln('-- ═══════════════════════════════════════════════════');
    for (const p of policies.rows) {
      let stmt = `CREATE POLICY "${p.policyname}" ON public."${p.relname}" AS ${p.permissive} FOR ${p.cmd}`;
      if (p.qual) stmt += `\n  USING (${p.qual})`;
      if (p.withcheck) stmt += `\n  WITH CHECK (${p.withcheck})`;
      stmt += ';';
      ln(stmt);
    }
    ln();
  }

  // ── 6. Functions ──────────────────────────────────────────────────────────
  const funcs = await client.query(`
    SELECT pg_get_functiondef(p.oid) AS def
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
    ORDER BY p.proname;
  `);
  if (funcs.rows.length) {
    ln('-- ═══════════════════════════════════════════════════');
    ln('-- FUNCTIONS');
    ln('-- ═══════════════════════════════════════════════════');
    for (const r of funcs.rows) ln(r.def + ';');
    ln();
  }

  // ── 7. Triggers ───────────────────────────────────────────────────────────
  const triggers = await client.query(`
    SELECT pg_get_triggerdef(t.oid, true) AS def
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND NOT t.tgisinternal
    ORDER BY c.relname, t.tgname;
  `);
  if (triggers.rows.length) {
    ln('-- ═══════════════════════════════════════════════════');
    ln('-- TRIGGERS');
    ln('-- ═══════════════════════════════════════════════════');
    for (const r of triggers.rows) ln(r.def + ';');
    ln();
  }

  await client.end();

  const output = lines.join('\n');
  fs.writeFileSync('master-schema.sql', output, 'utf-8');
  console.log(`\n✅ Schema dumped to master-schema.sql (${lines.length} lines)`);
}

dump().catch(err => { console.error('FATAL:', err.message); process.exit(1); });
