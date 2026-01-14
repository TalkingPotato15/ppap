declare module "google-trends-api" {
  interface DailyTrendsOptions {
    trendDate?: Date;
    geo?: string;
    category?: number;
  }

  interface InterestOverTimeOptions {
    keyword: string | string[];
    startTime?: Date;
    endTime?: Date;
    geo?: string;
    category?: number;
  }

  interface RelatedQueriesOptions {
    keyword: string | string[];
    startTime?: Date;
    endTime?: Date;
    geo?: string;
    category?: number;
  }

  export function dailyTrends(options: DailyTrendsOptions): Promise<string>;
  export function interestOverTime(
    options: InterestOverTimeOptions
  ): Promise<string>;
  export function relatedQueries(
    options: RelatedQueriesOptions
  ): Promise<string>;
  export function interestByRegion(
    options: InterestOverTimeOptions
  ): Promise<string>;
  export function relatedTopics(
    options: RelatedQueriesOptions
  ): Promise<string>;
}
