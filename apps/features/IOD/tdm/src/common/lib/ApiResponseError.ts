export class ApiResponseError extends Error {
  constructor(message: string, public type?: string) {
    super(message);
    this.name = 'ApiResponseError';
    Object.setPrototypeOf(this, new.target.prototype); // Restore prototype chain
  }
}

export interface ApiException {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string | null;
}
