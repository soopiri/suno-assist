package generator

import (
	"context"
	"encoding/json"
	"fmt"

	"suno-assist/internal/openai"
)

const setlistSystemPrompt = `You are a professional music producer and album curator.
Your task is to create a cohesive album setlist based on the given concept.
Each track should flow naturally within the album while maintaining variety.

IMPORTANT: Respond ONLY with valid JSON. No markdown, no code fences, no explanation.

Response format:
{
  "albumTitle": "...",
  "tracks": [
    {
      "number": 1,
      "title": "Track Title",
      "genre": "specific sub-genre",
      "vibe": "concise aesthetic or vibe keywords",
      "bpm": "120",
      "key": "C minor",
      "notes": "brief description of the track's role in the album"
    }
  ]
}`

func GenerateSetlist(ctx context.Context, client *openai.Client, concept AlbumConcept) (*SetlistResult, error) {
	userPrompt := fmt.Sprintf(`Create an album setlist with the following concept:

Album Title: %s
Main Genre: %s
Overall Vibe: %s
Number of Tracks: %d
Description: %s
Lyrics Language: %s

Design the tracklist so it tells a story or maintains a thematic arc across the album.
Consider pacing - mix energetic and calm tracks for good flow.`,
		concept.Title, concept.Genre, concept.Vibe, concept.TrackCount, concept.Description, concept.Language)

	resp, err := client.ChatCompletion(ctx, setlistSystemPrompt, userPrompt)
	if err != nil {
		return nil, err
	}

	var result SetlistResult
	if err := json.Unmarshal([]byte(resp), &result); err != nil {
		return nil, fmt.Errorf("failed to parse setlist response: %w\nraw response: %s", err, resp)
	}

	return &result, nil
}
