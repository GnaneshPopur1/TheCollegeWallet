import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// Declare Plaid globally
declare var Plaid: any;

@Injectable({
  providedIn: 'root'
})
export class PlaidService {
  private apiUrl = `${environment.apiUrl}/plaid`;
  private linkHandler: any;

  constructor(private http: HttpClient) { }

  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  // 1. Fetch Link Token
  createLinkToken(): Observable<{ link_token: string }> {
    return this.http.post<{ link_token: string }>(`${this.apiUrl}/create_link_token`, {}, this.getHeaders())
      .pipe(catchError(this.handleError<{ link_token: string }>('createLinkToken')));
  }

  // 2. Exchange Public Token
  setAccessToken(publicToken: string, institutionName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/set_access_token`, { 
      public_token: publicToken,
      institution_name: institutionName
    }, this.getHeaders())
      .pipe(catchError(this.handleError('setAccessToken')));
  }

  // 3. Sync Data
  syncData(): Observable<any> {
    return this.http.post(`${this.apiUrl}/sync`, {}, this.getHeaders())
      .pipe(catchError(this.handleError('syncData')));
  }

  // Initialize and Open Plaid Link UI
  openLink(onSuccessCallback: () => void) {
    this.createLinkToken().subscribe(data => {
      if (!data || !data.link_token) {
        console.error("Failed to fetch link token");
        return;
      }

      this.linkHandler = Plaid.create({
        token: data.link_token,
        onSuccess: (public_token: string, metadata: any) => {
          // Send public_token to our backend
          this.setAccessToken(public_token, metadata.institution.name).subscribe(() => {
            // Once exchanged, sync the data
            this.syncData().subscribe(() => {
              onSuccessCallback();
            });
          });
        },
        onLoad: () => {},
        onExit: (err: any, metadata: any) => {
          if (err != null) {
            console.error("Plaid Link Exit Error:", err);
          }
        },
        onEvent: (eventName: string, metadata: any) => {
          // Optional: handle events like OPEN, EXIT, etc.
        }
      });

      this.linkHandler.open();
    });
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
