import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { finalize } from 'rxjs/operators';
import { EsfProfileClient, EsfUserProfileDto, FileParameter, ISetCredentialCommand, RoleType, SetCredentialCommand, SignProcessClient } from 'src/app/api/GCPClient';
import { ROLES } from '../../model/lists/Roles';
import { NotificationService } from '../../services/notification.service';
import { UserService } from '../../services/user.service';
import { AccessControlList } from 'src/app/model/entities/AccessControlList';
import { RoleAccessService } from 'src/app/shared/services/role-access.service';
import { AuthTicketStatusMenuService } from 'src/app/services/auth-ticket-status-menu.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
    standalone: false
})

export class ProfileComponent implements OnInit {
  isLoadingProfile = true;

  user = { name: '', roles: [] };
  login = { value: '', saving: false, completed: false };
  password = { value: '', saving: false, completed: false };
  authCertificate = { file: null, password: '', renewing: false, saving: false, completed: false };
  signCertificate = { file: null, password: '', renewing: false, saving: false, completed: false };
  gostCertificate = { file: null, password: '', renewing: false, saving: false, completed: false };
  testingConnection = false;
  isGostCertificate = false;
  isSubmitButtonDisabled = false;
  public hasAccessToManageCertificates: boolean = false;
  
  public profileAccessControlList: Map<string, RoleType[]> = AccessControlList.profile;
  private authMenuSubscription: Subscription;

  constructor(
    private titleService: Title,
    private esfProfileApi: EsfProfileClient,
    private userService: UserService,
    private notificationService: NotificationService,
    private roleAccessService: RoleAccessService,
    private signProcessClient: SignProcessClient,
    private authMenuService: AuthTicketStatusMenuService,
  ) {
    this.titleService.setTitle('Профиль');
  }

  ngOnInit() {
    this.user.name = this.userService.getUserName();
    this.user.roles = this.userService.currentRoles()
      .map(role => ROLES.find(r => r.value === role)?.viewValue);

    this.esfProfileApi.get().
      subscribe((value) => {
        this.refreshData(value)
        this.showPopupForNewUser()
      });
      
    this.hasAccessToManageCertificates = this.hasAccess(this.profileAccessControlList.get('manage_certificates'));
    this.authMenuSubscription = this.authMenuService.closeMenu$.subscribe(() => {
      this.testEsfConnection(false);
    });
  }

  ngOnDestroy() {
    if (this.authMenuSubscription){
      this.authMenuSubscription.unsubscribe();
    }
  }

  save() {
    if (this.login.value && this.password.value) {
      this.login.saving = true;
      this.password.saving = true;

      const userCreds: ISetCredentialCommand = {
        userName: this.login.value,
        password: this.password.value
      }

      this.esfProfileApi.saveCredential(new SetCredentialCommand(userCreds))
        .pipe(
          finalize(() => { 
            this.login.saving = false; 
            this.password.saving = false; 
          })
        )
        .subscribe((profile) => {
          this.refreshData(profile);
        }, error => {
          this.notificationService.error(error)
        })
    }

    if (this.authCertificate.file && this.authCertificate.password) {
      this.isSubmitButtonDisabled = true;
      this.authCertificate.saving = true;
      this.authCertificate.renewing = false;
      this.esfProfileApi.uploadAuthCertificate(this.authCertificate.password, this.authCertificate.file)
        .pipe(
          finalize(() => {
            this.authCertificate.saving = false;
            this.authCertificate.file = null;
            this.authCertificate.password = null;
          }),
        )
        .subscribe((profile) => {
          this.refreshData(profile);
          this.authCertificate.saving = false;
          this.isSubmitButtonDisabled = false;
        }, error => {
          this.notificationService.error(error)
          this.isSubmitButtonDisabled = false;
        })
    }

    if (this.signCertificate.file && this.signCertificate.password) {
      this.isSubmitButtonDisabled = true;
      this.signCertificate.saving = true;
      this.signCertificate.renewing = false;
      this.esfProfileApi.uploadSignCertificate(this.signCertificate.password, this.signCertificate.file)
        .pipe(
          finalize(() => {
            this.signCertificate.saving = false;
            this.signCertificate.file = null;
            this.signCertificate.password = null;
          }),
        )
        .subscribe((profile) => {
          this.refreshData(profile);
          this.signCertificate.saving = false;
          this.isSubmitButtonDisabled = false;
        }, error => {
          this.notificationService.error(error)
          this.isSubmitButtonDisabled = false;
        })
    }

    if (this.gostCertificate.file && this.gostCertificate.password) {
      this.isSubmitButtonDisabled = true;
      this.gostCertificate.saving = true;
      this.gostCertificate.renewing = false;
      this.esfProfileApi.uploadGostCertificate(this.gostCertificate.password, this.gostCertificate.file)
        .pipe(
          finalize(() => {
            this.gostCertificate.saving = false;
            this.gostCertificate.file = null;
            this.gostCertificate.password = null;
          }),
        )
        .subscribe((profile) => {
          this.refreshData(profile);
          this.gostCertificate.saving = false;
          this.isSubmitButtonDisabled = false;
        }, error => {
          this.notificationService.error(error)
          this.isSubmitButtonDisabled = false;
        })
    }
  }

  public authCertificateFileChanged(event) {
    if (event.target.value) {
      const file = event.target.files[0];
      this.getFileInfo(file, file.type).then(
        (fileInfo: FileParameter) => this.authCertificate.file = fileInfo)
    }
  }

  public signCertificateFileChanged(event) {
    if (event.target.value) {
      const file = event.target.files[0];
      this.getFileInfo(file, file.type).then(
        (fileInfo: FileParameter) => this.signCertificate.file = fileInfo)
    }
  }

  public gostCertificateFileChanged(event) {
    if (event.target.value) {
      const file = event.target.files[0];
      this.getFileInfo(file, file.type).then(
        (fileInfo: FileParameter) => this.gostCertificate.file = fileInfo)
    }
  }

  public checkAuthAndProceed() {
    this.testingConnection = true;
    this.signProcessClient.send().subscribe(
      resp => {
        if (!resp.hasSignedAuthTicket) {
            this.authMenuService.requestOpenMenu();
            this.testingConnection = false;
        }else{
          this.testEsfConnection(false);
        }
      },
      error => {
        this.notificationService.error('Ошибка проверки авторизации');
        this.testingConnection = false;
      }
    );
  }

  private async getFileInfo(file, type): Promise<FileParameter> {
    const base64 = await this.changeFile(file);
    const blob = this.b64Blob([base64], type);
    return { data: blob, fileName: file.name }
  }

  private changeFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  private b64Blob(dataURI, typeBlob) {
    let byteString = atob(dataURI.toString().split(',')[1]);
    let ab = new ArrayBuffer(byteString.length);
    let ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: typeBlob });
  }

  private async refreshData(value: EsfUserProfileDto) {
    this.authCertificate.completed = !value.isGostCertificate ? value.authCertificateUploaded : false;
    this.signCertificate.completed = !value.isGostCertificate ? value.signCertificateUploaded : false;
    this.login.completed = value.usernameSpecified;
    this.password.completed = value.passwordSpecified;
    this.isGostCertificate = value.isGostCertificate;
    this.gostCertificate.completed = value.isGostCertificate;
    this.isLoadingProfile = false;
  }

  isSaveDisabled() {
    return this.isGostCertificate ?
    this.isLoadingProfile
      || this.login.saving
      || this.password.saving
      || this.gostCertificate.saving :
    this.isLoadingProfile
      || this.login.saving
      || this.password.saving
      || this.authCertificate.saving
      || this.signCertificate.saving
  }

  isProfileDataCompleted() {
    return this.isGostCertificate ?
    (this.login.completed || this.password.completed) && this.gostCertificate.completed :
    (this.login.completed || this.password.completed) && (this.authCertificate.completed || this.signCertificate.completed);
  }

  isLoginOrPasswordEmpty(){
    return !this.login.completed || !this.password.completed;
  }

  testEsfConnection(isPowerUser: boolean) {
    this.testingConnection = true;
    this.esfProfileApi.testConnection(isPowerUser)
      .pipe(
        finalize(() => { this.testingConnection = false; }),
      )
      .subscribe(result => {
        if (result.isSuccess) {
          this.notificationService.success('Подключено');
        }
        else {
          this.notificationService.error(
            'Не удалось подключиться к ЭСФ порталу: ' + result.errorMessage + '<br/>' +
            'Обратитесь к <a href = "mailto:tco-finance-gcp-ts@tengizchevroil.com" > GCP Technical Support </a>');
        }
      })
  }
  
  private showPopupForNewUser(){
    if(this.isProfileDataCompleted())      
      this.notificationService.success('Все вводимые пароли зашифрованы');
  }
  
  hasAccess(roles: RoleType[]): boolean {
    return this.roleAccessService.hasAccess(roles);
  }
}


