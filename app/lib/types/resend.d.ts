declare module 'resend' {
  export interface ResendResponse {
    data: any;
    error: {
      message: string;
      name: string;
      statusCode: number;
    } | null;
  }

  export class Resend {
    constructor(apiKey: string);

    emails: {
      send(options: {
        from: string;
        to: string[];
        subject: string;
        text?: string;
        html?: string;
        cc?: string[];
        bcc?: string[];
        reply_to?: string;
        headers?: Record<string, string>;
      }): Promise<ResendResponse>;
    };
  }
} 