import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ChatMessage {
  message_id: string;
  group_id: string;
  user_id: string;
  text: string;
  created_at: string;
  user: { email: string };
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/chat`;

  constructor(private http: HttpClient) { }

  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  getMessages(groupId: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/${groupId}`, this.getHeaders())
      .pipe(catchError(this.handleError<ChatMessage[]>('getMessages', [])));
  }

  sendMessage(groupId: string, text: string): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(`${this.apiUrl}/${groupId}`, { text }, this.getHeaders())
      .pipe(catchError(this.handleError<ChatMessage>('sendMessage')));
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
