import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import Page from '../../models/PageModel/page';
import UserResponse from '../../models/Users/userResponse';
import ProfileResponse from '../../models/Users/profileResponse';
import UpdateProfileRequest from '../../models/Users/updateProfileRequest';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  private profileSubject = new BehaviorSubject<ProfileResponse | null>(null);
  public profile$ = this.profileSubject.asObservable();

  constructor(private http: HttpClient) {}

  getAllUsers(page: number = 0, size: number = 20): Observable<Page<UserResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<UserResponse>>(this.apiUrl, { params });
  }

  getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${this.apiUrl}/profile`);
  }

  loadProfile() {
    this.getProfile().subscribe({
      next: (profile) => this.profileSubject.next(profile),
      error: () => this.profileSubject.next(null)
    });
  }

  updateProfile(request: UpdateProfileRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(this.apiUrl, request);
  }

  getById(id: string): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/${id}`);
  }

  updateUser(id: string, updates: Map<string, any>): Observable<string> {
    return this.http.patch<string>(`${this.apiUrl}/${id}`, Object.fromEntries(updates), {
      responseType: 'text' as 'json',
    });
  }
}
