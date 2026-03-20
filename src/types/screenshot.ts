import { NewsChannel, TextChannel } from "discord.js";

export interface ScreenshotMessageData {
	authorName: string;
	authorAvatarUrl: string;
	content: string;
	imageUrl?: string | null;
}

export interface TakeScreenshotOptions {
	isPrivateQuote?: boolean;
	isPreviousVerified?: boolean;
	isCurrentVerified?: boolean;
}

export interface TakeScreenshotParams {
	previousData: ScreenshotMessageData;
	currentData: ScreenshotMessageData;
	options?: TakeScreenshotOptions;
}

export interface GenerateTweetHTMLParams {
	currentUserName: string;
	currentMessage: string;
	currentProfileImageUrl: string;
	currentImageUrl: string | null;
	previousUserName: string;
	previousMessage: string;
	previousProfileImageUrl: string;
	previousImageUrl: string | null;
	options?: TakeScreenshotOptions;
}

export interface ScreenshotData {
	previousMessage: string;
	previousUserName: string;
	currentMessage: string;
	currentUserName: string;
	previousImageUrl: string | null;
	previousProfileImageUrl: string;
	currentImageUrl: string | null;
	currentProfileImageUrl: string;
	isPrivateQuote?: boolean;
}

export interface SendScreenshotParams {
	targetChannel: TextChannel | NewsChannel;
	screenshotData: ScreenshotData;
	guildId?: string;
}
