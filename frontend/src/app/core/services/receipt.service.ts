import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ReceiptItem {
  name: string;
  price: number;
}

export interface ScanResult {
  storeName: string;
  date: string;
  items: ReceiptItem[];
  tax: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReceiptService {
  private apiUrl = `${environment.apiUrl}/receipts`;

  constructor(private http: HttpClient) { }

  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  scanReceipt(file: File): Observable<ScanResult> {
    const formData = new FormData();
    formData.append('receipt', file);

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.post<{data: ScanResult}>(`${this.apiUrl}/scan`, formData, { headers })
      .pipe(
        map(response => response.data),
        catchError(this.handleError<ScanResult>('scanReceipt'))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
