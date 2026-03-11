package generator

type AlbumInput struct {
	Idea       string `json:"idea"`
	TrackCount int    `json:"trackCount"`
	Language   string `json:"language"`
}

type AlbumConcept struct {
	Idea        string `json:"idea"`
	Title       string `json:"title"`
	Genre       string `json:"genre"`
	Vibe        string `json:"vibe"`
	TrackCount  int    `json:"trackCount"`
	Description string `json:"description"`
	Language    string `json:"language"`
}

type Track struct {
	Number int    `json:"number"`
	Title  string `json:"title"`
	Genre  string `json:"genre"`
	Vibe   string `json:"vibe"`
	BPM    string `json:"bpm"`
	Key    string `json:"key"`
	Notes  string `json:"notes"`
}

type SetlistResult struct {
	AlbumTitle string  `json:"albumTitle"`
	Tracks     []Track `json:"tracks"`
}

type LyricsResult struct {
	TrackNumber int    `json:"trackNumber"`
	TrackTitle  string `json:"trackTitle"`
	Lyrics      string `json:"lyrics"`
}

type SunoPromptResult struct {
	TrackNumber int    `json:"trackNumber"`
	TrackTitle  string `json:"trackTitle"`
	StylePrompt string `json:"stylePrompt"`
}

type ImagePromptResult struct {
	Prompt string `json:"prompt"`
}
