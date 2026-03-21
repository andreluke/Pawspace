function filterContent(text) {
  return text.replace(/<[^>]+>/g, "");
}
function removeSymbol(text) {
  const unsupportedEmojis = /[\u{1FA96}-\u{1FA9F}\u{1F6E1}\u{25A1}]/gu;
  return text.replace(unsupportedEmojis, "");
}
function cleanText(text) {
  return filterContent(removeSymbol(text));
}
export {
  cleanText,
  filterContent,
  removeSymbol
};
