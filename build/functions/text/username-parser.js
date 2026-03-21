function parseUsername(displayName) {
  const match = displayName.match(/^(.+?)\s*-\s*@(.+)$/);
  if (match) {
    return {
      displayName: match[1].trim(),
      username: match[2].trim()
    };
  }
  return {
    displayName,
    username: displayName
  };
}
export {
  parseUsername
};
