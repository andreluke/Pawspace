export function filterContent(text: string): string {
	return text.replace(/<[^>]+>/g, "");
}

export function removeSymbol(text: string): string {
	const unsupportedEmojis = /[\u{1FA96}-\u{1FA9F}\u{1F6E1}\u{25A1}]/gu;
	return text.replace(unsupportedEmojis, "");
}

export function cleanText(text: string): string {
	return filterContent(removeSymbol(text));
}
