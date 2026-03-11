package generator

import (
	"context"
	"fmt"

	"suno-assist/internal/openai"
)

const lyricsSystemPrompt = `You are an expert songwriter who writes modern lyrics for various genres.
Write lyrics using Suno AI's section tag format.

Available tags: [Intro], [Verse], [Verse 1], [Verse 2], [Pre-Chorus], [Chorus], [Post-Chorus], [Bridge], [Outro], [Hook], [Break], [Instrumental], [Interlude]

Guidelines:
- Use only section tags that fit the genre and structure naturally
- Keep lyrics natural, contemporary, singable, and rhythmically clear
- Use the given concept and vibe as direction, but turn them into scenes, lines, and perspective rather than explanations
- Concrete actions and objects are allowed, but only when they create atmosphere, tension, intimacy, rhythm, movement, or perspective
- Avoid step-by-step action descriptions, object listings, Foley-style sound cue writing, and literal narration of tiny practical tasks
- Avoid clichés, vague emotional language, diary-like confession, and overly poetic phrasing
- Avoid decorative filler and lines that feel self-consciously stylized rather than naturally singable
- Do not mention production terms, arrangement language, or technical sound descriptions directly in the lyrics unless clearly natural in the scene
- Prefer selective detail, believable phrasing, and lines that sound natural in a real song
- Let there be a human point of view: distance, hesitation, timing, silence, gesture, conversation, or the feeling between people and place
- Prefer a few strong details over many small details
- Keep the wording clean, modern, and memorable
- Write in the specified language
- Each section should have 2-6 lines
- Include dynamic variation between sections
- Make the hook, chorus, or central repeated line especially clear, satisfying, and musically repeatable

Think like a contemporary songwriter, not a poet, screenwriter, or sound designer.

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

Requirements:
- Write complete lyrics with Suno AI section tags
- Keep the lyrics aligned with the track's concept, but do not turn them into literal narration
- Actions and physical details may appear, but only if they support a believable scene, relationship, or emotional tension without sounding descriptive for their own sake
- Do not write like a poem, diary entry, screenplay, object checklist, field-recording memo, or production commentary
- Do not use production terms, arrangement terms, or technical sound descriptions as lyric material unless they sound natural in actual speech
- Prefer selective detail, believable phrasing, and lines that sound natural in a real song
- Use only a small number of concrete details, and make them carry atmosphere, tension, or perspective
- Let the lyrics feel human, restrained, and lived-in rather than concept-heavy
- Avoid generic emotional filler
- The chorus or central refrain should feel especially strong, natural to sing, and memorable without over-explaining the concept

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