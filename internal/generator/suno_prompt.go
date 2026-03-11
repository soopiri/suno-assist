package generator

import (
	"context"
	"encoding/json"
	"fmt"

	"suno-assist/internal/openai"
)

const sunoPromptSystemPrompt = `You are an expert at crafting Suno AI music generation prompts.
Your task is to create an optimized "Style of Music" prompt for Suno AI's Custom Mode.

Rules for Suno AI Style prompts:
- Keep it concise: 1-2 genres max, 1 vibe/energy line, 2-4 priority instruments
- Use comma-separated descriptive tags
- Don't overload with too many descriptors - this reduces quality
- Format: genre tags, vibe, instruments
- NEVER include any voice/vocal descriptions (e.g. "male vocal", "female voice", "breathy tenor") - the user will set a Suno Persona separately

IMPORTANT: Respond ONLY with valid JSON. No markdown, no code fences, no explanation.

Response format:
{
  "trackNumber": 1,
  "trackTitle": "...",
  "stylePrompt": "the style of music prompt for Suno",
  "lyricsPrompt": "any additional lyrics direction or metatags to prepend"
}`

func GenerateSunoPrompt(ctx context.Context, client *openai.Client, concept AlbumConcept, track Track, lyrics string) (*SunoPromptResult, error) {
	userPrompt := fmt.Sprintf(`Create a Suno AI prompt for this track:

Album: %s
Track #%d: "%s"
Genre: %s
Vibe: %s
BPM: %s
Key: %s

Lyrics (for context):
%s

Generate:
1. A "Style of Music" prompt optimized for Suno AI Custom Mode (NO voice/vocal descriptions - persona is set separately)
2. Any metatags to prepend to the lyrics (e.g., [BPM: 120]) - do NOT include voice or vocal direction tags`,
		concept.Title, track.Number, track.Title,
		track.Genre, track.Vibe, track.BPM, track.Key,
		lyrics)

	resp, err := client.ChatCompletion(ctx, sunoPromptSystemPrompt, userPrompt)
	if err != nil {
		return nil, err
	}

	var result SunoPromptResult
	if err := json.Unmarshal([]byte(resp), &result); err != nil {
		return nil, fmt.Errorf("failed to parse suno prompt response: %w\nraw response: %s", err, resp)
	}

	return &result, nil
}
