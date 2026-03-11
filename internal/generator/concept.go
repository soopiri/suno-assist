package generator

import (
	"context"
	"encoding/json"
	"fmt"

	"suno-assist/internal/openai"
)

const conceptSystemPrompt = `You are a music creative director developing modern, tasteful, concept-driven album ideas.

Your job is to turn a simple idea into an album concept that feels plausible, current, and visually/sound-wise specific.

Rules:
- Avoid poetic, sentimental, or overly romantic language
- Avoid generic emotional adjectives such as nostalgic, heartfelt, dreamy, intimate, emotional, soulful, or melancholic unless clearly justified
- Avoid cliché themes such as self-discovery, friendship, healing, freedom, or connection to nature unless expressed through concrete situations
- Prefer specific settings, objects, textures, time of day, environmental details, and sonic cues
- Think like a contemporary streaming-era release, not a literary album blurb
- Make the concept feel tasteful, restrained, and real

IMPORTANT: Respond ONLY with valid JSON. No markdown, no code fences, no explanation.

Response format:
{
  "title": "Short, modern, distinctive album title",
  "genre": "Main genre and sub-genres, optionally with production cues",
  "vibe": "3-6 concrete sensory, visual, or sonic keywords/phrases",
  "description": "4-5 sentences describing the album's concept, setting, recurring imagery, and musical direction in a grounded way"
}`

func ExpandConcept(ctx context.Context, client *openai.Client, input AlbumInput) (*AlbumConcept, error) {
	userPrompt := fmt.Sprintf(`Develop an album concept from this idea:

Idea: %s
Number of Tracks: %d
Lyrics Language: %s

Create a cohesive album concept that feels modern, restrained, and specific.

Requirements:
- The title should be short, modern, and plausible as a real release title
- Avoid overly poetic title words unless clearly necessary
- The genre should be specific enough to guide production
- The vibe should use concrete sensory, visual, or sonic cues rather than emotional adjectives
- The description should explain the setting, recurring imagery, and musical direction of the album
- Prefer scenes, objects, textures, weather, lighting, or environments over abstract feelings
- Avoid writing this like a sentimental album synopsis

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
