package db

import (
	"net/url"
	"strings"
)

// NormalizePostgresDSN adjusts connection strings for Neon / PgBouncer poolers.
//
// Transaction-pooling mode reuses connections across clients. Combined with
// lib/pq or pgx prepared statements, Postgres can return:
//
//	pq: bind message has N result formats but query has M columns (08P01)
//
// when a cached plan (e.g. four columns before a migration) no longer matches
// the query (eight columns after). prefer_simple_protocol disables prepared
// statements and avoids that class of errors.
func NormalizePostgresDSN(dsn string) string {
	lower := strings.ToLower(dsn)
	if strings.Contains(lower, "prefer_simple_protocol") {
		return dsn
	}

	needsSimple :=
		strings.Contains(lower, "neon.tech") ||
			strings.Contains(lower, "pooler") ||
			strings.Contains(lower, "pgbouncer=true")

	if !needsSimple {
		return dsn
	}

	u, err := url.Parse(dsn)
	if err != nil {
		sep := "?"
		if strings.Contains(dsn, "?") {
			sep = "&"
		}
		return dsn + sep + "prefer_simple_protocol=true"
	}

	q := u.Query()
	q.Set("prefer_simple_protocol", "true")
	u.RawQuery = q.Encode()
	return u.String()
}
