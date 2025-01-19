export type RssFeedItem = {
    /**
     * The title of the item.
     */
    title?: string;
    /**
     * The URL of the item.
     */
    link?: string;
    /**
     * The item synopsis.
     */
    description?: string;
    /**
     * Email address of the author of the item.
     * See more at: https://www.rssboard.org/rss-specification#ltauthorgtSubelementOfLtitemgt
     */
    author?: string;
    /**
     * Includes the item in one or more categories.
     * See more at: https://www.rssboard.org/rss-specification#ltcategorygtSubelementOfLtitemgt
     */
    categories?: string[]
    /**
     * Indicates when the item was published.
     */
    pubDate?: string;
    /**
     * URL of a page for comments relating to the item.
     * See more at: https://www.rssboard.org/rss-specification#ltcommentsgtSubelementOfLtitemgt
     */
    comments?: string;
    /**
     * A string that uniquely identifies the item.
     * See more at: https://www.rssboard.org/rss-specification#ltguidgtSubelementOfLtitemgt
     */
    guid?: string;
    /**
     * Describes a media object that is attached to the item.
     * See more at: https://www.rssboard.org/rss-specification#ltenclosuregtSubelementOfLtitemgt
     */
    enclosure?: string;
};

export type RssFeed = {
    /**
     * The name of the channel. It's how people refer to your service. If you
     * have an HTML website that contains the same information as your RSS file,
     * the title of your channel should be the same as the title of your website.
     */
    title: string;

    /**
     * The URL to the HTML website corresponding to the channel.
     */
    link: string;

    /**
     * Phrase or sentence describing the channel.
     */
    description: string;

    // TODO: many more fields.
    
    /**
     * The items in the feed, if fetched.
     */
    items?: RssFeedItem[];
};

