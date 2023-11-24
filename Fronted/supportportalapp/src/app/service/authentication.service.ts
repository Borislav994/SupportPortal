import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  
  private host = environment.apiUrl;

  constructor(private http: HttpClient) { }

  public login(user: User): Observable<HttpResponse<any> | HttpErrorResponse> {
    return this.http.post<HttpResponse<any> | HttpErrorResponse>(`${this.host}/user/login`, user, {observe: 'response'});
  }
}
