import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface Issue {
  id: number;
  motorcycle_id: number;
  description: string;
  issue_type: string;
  date_reported: string;
  status: string;
}

export interface IssueCreatePayload {
  motorcycle_id: number | string;
  description: string;
  issue_type: string;
  date_reported: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class IssueService {
  private http = inject(HttpClient);
  private base = `${environment.apiBase}/issues`;

  getAll(): Observable<Issue[]> {
    return this.http.get<Issue[]>(this.base);
  }

  create(payload: IssueCreatePayload): Observable<Issue> {
    return this.http.post<Issue>(this.base, payload);
  }

  updateStatus(id: number, status: string): Observable<Issue> {
    return this.http.patch<Issue>(`${this.base}/${id}`, { status });
  }
}
