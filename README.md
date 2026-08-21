# QuakeFeed

A React Native app that reads the public USGS earthquake feeds and stays usable
with no network. Built with Expo, expo-router and TypeScript.

No API key, no account, no configuration. Clone it and it runs.

```bash
npm install
npx expo start
```

Open it in Expo Go, an emulator, or the browser with `w`.

## What this project demonstrates

This is a portfolio project, so the interesting parts are deliberate.

**A list that stays smooth at scale.** The USGS month feed returns roughly twelve
thousand events in a single response. Rows have a fixed height, which lets
`getItemLayout` skip measurement entirely, and `QuakeRow` is memoised with an
explicit comparator so scrolling does not re-render rows that did not change.
Start on `All / Day` for a fast first load, then switch to `All / Month` and
scroll.

**Offline that actually works.** Every feed is cached in AsyncStorage under a
versioned key. On open, the cached feed renders first and a refresh runs behind
it; if the cache is younger than five minutes the network is not touched at all.
When a request fails and a cached feed exists, the app keeps showing it and says
so in the banner rather than throwing away readable data.

**Requests that clean up after themselves.** Changing the feed selection aborts
the request in flight through `AbortController`, so a fast tapper does not race
an old response into the screen.

**Filtering kept out of the components.** Search, magnitude threshold and sort
live in pure functions in `src/lib/query.ts`. They take an array and return an
array, which is why they are covered by tests instead of by clicking around.

**Text input that does not lose focus.** The filter bar is rendered next to the
list, not through `ListHeaderComponent`, which would remount the input on every
keystroke. It is a small thing that breaks a lot of React Native apps.

## Architecture

```
app/                    routes, one file per screen
  _layout.tsx           providers and the stack navigator
  index.tsx             feed screen
  quake/[id].tsx        event detail, reachable by deep link
src/
  api/                  USGS endpoints, defensive GeoJSON parsing
  cache/                versioned AsyncStorage cache with a staleness rule
  hooks/                the feed controller: cache, fetch, abort, error state
  state/                context that exposes the feed and the derived list
  lib/                  pure formatting and query functions
  ui/                   presentational components and the theme
__tests__/              unit and component tests
```

Data flows one way. `useFeedController` owns fetching and caching and exposes a
read-only state object. `FeedProvider` derives the visible list from that state
plus the current query. Screens render what they are given and call back up.

## Parsing untrusted data

The USGS feed is public and occasionally incomplete: `mag` and `place` can be
null, and features can carry empty geometry. `parseFeed` treats the payload as
`unknown`, validates each field, keeps events that are merely incomplete and
drops the ones that cannot be identified or placed. A missing magnitude renders
as `--` rather than `NaN`.

## Deep links

The app registers the `quakefeed` scheme, so an event opens directly:

```
quakefeed://quake/ci40000001
```

If the event is not in the feed currently loaded, the detail screen says so
instead of rendering an empty shell.

## Tests

```bash
npm test
npm run typecheck
```

Fifty-four tests across five suites. The suite covers URL building, GeoJSON
parsing including malformed input, magnitude buckets and time formatting, the
query pipeline, the cache round trip with a corrupted-entry case, and the list
row component down to press handling.

TypeScript runs in strict mode with no `any` in application code.

## Data source

Earthquake data comes from the
[USGS Earthquake Hazards Program](https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php)
real-time feeds. This project is not affiliated with the USGS.

## License

MIT
