declare module "google-trends-api" {
  interface TrendsOptions {
    geo?: string;
    hl?: string;
    timezone?: number;
    category?: number;
  }

  interface InterestOverTimeOptions extends TrendsOptions {
    keyword: string | string[];
    startTime?: Date;
    endTime?: Date;
  }

  export function dailyTrends(options?: TrendsOptions): Promise<string>;
  export function realTimeTrends(options?: TrendsOptions): Promise<string>;
  export function interestOverTime(options: InterestOverTimeOptions): Promise<string>;
  export function interestByRegion(options: InterestOverTimeOptions): Promise<string>;
  export function relatedQueries(options: InterestOverTimeOptions): Promise<string>;
  export function relatedTopics(options: InterestOverTimeOptions): Promise<string>;

  const googleTrends: {
    dailyTrends: typeof dailyTrends;
    realTimeTrends: typeof realTimeTrends;
    interestOverTime: typeof interestOverTime;
    interestByRegion: typeof interestByRegion;
    relatedQueries: typeof relatedQueries;
    relatedTopics: typeof relatedTopics;
  };

  export default googleTrends;
}
