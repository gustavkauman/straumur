export type Feed = {
  id: number;
  name: string;
  url: string;
  favicon_url?: string;
}

export type Article = {
  id: number;
  feed_id: number;
  title: string;
  url: string,
  feed_guid?: string;
  author?: string;
  published_at: Date;
}

export type ArticleWithAdditionalData = Article & { feed_name: string, favicon_url: string };

