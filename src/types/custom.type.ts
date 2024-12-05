export {};

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
    interface Response {
      cookies: {
        rwdyUserAuthToken?: string;
        rwdyCartToken?: string;
      };
    }
  }
}
