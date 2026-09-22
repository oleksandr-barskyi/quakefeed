# QuakeFeed backend

A small NestJS service that sits in front of the same public USGS earthquake
feed the QuakeFeed app reads directly, adding a server-side cache and a
WebSocket push so a mobile client does not have to poll USGS itself.

It is optional. The Expo app works with no configuration and does not need
this running.

## Run it

```bash
cd backend
npm install
npm run start:dev
```

The server listens on port 3000 by default (`PORT` env var to change it).
`npm run build` compiles to `dist/`, `npm run start` runs the compiled build.

## REST endpoints

```bash
curl "http://localhost:3000/quakes?range=day&minMagnitude=2.5&sort=magnitude"
curl "http://localhost:3000/quakes/us7000tj1s"
curl "http://localhost:3000/health"
```

`range` is `day`, `week` or `month` (default `day`). `minMagnitude` is any
number, quakes with a null magnitude are dropped once a threshold is set.
`sort` is `time` (default, newest first) or `magnitude` (strongest first,
null magnitude last). An unknown query parameter, such as `?bogs=1`, is
rejected with `400 Bad Request` rather than silently ignored. `GET
/quakes/:id` returns `404` if that id is not in a feed the server has
already fetched and cached.

## WebSocket

Connect with a socket.io client to the same host and listen for
`quakes:update`. The payload is `{ changes: QuakeChange[], checkedAt: number
}`, where each `QuakeChange` is `{ kind: 'new' | 'updated', quake:
QuakeRecord }`. One event is pushed per poll tick that found at least one new
or materially changed event, never one message per raw feed poll and never
one message per quake.

## What this demonstrates

**Caching with a TTL instead of hammering a public feed.** `QuakesCacheService`
is an injectable in-memory `Map` keyed by range, honest about being in-memory
(it resets on restart, and is not shared across multiple server instances).
An entry younger than five minutes is served without touching USGS again,
the same staleness rule the mobile app already applies client-side in
`src/cache/feedCache.ts`.

**A validation pipe that rejects unknown query params instead of silently
ignoring typos.** The global `ValidationPipe` runs with `whitelist` and
`forbidNonWhitelisted`, and `GetQuakesQueryDto` uses `class-validator`
decorators, so `?range=year` or `?magnitude=5` (the wrong key) come back as a
`400` with a message naming the problem, not a query that quietly did
nothing.

**Defensive parsing kept out of the controller.** `src/quakes/lib/parse-feed.ts`
treats the USGS payload as `unknown` and is the Node-side sibling of the
app's own `parseFeed` in `src/api/usgs.ts`: same defensive posture against a
public feed that can send a null `mag`, a null `place`, or empty geometry,
written fresh for this runtime rather than copied across.

**Batched WebSocket pushes instead of one message per poll.**
`QuakesGateway` polls USGS server-side every 30 seconds and hands the result
to a pure diff function, `src/quakes/lib/diff-quakes.ts`, which compares
against the last known state and returns only the events that are new or
whose magnitude, place, status, tsunami flag or significance actually
changed. If nothing changed, nothing is emitted that tick. If ten things
changed, they go out as one `quakes:update` event, not ten. The diff function
takes a map and an array and returns an array, so it is unit tested directly,
the same instinct behind `tickstream`'s coalescing buffer in
`src/core/batcher.ts`, applied to a poll-and-diff problem instead of a
tick-stream problem.

**Business logic kept in plain functions, not sprinkled across the
controller.** `parseFeed`, `applyQuery` (filter and sort) and `diffQuakes`
take values and return values, no Nest decorators, no DI. That is what makes
them fast to unit test and safe to reuse from the gateway and the REST
controller alike.

## Tests

```bash
npm test
npm run test:e2e
npm run typecheck
```

Unit tests cover `parseFeed` (well-formed events, null magnitude, null
place, missing id, missing time, empty geometry, a non-object feature, a
missing `features` array, a non-object payload), `applyQuery` (default time
sort, magnitude sort with nulls last, magnitude filtering including how a
null magnitude is treated with and without a filter, that it does not mutate
its input), `diffQuakes` (every quake reported new against an empty known
set, no changes when nothing changed, an update on a magnitude or status
change, a field that is deliberately not tracked as material, several
changes batched into one call), and `QuakesCacheService` (a miss, a hit, TTL
boundaries, overwriting an entry, listing everything cached). `QuakesService`
has its own suite that mocks `UsgsClientService` to check the cache-hit and
cache-miss paths without a real network call.

The e2e suite boots the whole Nest app with `Test.createTestingModule`,
overrides `UsgsClientService` with a fixture feed, and drives it through
`supertest`: the default listing, magnitude filtering, magnitude sorting, a
rejected unknown query param, a rejected invalid `range` value, a detail
lookup that succeeds once the feed has been fetched, and one that 404s.

## Notes on dependency choices

This is pinned to NestJS 11 (`^11.2.5`), not the newer 12.x line. NestJS 12
ships as ESM-only (`"type": "module"` in `@nestjs/common`'s own
`package.json`), which `ts-jest` on CommonJS cannot `require()` directly.
Rather than rewire the whole toolchain to ESM under a tonight deadline, this
pins to the last CommonJS-era major, which is still a fully current, real
NestJS release with the same decorators, DI and module system.

`npm audit` reports a `multer` advisory pulled in transitively through
`@nestjs/platform-express`. It is about crafted multipart form-data uploads;
nothing in this service accepts file uploads (no `multipart/form-data`
endpoints exist), so the advisory does not apply to how this code is used.
It is left visible rather than silenced.

There is no Redis, no queue and no `@nestjs/cli` scaffolding here. The cache
is a `Map`, the dev server runs through `ts-node`, and the build runs through
plain `tsc`, all of it sized to what this service actually needs.
