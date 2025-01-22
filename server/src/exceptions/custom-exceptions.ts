export class AnalyticsError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'AnalyticsError';
  }
}

export class DataFetchError extends Error {
  constructor(message: string, public readonly entity: string) {
    super(message);
    this.name = 'DataFetchError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public readonly field: string) {
    super(message);
    this.name = 'ValidationError';
  }
} 