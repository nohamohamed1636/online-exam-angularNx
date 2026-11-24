

export interface SendEmailVerificationRequest {
  email: string;
}

export interface SendEmailVerificationResponse {
  status: boolean;
  code: number;
  message: string;
}


export interface ConfirmEmailVerificationRequest {
  email: string;
  code: string;
}

export interface ConfirmEmailVerificationResponse {
  status: boolean;
  code: number;
  message: string;
}
