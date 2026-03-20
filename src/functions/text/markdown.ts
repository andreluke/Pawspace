export function parseMarkdown(text: string): string {
	text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
	text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");
	return text;
}
