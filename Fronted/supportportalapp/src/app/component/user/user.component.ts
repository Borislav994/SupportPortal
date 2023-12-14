import { Component, OnInit, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { User } from 'src/app/model/user';
import { UserService } from 'src/app/service/user.service';
import { NotificationService } from 'src/app/service/notification.service';
import { NotificationType } from 'src/app/enum/notification-type.enum';
import { HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { CustomHttpResponse } from 'src/app/model/custom-http-response';
import { AuthenticationService } from 'src/app/service/authentication.service';
import { Router } from '@angular/router';
import { FileUploadStatus } from 'src/app/model/file-upload.status';
import { Role } from 'src/app/enum/role.enum';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit, OnDestroy {
  private titleSubject = new BehaviorSubject<string>('Users');
  public titleAction$ = this.titleSubject.asObservable();
  public users: User[] | null;
  public user: User | null;
  public refreshing: boolean;
  public selectedUser: User;
  public fileName: string;
  public profileImage: File | null = null;
  private subscriptions: Subscription[] = [];
  public editUser = new User();
  private currentUsername: string;
  public fileStatus = new FileUploadStatus();

  constructor(private router: Router, private authenticationService: AuthenticationService,
    private userService: UserService, private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.user = this.authenticationService.getUserFromLocalCache();
    this.getUsers(true);
  }

  public changeTitle(title: string): void {
    this.titleSubject.next(title);
  }

  public getUsers(showNotification: boolean): void {
    this.refreshing = true;
    this.subscriptions.push(
      this.userService.getUsers().subscribe(
        (response: User[]) => {
          this.userService.addUserToLocalCache(response);
          this.users = response;
          this.refreshing = false;
          if (showNotification) {
            this.sendNotification(NotificationType.SUCCESS, `${response.length} user(s) loaded successfully.`);
          }
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
          this.refreshing = false;
        }
      )
    );

  }

  public onSelectUser(selectedUser: User): void {
    this.selectedUser = selectedUser;
    this.clickButton('openUserInfo');
  }

  onProfileImageChange(event: any): void {
    const inputElement = event.target as HTMLInputElement;
    const file = (inputElement.files && inputElement.files.length > 0) ? inputElement.files[0] : null;
  
    if (file) {
      this.fileName = file.name;
      this.profileImage = file;
    } else {
      console.error("Nije izabran validan fajl.");
    }
  }

  onUpdateProfileImage(): void {
    const formData = new FormData();
    formData.append('username', this.user?.username || ''); 
    if (this.profileImage) {
      formData.append('profileImage', this.profileImage);
    }
  
    this.subscriptions.push(
      this.userService.updateProfileImage(formData).subscribe(
        (event: HttpEvent<any>) => {
          this.reportUploadProgress(event);
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
          this.fileStatus.status = 'done';
        }
      )
    );
  }

  public saveNewUser(): void {
    this.clickButton('new-user-save');
  }

  public onAddNewUser(userForm: NgForm): void {
    
      const formData = this.userService.createUserFormDate('', userForm.value, this.profileImage);
      this.subscriptions.push(
        this.userService.addUser(formData).subscribe(
          (response: User) => {
            this.clickButton('new-user-close');
            this.getUsers(false);
            this.fileName = '';
            this.profileImage = null;
            userForm.reset();
            this.sendNotification(NotificationType.SUCCESS, `${response.firstName} ${response.lastName} added successfully`);
          },
          (errorResponse: HttpErrorResponse) => {
            this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
            this.profileImage = null;
          }
        )
      );
  
    
  }

  public onUpdateUser(): void {
    
      const formData = this.userService.createUserFormDate(this.currentUsername, this.editUser, this.profileImage);
      this.subscriptions.push(
        this.userService.updateUser(formData).subscribe(
          (response: User) => {
            this.clickButton('closeEditUserModalButton');
            this.getUsers(false);
            this.fileName = '';
            this.profileImage = null;
            this.sendNotification(NotificationType.SUCCESS, `${response.firstName} ${response.lastName} updated successfully`);
          },
          (errorResponse: HttpErrorResponse) => {
            this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
            this.profileImage = null;
          }
        )
      );
    
  }
  
  public onUpdateCurrentUser(user: User): void {
    this.refreshing = true;
    
    const userFromCache = this.authenticationService.getUserFromLocalCache();
    this.currentUsername = userFromCache ? userFromCache.username : '';
  
      const formData = this.userService.createUserFormDate(this.currentUsername, user, this.profileImage);
      this.subscriptions.push(
        this.userService.updateUser(formData).subscribe(
          (response: User) => {
            this.authenticationService.addUserToLocalCache(response);
            this.getUsers(false);
            this.fileName = '';
            this.profileImage = null;
            this.sendNotification(NotificationType.SUCCESS, `${response.firstName} ${response.lastName} updated successfully`);
            this.refreshing = false;
          },
          (errorResponse: HttpErrorResponse) => {
            this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
            this.refreshing = false;
            this.profileImage = null;
          }
        )
      );
  }
  
  private reportUploadProgress(event: HttpEvent<any>): void {
    switch (event.type) {
      case HttpEventType.UploadProgress:
        if (event.total !== undefined) {
          this.fileStatus.percentage = Math.round(100 * event.loaded / event.total);
          this.fileStatus.status = 'progress';
        }
        break;
      case HttpEventType.Response:
        if (event.status === 200) {
          if (this.user && this.user.profileImageUrl && event.body && event.body.profileImageUrl) {
            this.user.profileImageUrl = `${event.body.profileImageUrl}?time=${new Date().getTime()}`;
            this.sendNotification(NotificationType.SUCCESS, `${event.body.firstName}'s profile image updated successfully`);
            this.fileStatus.status = 'done';
          } else {
            this.sendNotification(NotificationType.ERROR, `Invalid user or response format. Please try again`);
          }
        } else {
          this.sendNotification(NotificationType.ERROR, `Unable to upload image. Please try again`);
        }
        break;
      default:
        console.log(`Finished all processes`);
    }
  }
  

  public updateProfileImage(): void {
    this.clickButton('profile-image-input');
  }

  public onLogOut(): void {
    this.authenticationService.logOut();
    this.router.navigate(['/login']);
    this.sendNotification(NotificationType.SUCCESS, `You've been successfully logged out`);
  }

  public onResetPassword(emailForm: NgForm): void {
    this.refreshing = true;
    const emailAddress = emailForm.value['reset-password-email'];
    this.subscriptions.push(
      this.userService.resetPassword(emailAddress).subscribe(
        (response: CustomHttpResponse) => {
          this.sendNotification(NotificationType.SUCCESS, response.message);
          this.refreshing = false;
        },
        (error: HttpErrorResponse) => {
          this.sendNotification(NotificationType.WARNING, error.error.message);
          this.refreshing = false;
        },
        () => emailForm.reset()
      )
    );
  }

  public onDeleteUder(userId: string): void {
    this.subscriptions.push(
      this.userService.deleteUser(userId).subscribe(
        (response: CustomHttpResponse) => {
          this.sendNotification(NotificationType.SUCCESS, response.message);
          this.getUsers(false);
        },
        (error: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, error.error.message);
        }
      )
    );
  }

  public onEditUser(editUser: User): void {
    this.editUser = editUser;
    this.currentUsername = editUser.username;
    this.clickButton('openUserEdit');
  }

  public searchUsers(searchTerm: string): void {
    const results: User[] = [];
    const usersFromCache = this.userService.getUsersFromLocalCache();
  
    if (usersFromCache) {
      for (const user of usersFromCache) {
        if (
          user.firstName.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
          user.lastName.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
          user.username.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
          user.userId.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1
        ) {
          results.push(user);
        }
      }
    }
  
    this.users = results;
  
    if (results.length === 0 || !searchTerm) {
      this.users = usersFromCache || [];
    }
  }
  

  public get isAdmin(): boolean {
    return this.getUserRole() === Role.ADMIN || this.getUserRole() === Role.SUPER_ADMIN;
  }

  public get isManager(): boolean {
    return this.isAdmin || this.getUserRole() === Role.MANAGER;
  }

  public get isAdminOrManager(): boolean {
    return this.isAdmin || this.isManager;
  }

  private getUserRole(): string {
    const user = this.authenticationService.getUserFromLocalCache();
    return user ? user.role : '';
  }
  

  private sendNotification(notificationType: NotificationType, message: string): void {
    if (message) {
      this.notificationService.notify(notificationType, message);
    } else {
      this.notificationService.notify(notificationType, 'An error occurred. Please try again.');
    }
  }

  private clickButton(buttonId: string): void {
    document.getElementById(buttonId)?.click();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}