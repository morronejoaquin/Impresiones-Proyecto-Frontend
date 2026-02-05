import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import Page from '../../models/PageModel/page';
import UserResponse from '../../models/Users/userResponse';
import ProfileResponse from '../../models/Users/profileResponse';
import UpdateProfileRequest from '../../models/Users/updateProfileRequest';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;
  
  constructor(private http: HttpClient){
  }
  
  getAllUsers(page: number = 0, size: number = 20): Observable<Page<UserResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<UserResponse>>(this.apiUrl, { params });
  }

  getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${this.apiUrl}/profile`);
  }

  updateProfile(request: UpdateProfileRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(this.apiUrl, request);
  }
  
}
