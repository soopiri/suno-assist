package openai

import (
	"context"
	"fmt"
	"strings"

	goopenai "github.com/sashabaranov/go-openai"
)

type Client struct {
	apiKey string
	model  string
}

func NewClient(apiKey, model string) *Client {
	if model == "" {
		model = "gpt-5.4"
	}
	return &Client{apiKey: apiKey, model: model}
}

func (c *Client) UpdateConfig(apiKey, model string) {
	c.apiKey = apiKey
	if model != "" {
		c.model = model
	}
}

func (c *Client) ChatCompletion(ctx context.Context, systemPrompt, userPrompt string) (string, error) {
	if c.apiKey == "" {
		return "", fmt.Errorf("OpenAI API key is not configured")
	}

	client := goopenai.NewClient(c.apiKey)

	req := goopenai.ChatCompletionRequest{
		Model: c.model,
		Messages: []goopenai.ChatCompletionMessage{
			{Role: goopenai.ChatMessageRoleSystem, Content: systemPrompt},
			{Role: goopenai.ChatMessageRoleUser, Content: userPrompt},
		},
	}
	if !strings.HasPrefix(c.model, "gpt-5") {
		req.Temperature = 0.8
	}

	resp, err := client.CreateChatCompletion(ctx, req)
	if err != nil {
		return "", fmt.Errorf("OpenAI API error: %w", err)
	}

	if len(resp.Choices) == 0 {
		return "", fmt.Errorf("no response from OpenAI")
	}

	return resp.Choices[0].Message.Content, nil
}
