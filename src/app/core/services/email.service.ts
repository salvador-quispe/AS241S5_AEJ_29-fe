import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EmailRequest, EmailResponse } from '../models/email.model';

@Injectable({ providedIn: 'root' })
export class EmailService {
  private readonly http = inject(HttpClient);
  private readonly BASE = '/api/email';

  verify(data: EmailRequest): Observable<EmailResponse> {
    return this.http.post<EmailResponse>(`${this.BASE}/verify`, data);
  }

  getHistory(): Observable<EmailResponse[]> {
    return this.http.get<EmailResponse[]>(`${this.BASE}/history`);
  }

  getDeleted(): Observable<EmailResponse[]> {
    return this.http.get<EmailResponse[]>(`${this.BASE}/deleted`);
  }

  update(id: number, data: EmailRequest): Observable<EmailResponse> {
    return this.http.put<EmailResponse>(`${this.BASE}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/${id}`);
  }

  restore(id: number): Observable<EmailResponse> {
    return this.http.patch<EmailResponse>(`${this.BASE}/${id}/restore`, {});
  }
}
