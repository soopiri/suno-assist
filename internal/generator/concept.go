package generator

import (
	"context"
	"encoding/json"
	"fmt"

	"suno-assist/internal/openai"
)

const conceptSystemPrompt = `You are a creative music director who develops album concepts.
Given a simple idea (a word, phrase, or description), expand it into a full album concept.

IMPORTANT: Respond ONLY with valid JSON. No markdown, no code fences, no explanation.

Response format:
{
  "title": "Album Title (creative, evocative)",
  "genre": "Main genre and sub-genres",
  "mood": "Overall mood/atmosphere keywords",
  "description": "2-3 sentences describing the album's thematic arc, story, and artistic direction"
}`

func ExpandConcept(ctx context.Context, client *openai.Client, input AlbumInput) (*AlbumConcept, error) {
	userPrompt := fmt.Sprintf(`Develop an album concept from this idea:

Idea: %s
Number of Tracks: %d
Lyrics Language: %s

Create a cohesive album concept that brings this idea to life musically.
The title should be evocative and memorable.
The genre should be specific enough to guide production.
The mood should capture the emotional palette of the album.
The description should outline how the album tells its story across tracks.

IMPORTANT: Write ALL response fields (title, genre, mood, description) in the same language as the Lyrics Language specified above.`,
		input.Idea, input.TrackCount, input.Language)

	resp, err := client.ChatCompletion(ctx, conceptSystemPrompt, userPrompt)
	if err != nil {
		return nil, err
	}

	var result AlbumConcept
	if err := json.Unmarshal([]byte(resp), &result); err != nil {
		return nil, fmt.Errorf("failed to parse concept response: %w\nraw response: %s", err, resp)
	}

	result.Idea = input.Idea
	result.TrackCount = input.TrackCount
	result.Language = input.Language

	return &result, nil
}
