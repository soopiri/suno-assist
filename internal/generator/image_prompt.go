package generator

import (
	"context"
	"fmt"

	"suno-assist/internal/openai"
)

const imagePromptSystemPrompt = `You are an expert art director creating prompts for album cover images.

Your goal is to produce modern, tasteful, non-AI-looking album cover concepts suitable for image generation.
The image should be built around one clear focal subject or scene.

Guidelines:
- Focus on strong visual concepts rather than excessive detail
- Prefer photography, graphic design, collage, or mixed media styles
- Avoid generic AI-art aesthetics and fantasy illustration unless clearly appropriate
- Translate the album concept into a clear visual scene or graphic motif
- Use modern album cover, editorial, or fashion photography inspiration
- Use square album cover composition with strong graphic layout
- Include lighting, color palette, and texture direction
- Avoid text in the image description (album title will be added separately)
- Draw inspiration from modern album artwork, fashion editorials, indie graphic design, and contemporary photography.
- Avoid overly complex scenes with many elements. Prefer simple, bold compositions.
- Think like a contemporary album art director rather than an illustrator.
- Avoid combining too many metaphors or symbolic elements in one image.

No text, typography, letters, logos, captions, or watermarks anywhere in the image.
The image must contain only visual elements with no written characters.

Respond with ONLY the image generation prompt text. No explanations or metadata.`

func GenerateImagePrompt(ctx context.Context, client *openai.Client, concept AlbumConcept, tracks []Track) (*ImagePromptResult, error) {
	trackList := ""
	for _, t := range tracks {
		trackList += fmt.Sprintf("  %d. \"%s\" (%s, %s)\n", t.Number, t.Title, t.Genre, t.Vibe)
	}

	userPrompt := fmt.Sprintf(`Create an album cover art image generation prompt for Google Gemini:

Album Title: %s
Genre: %s
Overall Vibe: %s
Description: %s

Tracklist:
%s

Create a modern album cover concept prompt that feels stylish, minimal, and visually striking.
The prompt should work well with Gemini's image generation capabilities.`,
		concept.Title, concept.Genre, concept.Vibe, concept.Description, trackList)

	resp, err := client.ChatCompletion(ctx, imagePromptSystemPrompt, userPrompt)
	if err != nil {
		return nil, err
	}

	return &ImagePromptResult{Prompt: resp}, nil
}
