package generator

import (
	"context"
	"fmt"

	"suno-assist/internal/openai"
)

const imagePromptSystemPrompt = `You are an expert at creating detailed image generation prompts for album cover art.
Your task is to create a prompt suitable for Google Gemini's image generation.

Guidelines:
- Be visually descriptive and specific
- Include art style, color palette, composition, and mood
- Reference the album's musical themes in visual metaphors
- Specify "album cover art" format (square, centered composition)
- Include lighting, texture, and atmosphere details
- Avoid text in the image description (album title will be added separately)

Respond with ONLY the image generation prompt text. No explanations or metadata.`

func GenerateImagePrompt(ctx context.Context, client *openai.Client, concept AlbumConcept, tracks []Track) (*ImagePromptResult, error) {
	trackList := ""
	for _, t := range tracks {
		trackList += fmt.Sprintf("  %d. \"%s\" (%s, %s)\n", t.Number, t.Title, t.Genre, t.Mood)
	}

	userPrompt := fmt.Sprintf(`Create an album cover art image generation prompt for Google Gemini:

Album Title: %s
Genre: %s
Overall Mood: %s
Description: %s

Tracklist:
%s

Create a detailed, visually rich prompt that captures the essence of this album.
The prompt should work well with Gemini's image generation capabilities.`,
		concept.Title, concept.Genre, concept.Mood, concept.Description, trackList)

	resp, err := client.ChatCompletion(ctx, imagePromptSystemPrompt, userPrompt)
	if err != nil {
		return nil, err
	}

	return &ImagePromptResult{Prompt: resp}, nil
}
