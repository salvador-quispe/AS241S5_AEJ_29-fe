export interface EmailRequest {
  email: string;
}

export interface EmailResponse {
  id: number;
  requestUuid: string;
  email: string;
  active: boolean;
  result: 'processing' | 'valid' | 'invalid' | 'error';
  valid: boolean;
  reason: string;
  createdAt: string;
}
