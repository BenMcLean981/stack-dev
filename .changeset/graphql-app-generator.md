---
'@stack-dev/cli': minor
---

Added a `graphql` package type: `stack g <name> --type graphql` scaffolds a GraphQL API built with GraphQL Yoga and Pothos.

The schema is code-first through Pothos, which is server-agnostic, so the server is a two-file decision rather than something baked through the resolvers. Yoga is mounted as a request handler on `node:http` alongside a plain `/health` route, since it is a handler rather than a framework.

Resolvers reach their dependencies only through the context, and the generated app ships a worked example of that: a `Books` interface with an in-memory implementation, a query, a mutation, and passing tests that run operations against the real schema. Because Yoga is built on fetch, the test helper calls `yoga.fetch` and exercises the whole server — parsing, validation and error handling — without binding a port.

Catalog additions: `graphql@^17.0.2`, `graphql-yoga@^5.24.4`, and `@pothos/core@^4.15.1`. Both Yoga 5 and Pothos 4 support graphql 17.
