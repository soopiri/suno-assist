package generator

import (
	"context"
	"encoding/json"
	"fmt"

	"suno-assist/internal/openai"
)

const sunoPromptSystemPrompt = `You are an expert at crafting Suno AI music generation prompts.
Your task is to create an optimized "Style of Music" prompt for Suno AI's Custom Mode.

Rules:
- The stylePrompt MUST be under 1,000 characters (Suno's hard limit for the Style of Music field)
- Keep the final stylePrompt concise but information-dense
- Use comma-separated descriptive tags
- Prioritize the most important musical information first
- Include genre, energy, groove, core instrumentation, production character, pacing, and atmosphere when useful
- It is okay to be more specific here than in the album concept, because this prompt is for the individual track
- Use the track title, track notes, genre, vibe, BPM, key, album concept, and lyrics context to infer the clearest musical direction
- Prefer practical music-generation language over conceptual writing
- Focus on what Suno should actually generate: style, groove, instrumentation, pacing, density, tone, and atmosphere
- Avoid generic filler descriptors that do not help generation quality
- Avoid overly poetic, decorative, or vague wording
- Keep the wording modern, clean, and musically usable
- Do not write full sentences in the stylePrompt; keep it tag-like and generation-friendly
- NEVER include any voice/vocal descriptions (e.g. "male vocal", "female voice", "breathy tenor") - the user will set a Suno Persona separately
- Do not include artist names

IMPORTANT: Respond ONLY with valid JSON. No markdown, no code fences, no explanation.

Response format:
{
  "trackNumber": 1,
  "trackTitle": "...",
  "stylePrompt": "the style of music prompt for Suno"
}`

func GenerateSunoPrompt(ctx context.Context, client *openai.Client, concept AlbumConcept, track Track, lyrics string) (*SunoPromptResult, error) {
	userPrompt := fmt.Sprintf(`Create a Suno AI prompt for this track:

Album Title: %s
Album Genre: %s
Album Vibe: %s
Album Description: %s

Track #%d: "%s"
Track Genre: %s
Track Vibe: %s
Track BPM: %s
Track Key: %s
Track Notes: %s

Lyrics (for context only):
%s

Generate a "Style of Music" prompt optimized for Suno AI Custom Mode.

Requirements:
- This is the stage where detailed sound, instrumentation, groove, pacing, and production direction should be decided
- Make the stylePrompt specific enough to guide Suno clearly, but still concise and tag-based
- Use concrete musical direction such as groove feel, rhythmic density, acoustic/electronic balance, ambience, texture, recording character, tonal feel, and key instruments when useful
- Prefer the most materially useful descriptors over decorative wording
- Keep the result focused on what will actually affect generation quality
- Keep the stylePrompt clean, modern, and practical rather than overly conceptual
- NO voice or vocal descriptions - persona is set separately
- Do NOT use artist names`,
		concept.Title, concept.Genre, concept.Vibe, concept.Description,
		track.Number, track.Title,
		track.Genre, track.Vibe, track.BPM, track.Key, track.Notes,
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