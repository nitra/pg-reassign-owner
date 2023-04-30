#! /usr/bin/env node
import pgLib from 'pg'
import { exit } from 'node:process'

const [, , newRole] = process.argv
console.log(`Set owner: ${newRole} to all objects in ${process.env.PGDATABASE}`)

const { Client } = pgLib
const client = new Client()
await client.connect()

if ((await client.query(`SELECT 1 FROM pg_roles WHERE rolname = '${newRole}'`)).rows[0] === undefined)
  finish(`Role ${newRole} not exists`)

// Database
await client.query(/* sql */ `ALTER DATABASE ${process.env.PGDATABASE} OWNER TO ${newRole};`)
console.log('DB altered')

// Tables
const tables =
  await client.query(/* sql */ `SELECT 'ALTER TABLE "'|| schemaname || '"."' || tablename ||'" OWNER TO ${newRole}' as command
  FROM pg_tables WHERE NOT schemaname IN ('pg_catalog', 'information_schema')`)
for (const { command } of tables.rows) {
  await client.query(command)
}
console.log(`Tables altered: ${tables.rowCount}`)

// Sequences
const sequences =
  await client.query(/* sql */ `SELECT 'ALTER SEQUENCE "'|| sequence_schema || '"."' || sequence_name ||'" OWNER TO ${newRole};' as command
  FROM information_schema.sequences WHERE NOT sequence_schema IN ('pg_catalog', 'information_schema')`)
for (const { command } of sequences.rows) {
  await client.query(command)
}
console.log(`Sequences altered: ${sequences.rowCount}`)

// Views
const views =
  await client.query(/* sql */ `SELECT 'ALTER VIEW "'|| table_schema || '"."' || table_name ||'" OWNER TO ${newRole};' as command
  FROM information_schema.views WHERE NOT table_schema IN ('pg_catalog', 'information_schema')`)
for (const { command } of views.rows) {
  await client.query(command)
}
console.log(`Views altered: ${views.rowCount}`)

// Schemas
const schemas = await client.query(
  /* sql */ `SELECT distinct(schemaname) AS schema FROM pg_tables WHERE NOT schemaname IN ('pg_catalog', 'information_schema')`
)
for (const { schema } of schemas.rows) {
  await client.query(`ALTER SCHEMA "${schema}" OWNER TO ${newRole};`)
}
console.log(`Schemas altered: ${schemas.rowCount}`)

// Functions and trigger functions
const functions =
  await client.query(/* sql */ `SELECT 'alter function "'||nsp.nspname||'"."'||p.proname||'" ('||pg_get_function_identity_arguments(p.oid)||') owner to ${newRole};' as command
        FROM pg_proc p
        JOIN pg_namespace nsp ON p.pronamespace = nsp.oid
        WHERE NOT  nsp.nspname IN ('pg_catalog', 'information_schema')`)
for (const { command } of functions.rows) {
  await client.query(command)
}
console.log(`Functions and trigger functions altered: ${functions.rowCount}`)

await client.end()

// check_role_exists

async function finish(message) {
  console.log(message)
  await client.end()
  exit()
}
