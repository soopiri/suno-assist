package generator

import (
	"context"
	"encoding/json"
	"fmt"

	"suno-assist/internal/openai"
)

const conceptSystemPrompt = `You are a music creative director developing modern, tasteful, concept-driven album ideas.

Your job is to turn a simple idea into an album concept that feels plausible, current, restrained, and musically alive.

Rules:
- Avoid poetic, sentimental, overly romantic, or literary language
- Avoid generic emotional adjectives such as nostalgic, heartfelt, dreamy, intimate, emotional, soulful, melancholic, healing, or warm unless clearly justified
- Avoid cliché themes such as self-discovery, friendship, freedom, comfort, or connection to nature unless they emerge naturally through specific scenes
- Prefer concrete scenes, times of day, environments, light, weather, movement, and sonic atmosphere
- Use objects and actions only as part of a larger scene; do not let the concept become a list of props, textures, or micro-actions
- Do not build the concept around one overly small action, one single prop, or checklist-like camping details
- Let the concept suggest a lived-in world, recurring situations, and a human point of view
- The concept should feel like a real contemporary release, not a literary blurb or a production breakdown
- Make the concept tasteful, grounded, and slightly understated

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

Create a cohesive album concept that feels modern, restrained, stylish, and believable as a real release.

Requirements:
- The title should be short, distinctive, and plausible as a real streaming-era release title
- Avoid overly poetic title words unless clearly necessary
- Avoid titles that are just object names, action labels, or stock cliches
- The genre should be specific enough to guide production
- The vibe should use concrete sensory, visual, spatial, or sonic cues rather than emotional adjectives
- The description should explain the album's setting, recurring situations, atmosphere, and musical direction
- Prefer scenes, time flow, human presence, movement, and environment over abstract feelings
- Use physical details only when they help create a larger scene or perspective
- Do not make the concept revolve around tiny practical actions or a checklist of camping objects
- Do not write this like a sentimental album synopsis or a production memo
- Aim for something grounded, contemporary, and musically usable

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