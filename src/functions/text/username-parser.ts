export function parseUsername(displayName: string): { displayName: string; username: string } {
	const match = displayName.match(/^(.+?)\s*-\s*@(.+)$/);
	
	if (match) {
		return {
			displayName: match[1].trim(),
			username: match[2].trim(),
		};
	}
	
	return {
		displayName: displayName,
		username: displayName,
	};
}
