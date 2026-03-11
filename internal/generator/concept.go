package generator

import (
	"context"
	"encoding/json"
	"fmt"

	"suno-assist/internal/openai"
)

const conceptSystemPrompt = `You are a music creative director developing modern, tasteful, concept-driven album ideas.

Your job is to turn a simple idea into an album concept that feels plausible, current, restrained, and musically usable.

Rules:
- Avoid poetic, sentimental, overly romantic, or literary language
- Avoid generic emotional adjectives such as nostalgic, heartfelt, dreamy, intimate, emotional, soulful, melancholic, healing, or warm unless clearly justified
- Avoid cliché themes such as self-discovery, friendship, freedom, comfort, or connection unless they emerge naturally through specific scenes or situations
- Prefer concrete scenes, times of day, environments, movement, light, weather, spatial tension, and lived-in situations
- Use objects and actions only as part of a larger scene; do not let the concept become a list of props, textures, or micro-actions
- Do not build the concept around one overly small action, one single prop, or checklist-like details
- Let the concept suggest a lived-in world, recurring situations, and a human point of view
- Keep production language broad and minimal; do not over-index on texture notes, field-recording language, arrangement jargon, or sound-design details
- The concept should feel like a real contemporary release, not a literary blurb, sound-design brief, or over-explained concept outline
- Make the concept tasteful, grounded, specific, and slightly understated

IMPORTANT: Respond ONLY with valid JSON. No markdown, no code fences, no explanation.

Response format:
{
  "title": "Short, modern, distinctive album title",
  "genre": "Main genre and sub-genres",
  "vibe": "3-6 concrete visual, spatial, situational, or sensory keywords/phrases",
  "description": "4-5 sentences describing the album's setting, recurring situations, perspective, and overall tone in a grounded way"
}`

func ExpandConcept(ctx context.Context, client *openai.Client, input AlbumInput) (*AlbumConcept, error) {
	userPrompt := fmt.Sprintf(`Develop an album concept from this idea:

Idea: %s
Number of Tracks: %d
Lyrics Language: %s

Create a cohesive album concept that feels modern, restrained, stylish, and believable as a real release.

Requirements:
- The title should be short, distinctive, and plausible as a real streaming-era release title
- Avoid overly poetic, generic, or overly literal title words unless clearly necessary
- Avoid titles that read like simple object labels, action labels, or overly templated concept titles
- The genre should be specific enough to guide broad musical direction, but do not overload it with production jargon
- The vibe should use concrete visual, spatial, situational, or sensory cues rather than generic emotional adjectives
- The description should explain the album's setting, recurring situations, perspective, and overall tone
- Prefer scenes, time flow, human presence, movement, and environment over abstract feelings
- Use physical details only when they help create a larger scene, perspective, or recurring image
- Do not make the concept revolve around tiny practical actions or a checklist of objects
- Keep sound and production references broad, minimal, and secondary to the overall concept
- Do not write this like a sentimental album synopsis, production memo, or sound brief
- Aim for something grounded, contemporary, specific, and musically usable

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