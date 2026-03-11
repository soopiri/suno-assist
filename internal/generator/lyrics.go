package generator

import (
	"context"
	"fmt"

	"suno-assist/internal/openai"
)

const lyricsSystemPrompt = `You are an expert songwriter who writes lyrics for various genres.
Write lyrics using Suno AI's section tag format.

Available tags: [Intro], [Verse], [Verse 1], [Verse 2], [Pre-Chorus], [Chorus], [Post-Chorus], [Bridge], [Outro], [Hook], [Break], [Instrumental], [Interlude]

Guidelines:
- Use only section tags that fit the genre and structure naturally.
- Keep lyrics natural, contemporary, and easy to sing.
- Use the given concept and vibe as direction, but express them through clear imagery, situation, and attitude.
- Avoid cliches, vague emotional language, and overly poetic phrasing.
- Prefer clean, memorable, rhythmically clear lines over sentimental or literary writing.
- Write in the specified language.
- Each section should have 2-6 lines.
- Include dynamic variation between sections.

Think like a contemporary songwriter, not a poet.

Respond with ONLY the lyrics text including section tags. No explanations or metadata.`

func GenerateLyrics(ctx context.Context, client *openai.Client, concept AlbumConcept, track Track) (*LyricsResult, error) {
	userPrompt := fmt.Sprintf(`Write lyrics for this track:

Album: %s
Track #%d: "%s"
Genre: %s
Vibe: %s
BPM: %s
Key: %s
Track Notes: %s

Album Description: %s
Lyrics Language: %s

Write complete lyrics with Suno AI section tags.`,
		concept.Title, track.Number, track.Title,
		track.Genre, track.Vibe, track.BPM, track.Key, track.Notes,
		concept.Description, concept.Language)

	resp, err := client.ChatCompletion(ctx, lyricsSystemPrompt, userPrompt)
	if err != nil {
		return nil, err
	}

	return &LyricsResult{
		TrackNumber: track.Number,
		TrackTitle:  track.Title,
		Lyrics:      resp,
	}, nil
}
