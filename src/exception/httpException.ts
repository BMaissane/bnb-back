export class HttpException extends Error {
    constructor(
      public status: number,
      public message: string,
      public details?: any
    ) {
      super(message);
      Object.setPrototypeOf(this, HttpException.prototype);
    }
  }