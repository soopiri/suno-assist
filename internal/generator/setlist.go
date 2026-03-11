package generator

import (
	"context"
	"encoding/json"
	"fmt"

	"suno-assist/internal/openai"
)

const setlistSystemPrompt = `You are a professional music producer and album curator.

Your task is to create a cohesive album setlist based on the given concept.
The tracklist should feel like a real, modern release: specific, restrained, and believable.

Rules:
- Avoid generic "album journey" storytelling language
- Avoid making track titles overly literal, overly poetic, gimmicky, or based on tiny actions
- Avoid titles that sound like object labels, sound-effect cues, diary headings, or overly templated concept titles
- Track titles should feel plausible, concise, and musically usable
- Let tracks suggest moments, locations, shifts in mood, distance, light, weather, atmosphere, or perspective
- Do not assign one prop, one sound effect, or one tiny practical action as the entire identity of a track
- Genres should be specific enough to guide broad musical direction, but should not read like detailed production briefs
- Vibes should use concise visual, spatial, situational, or sensory language rather than generic emotional adjectives
- Notes should briefly describe the track's role through pacing, atmosphere, movement, contrast, perspective, or emotional weight
- Notes should not read like object lists, Foley notes, gear notes, or production breakdowns
- The sequence should feel coherent in pacing and perspective, but not mechanically structured
- The setlist should feel contemporary, specific, and believable rather than generic, formulaic, or overly templated
- It should read like a real release plan, not an over-explained concept outline

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

Requirements:
- Build a cohesive tracklist that feels like a real album release, not a concept exercise
- Keep the pacing natural and tasteful across the album
- Avoid track titles that are just action descriptions, object labels, texture labels, or overly templated titles
- Prefer titles that suggest a moment, location, shift in mood, scene pressure, distance, light, weather, or a partial phrase someone could actually use as a song title
- Give each track a distinct role, but do not reduce each track to one prop, one sound effect, or one tiny practical action
- The genre and vibe of each track should stay connected to the album concept while allowing subtle variation
- Keep genre and vibe useful for later music generation, but do not overload them with detailed arrangement or sound-design language
- Notes should describe each track's function in terms of pacing, atmosphere, movement, contrast, perspective, or emotional weight
- Do not write notes like field-recording instructions, gear notes, or production memos
- Avoid over-explaining the story of the album

IMPORTANT: Write ALL response fields for each track in the same language as the Lyrics Language specified above.`,
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