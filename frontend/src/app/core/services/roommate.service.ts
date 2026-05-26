import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface RoommateLedger {
  totalIOwe: number;
  totalOwedToMe: number;
  netBalance: number;
}

export interface ExpenseSplit {
  split_id: string;
  expense_id: string;
  owed_by_user_id: string;
  amount_owed: number;
  is_settled: boolean;
  expense?: SharedExpense;
  ower?: { email: string };
}

export interface SharedExpense {
  expense_id: string;
  group_id: string;
  paid_by_user_id: string;
  amount: number;
  description: string;
  date: string;
  payer?: { email: string };
  Splits?: ExpenseSplit[];
}

export interface GroupData {
  group: any;
  ledger: RoommateLedger;
  splitsOwedByMe: ExpenseSplit[];
  splitsOwedToMe: ExpenseSplit[];
}

@Injectable({
  providedIn: 'root'
})
export class RoommateService {
  private apiUrl = `${environment.apiUrl}/roommates`;

  constructor(private http: HttpClient) { }

  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  getGroupData(): Observable<GroupData> {
    return this.http.get<GroupData>(`${this.apiUrl}/group`, this.getHeaders())
      .pipe(catchError(this.handleError<GroupData>('getGroupData')));
  }

  getRecentExpenses(): Observable<SharedExpense[]> {
    return this.http.get<SharedExpense[]>(`${this.apiUrl}/expenses`, this.getHeaders())
      .pipe(catchError(this.handleError<SharedExpense[]>('getRecentExpenses', [])));
  }

  addExpense(amount: number, description: string): Observable<SharedExpense> {
    return this.http.post<SharedExpense>(`${this.apiUrl}/expenses`, { amount, description }, this.getHeaders())
      .pipe(catchError(this.handleError<SharedExpense>('addExpense')));
  }

  settleSplit(splitId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/splits/${splitId}/settle`, {}, this.getHeaders())
      .pipe(catchError(this.handleError('settleSplit')));
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
