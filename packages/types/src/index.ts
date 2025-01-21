export type Feed = {
  id: string;
  name: string;
  favicon_url: string;
}

export type Article = {
  id: string;
  feed_id: string;
  title: string;
  url: string,
  author: string;
  published_at: Date;
}

