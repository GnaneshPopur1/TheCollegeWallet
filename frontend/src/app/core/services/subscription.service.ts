import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface AppSubscription {
  subscription_id: string;
  merchant_name: string;
  amount: number;
  status: 'ACTIVE' | 'CANCELLED';
  date_found: string;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private apiUrl = `${environment.apiUrl}/subscriptions`;

  constructor(private http: HttpClient) { }

  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  getSubscriptions(): Observable<AppSubscription[]> {
    return this.http.get<AppSubscription[]>(this.apiUrl, this.getHeaders())
      .pipe(catchError(this.handleError<AppSubscription[]>('getSubscriptions', [])));
  }

  scanFootprint(): Observable<{ message: string, subscriptions: AppSubscription[] }> {
    return this.http.post<{ message: string, subscriptions: AppSubscription[] }>(`${this.apiUrl}/scan-footprint`, {}, this.getHeaders())
      .pipe(catchError(this.handleError<{ message: string, subscriptions: AppSubscription[] }>('scanFootprint')));
  }

  cancelSubscription(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/cancel`, {}, this.getHeaders())
      .pipe(catchError(this.handleError('cancelSubscription')));
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
