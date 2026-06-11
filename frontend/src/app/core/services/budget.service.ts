import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Budget {
  budget_id: string;
  period: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'SEMI_ANNUAL';
  amount_limit: number;
  current_spent: number;
  period_start: string;
}

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private apiUrl = `${environment.apiUrl}/budgets`;

  constructor(private http: HttpClient) { }

  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  getBudgets(): Observable<Budget[]> {
    return this.http.get<Budget[]>(this.apiUrl, this.getHeaders())
      .pipe(catchError(this.handleError<Budget[]>('getBudgets', [])));
  }

  createBudget(period: string, amount_limit: number): Observable<Budget> {
    return this.http.post<Budget>(this.apiUrl, { period, amount_limit }, this.getHeaders())
      .pipe(catchError(this.handleError<Budget>('createBudget')));
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
