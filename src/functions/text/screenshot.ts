import type {
  GenerateTweetHTMLParams,
  TakeScreenshotParams
} from "#types";
import puppeteer from "puppeteer";
import { filterContent, removeSymbol } from "./content-filter.js";
import { parseMarkdown } from "./markdown.js";
import { parseUsername } from "./username-parser.js";

export type { ScreenshotMessageData, TakeScreenshotOptions } from "#types";

async function generateTweetHTML(params: GenerateTweetHTMLParams): Promise<string> {
	const {
		currentUserName,
		currentMessage,
		currentProfileImageUrl,
		currentImageUrl,
		previousUserName,
		previousMessage,
		previousProfileImageUrl,
		previousImageUrl,
		options = {},
	} = params;

	const { isPrivateQuote = false, isPreviousVerified = false, isCurrentVerified = false } = options;

	const currentParsed = parseUsername(currentUserName);
	const previousParsed = parseUsername(previousUserName);

	const currentDisplayName = currentParsed.displayName.normalize("NFKD");
	const currentUsername = currentParsed.username.normalize("NFKD");
	const previousDisplayName = previousParsed.displayName.normalize("NFKD");
	const previousUsername = previousParsed.username.normalize("NFKD");

  const verifiedSVG = `
<svg class="verified-badge" viewBox="0 0 24 24" fill="#1DA1F2" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 2l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.2 19.9l1.1-6.5L2.6 8.8l6.5-.9L12 2z"/>
</svg>
`;

  const currentVerifiedBadge = isCurrentVerified ? verifiedSVG : "";
  const previousVerifiedBadge = isPreviousVerified ? verifiedSVG : "";

  const css = `
  body {
    font-family: Arial, sans-serif;
    padding: 20px;
    background-color: #15202b;
    color: #ffffff;
    display: flex;
    align-items: center;
  }
  .tweet-container {
    width: 600px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #38444d;
    border-radius: 10px;
    background-color: #192734;
  }
  .tweet-header {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }
  .avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    margin-right: 10px;
    background-color: #657786;
    background-size: cover;
    background-position: center;
  }
  .tweet-content {
    font-size: 18px;
    line-height: 1.5;
    margin-bottom: 10px;
  }
  .tweet-footer {
    display: flex;
    justify-content: space-between;
    color: #8899a6;
  }
.verified-badge {
  width: 80px;
  height: 80px;
  margin-top: -2px;
  flex-shrink: 0;
}
  .tweet-image {
    margin-top: 10px;
    margin-bottom: 10px;
    width: 100%;
    height: auto;
    border-radius: 10px;
  }
  .quote-container {
    margin-top: 15px;
    padding: 15px;
    border: 1px solid #38444d;
    border-radius: 10px;
    background-color: #253341;
    margin-bottom: 10px;
  }
  .quote-header {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }
  .quote-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-right: 10px;
    background-color: #657786;
    background-size: cover;
    background-position: center;
  }
  .quote-content {
    font-size: 16px;
  }
  .user-info {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .user-name {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  .username {
    font-size: 14px;
    color: #8899a6;
  }
  .private {
    font-size: 25px;
    color: yellow;
    margin-left: 8px;
  }

.verified-badge {
  width: 16px;
  height: 16px;
  object-fit: contain;
  display: inline-block;
}
  `;

  const privateIcon = isPrivateQuote ? '<span class="private">°</span>' : "";

  const currentImageHTML = currentImageUrl
    ? `<img class="tweet-image" src="${currentImageUrl}" alt="Imagem da mensagem atual" />`
    : "";

  const previousImageHTML = previousImageUrl
    ? `<img class="tweet-image" src="${previousImageUrl}" alt="Imagem da mensagem citada" />`
    : "";

  return `
    <html>
      <head>
        <style>${css}</style>
      </head>
      <body>
        <div class="tweet-container">
          <div class="tweet-header">
            <div class="avatar" style="background-image: url('${currentProfileImageUrl}');"></div>
            <div class="user-info">
              <div class="user-name">
                <span class="name">${currentDisplayName}${currentVerifiedBadge}</span>
                <span class="username">@${currentUsername}</span>
              </div>
              ${privateIcon}
            </div>
          </div>
          <div class="tweet-content">${currentMessage}</div>
          ${currentImageHTML}
          <div class="quote-container">
            <div class="quote-header">
              <div class="quote-avatar" style="background-image: url('${previousProfileImageUrl}');"></div>
              <div class="user-info">
                <div class="user-name">
                  <span class="name">${previousDisplayName}${previousVerifiedBadge}</span>
                  <span class="username">@${previousUsername}</span>
                </div>
              </div>
            </div>
            <div class="quote-content">${previousMessage}</div>
            ${previousImageHTML}
          </div>
          <div class="tweet-footer">
            <span>${new Date().toLocaleTimeString()} · ${new Date().toLocaleDateString()}</span>
            <span>Pawspace Web App</span>
          </div>
        </div>
      </body>
    </html>
  `;
}

export async function takeScreenshot(
	params: TakeScreenshotParams,
): Promise<string> {
	const { previousData, currentData, options = {} } = params;

	let browser;

	try {
		browser = await puppeteer.launch({
			args: ["--no-sandbox", "--disable-setuid-sandbox"],
		});

		const page = await browser.newPage();

		const processedPreviousMessage = parseMarkdown(
			filterContent(removeSymbol(previousData.content || "")),
		);
		const processedCurrentMessage = parseMarkdown(
			filterContent(removeSymbol(currentData.content || "")),
		);

		await page.setViewport({
			width: 600,
			height: 400,
		});

		const htmlContent = await generateTweetHTML({
			currentUserName: currentData.authorName,
			currentMessage: processedCurrentMessage,
			currentProfileImageUrl: currentData.authorAvatarUrl,
			currentImageUrl: currentData.imageUrl || null,
			previousUserName: previousData.authorName,
			previousMessage: processedPreviousMessage,
			previousProfileImageUrl: previousData.authorAvatarUrl,
			previousImageUrl: previousData.imageUrl || null,
			options,
		});

    await page.setContent(htmlContent);

    const screenshotPath = `screenshot-${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });

    return screenshotPath;
  } catch (error) {
    console.error("Erro ao tirar screenshot:", error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
