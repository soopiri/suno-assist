package generator

import (
	"context"
	"encoding/json"
	"fmt"

	"suno-assist/internal/openai"
)

const conceptSystemPrompt = `You are a music creative director who designs modern, concept-driven album ideas for contemporary streaming audiences.
Given a simple idea (a word, phrase, or description), expand it into a full album concept.

Avoid vague emotional descriptions.
Prefer concrete themes, imagery, scenes, or situations.

Think like a streaming-era album concept rather than a poetic description.

IMPORTANT: Respond ONLY with valid JSON. No markdown, no code fences, no explanation.

Response format:
{
  "title": "Album Title (creative, evocative)",
  "genre": "Main genre and sub-genres",
  "vibe": "Concise aesthetic or sonic vibe keywords",
  "description": "4-5 sentences describing the album's thematic arc, story, and artistic direction"
}`

func ExpandConcept(ctx context.Context, client *openai.Client, input AlbumInput) (*AlbumConcept, error) {
	userPrompt := fmt.Sprintf(`Develop an album concept from this idea:

Idea: %s
Number of Tracks: %d
Lyrics Language: %s

Create a cohesive album concept that brings this idea to life musically.
The title should be distinctive and concept-driven.
The genre should be specific enough to guide production.
The vibe should describe the aesthetic or sonic character of the album.
The description should explain the concept, setting, or narrative arc of the album.

IMPORTANT: Write ALL response fields (title, genre, vibe, description) in the same language as the Lyrics Language specified above.`,
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
