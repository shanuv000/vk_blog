# Cricket JSON Structure Analysis

## Current Expected Structure

The application currently expects match data with the following structure:

```javascript
{
  success: true,
  count: number,
  data: [
    {
      heading: string,           // Tournament name - REQUIRED for filtering
      title: string,
      matchLink: string,
      matchDetails: string,
      status: string,
      location: string,
      playingTeamBat: string,
      playingTeamBall: string,
      teams: string[],
      teamAbbr: string[],
      liveScorebat: string,
      liveScoreball: string,
      scores: string[],
      liveCommentary: string,
      links: {
        "Live Score": string,
        "Scorecard": string,
        "Full Commentary": string,
        "News": string
      },
      time: string
    }
  ]
}
```

## Provided Structure (Missing `heading`)

```javascript
{
  success: true,
  count: 6,
  data: [
    {
      title: "South Africa vs India, 1st Test",
      matchLink: "https://www.cricbuzz.com/live-cricket-scores/117371/...",
      matchDetails: "South Africa vs India, 1st Test",
      status: "N/A",
      location: "1st Test • Kolkata, Eden Gardens",
      playingTeamBat: "South Africa",
      playingTeamBall: "India",
      teams: ["South Africa", "India"],
      teamAbbr: ["RSA", "IND"],
      liveScorebat: "159",
      liveScoreball: "37-1",
      scores: ["159", "37-1"],
      liveCommentary: "Day 1: Stumps - India trail by 122 runs",
      links: { ... },
      time: "N/A"
      // ❌ MISSING: heading property
    }
  ]
}
```

## Key Missing Field

**`heading`** - This field is critical for the tournament filtering feature. The application uses `heading` to:

1. Group matches by tournament
2. Populate the tournament dropdown selector
3. Filter matches based on selected tournament

## Solutions

### Option 1: Add Heading to API Response

Modify the API to include a `heading` field extracted from match details.

### Option 2: Extract Heading from Existing Data (RECOMMENDED)

Add a data transformation layer that extracts the tournament name from existing fields like:

- `matchDetails` - Extract tournament type (e.g., "1st Test", "2nd ODI")
- `location` - Extract tournament info
- `title` - Parse for tournament information

### Option 3: Modify Application to Work Without Heading

Update the application to group matches differently or remove tournament filtering.

## Recommended Implementation

Add a middleware function that processes the API response and adds the `heading` field:

```javascript
function addHeadingToMatches(apiResponse) {
  if (!apiResponse.data) return apiResponse;

  return {
    ...apiResponse,
    data: apiResponse.data.map((match) => ({
      ...match,
      heading: extractHeading(match),
    })),
  };
}

function extractHeading(match) {
  // Extract from matchDetails or location
  // Examples:
  // "South Africa vs India, 1st Test" → "Test Series"
  // "2nd ODI • Rawalpindi" → "ODI Series"
  // "2nd Match, Group B" → "ACC Mens Asia Cup Rising Stars 2025"

  if (match.matchDetails) {
    if (match.matchDetails.includes("Test")) return "Test Matches";
    if (match.matchDetails.includes("ODI")) return "ODI Matches";
    if (match.matchDetails.includes("T20")) return "T20 Matches";
    if (match.matchDetails.includes("Group")) return "Tournament Matches";
  }

  return "Other Matches";
}
```

## Files to Modify

1. **`/store/HandleApiContext.js`** - Add data transformation in `useFetchData` hook
2. **`/pages/api/cricket-proxy.js`** - Add heading extraction in API response
3. **Alternative**: Keep current structure and add heading at API source

## Current Tournament Filtering Logic

The app uses this logic in `/hooks/useMatchData.jsx`:

```javascript
const uniqueHeadings = Array.from(
  new Set(matches.map((match) => match.heading))
);
```

Without the `heading` field, this will create an array of `undefined` values and break the filtering feature.
