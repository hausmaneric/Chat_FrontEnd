import { Component, ElementRef, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AtendenteService } from 'src/app/service/atendente.service';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
import { ChatService } from 'src/app/service/chat.service';
import { Atendente } from 'src/app/models/atendente';
import { Observable, Subscriber } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { Location, PlatformLocation } from '@angular/common';

export interface IFileUpload {
  RequestID: string;
  AttachmentName: string;
  AttachmentContent: any;
  FormType: string;
  AttachmentFlag: boolean;
}

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
  providers: [NgbDropdownConfig],
})
export class MainComponent implements OnInit{
  focusEvent = new EventEmitter<boolean>();

  atendenteForm: Atendente = {
    id:0,
    name: '',
    senha: '',
    confirmacao: '',
    image: '',
    phone: '',
    roomId: []
  }

  atendenteFormUser: Atendente ={
    id:0,
    name: '',
    senha: '',
    confirmacao: '',
    image: '',
    phone: '',
    roomId: []
  }

  atendenteFormContato: Atendente ={
    id:0,
    name: '',
    senha: '',
    confirmacao: '',
    image: '',
    phone: '',
    roomId: []
  }

  lstFiles: FileList = null;
  fileToUpload: File = null;
  fileUploaded: IFileUpload = null;
  downloadFile: IFileUpload[] = [];
  lstUploadedFiles: IFileUpload[] = [];
  isuploadDocument: boolean;
  totalFileSize: number;

  roomId!: string;
  messageText!: string;
  arquivo!: string;
  messageArray: { user: string, message?: string, image?: string, arquivo?:string, dados_arquivo: string }[] = [];
  storageArray : any[] = [];
  selectedUser!: any;
  currentUser!: any;

  allAtendente: Atendente[]  = [];
  allAtendentes: Atendente[]  = [];

  allNewAtendente: Atendente[]  = [];

  nomeUsuario!: string;
  base64code: any;
  myImage: any;
  image: any;
  file: any;
  type!: string;
  imageSelect!: boolean;
  fileUrl: any;
  dados!:any;
  image_person!: string;
  id_person!: number;
  listRoom: any[] = [];
  ultimaLinha: any[] = [];
  numeroRoom!: number;
  room!: string;
  userName!: string;
  searchResult: any;
  searchNumber: number = 0;

  constructor(private router: Router,private platformLocation: PlatformLocation,private toastrService: ToastrService,private spinner: NgxSpinnerService,private sanitizer: DomSanitizer, private atendenteService: AtendenteService, private config: NgbDropdownConfig, private chatService: ChatService){
    config.placement = 'top-start';
		config.autoClose = true;
  }

  ngOnInit(): void {
    this.init();
  }

  init(){
    this.totalFileSize = 0;

    this.getUsuario();
    this.getPerson();

    setTimeout(() => {
      this.currentUser = this.allAtendente.find(user => user.name === this.atendenteService.nome);
    }, 500);

    this.getMessage();

    const data = 'some text';
    const blob = new Blob([data], { type: 'application/octet-stream' });

    this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
    this.id_person = this.atendenteService.id;
  }

  setFocus() {
    this.focusEvent.emit(true);
  }

  reloadPage() {
    const currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigateByUrl(currentUrl);
    });
  }

  deslogar(){
    location.reload()
  }

  async selectUserHandler(name: string) {
    this.selectedUser = this.allAtendente.find(user => user.name === name);
    if (this.selectedUser && this.selectedUser.roomId && this.selectedUser.roomId[0]) {
      this.roomId = this.selectedUser.roomId[0][this.currentUser.id];
    }else{
      this.roomId = undefined;
    }

    if(this.roomId == undefined){
      await this.getRoom();

      const dataUser = await this.atendenteService.getByIdAtendente(this.atendenteService.id).toPromise();
      this.atendenteFormUser = dataUser;

      if (this.atendenteFormUser.roomId.length === 0) {
        if (this.numeroRoom) {
          this.atendenteFormUser.roomId.push({ [this.selectedUser.id]: this.room + '-' + this.numeroRoom.toString() });
        }
      } else {
        this.atendenteFormUser.roomId.forEach((room) => {
          if (this.numeroRoom) {
            room[this.selectedUser.id] = this.room + '-' + this.numeroRoom.toString();
          }
        });
      }
      const updateUser = await this.atendenteService.updateAtendente(this.atendenteFormUser).toPromise();
      updateUser;

      const dataContato = await this.atendenteService.getByIdAtendente(this.selectedUser.id).toPromise();
      this.atendenteFormContato = dataContato;

      if (this.atendenteFormContato.roomId.length === 0) {
        if (this.numeroRoom) {
          this.atendenteFormContato.roomId.push({ [this.atendenteService.id]: this.room + '-' + this.numeroRoom.toString() });
        }
      } else {
        this.atendenteFormContato.roomId.forEach((room) => {
          if (this.numeroRoom) {
            room[this.atendenteService.id] = this.room + '-' + this.numeroRoom.toString();
          }
        });
      }

      const updateContato = await this.atendenteService.updateAtendente(this.atendenteFormContato).toPromise();
      updateContato;

      this.reloadPage();

      const dataAll: Atendente[] = await this.atendenteService.getAtendente().toPromise();
      this.allAtendente = dataAll;

      await this.getRoom();

      this.selectedUser = this.allAtendente.find(user => user.name === name);
      this.roomId = this.selectedUser.roomId[0][this.currentUser.id];
      this.messageArray = [];

      this.storageArray = this.chatService.getStorage();
      const storeIndex = this.storageArray
        .findIndex((storage) => storage.roomId === this.roomId);
      if (storeIndex > -1) {
        this.messageArray = this.storageArray[storeIndex].chats;
        setTimeout(() => {
          var objDiv = document.getElementById("scroll");
          if (objDiv !== null) {
            objDiv.scrollTop = objDiv.scrollHeight;
          }
        }, 500);

      }
      this.join(this.atendenteService.nome, this.roomId);
    }else{
      this.messageArray = [];

      this.storageArray = this.chatService.getStorage();
      const storeIndex = this.storageArray
        .findIndex((storage) => storage.roomId === this.roomId);
      if (storeIndex > -1) {
        this.messageArray = this.storageArray[storeIndex].chats;
        setTimeout(() => {
          var objDiv = document.getElementById("scroll");
          objDiv!.scrollTop = objDiv!.scrollHeight;
        }, 500);

      }
      this.join(this.atendenteService.nome, this.roomId);
    }
    this.searchNumber = 0;
  }

  search(): void {
    this.searchNumber = 1;
    this.searchResult = this.allAtendente.filter(user => user.name.toLowerCase().includes(this.userName.toLowerCase()));
    this.userName = '';
  }

  join(username: string, roomId: string): void {
    this.chatService.joinRoom({user: username, room: roomId});
  }

  sendMessage(): void {
    this.chatService.sendMessage({
      user:  this.atendenteService.nome,
      room: this.roomId,
      message: this.messageText,
    });

    setTimeout(() => {
      var objDiv = document.getElementById("scroll");
      objDiv!.scrollTop = objDiv!.scrollHeight;
    }, 600);

    this.storageArray = this.chatService.getStorage();
    const storeIndex = this.storageArray
      .findIndex((storage) => storage.roomId === this.roomId);

    if (storeIndex > -1) {
      this.storageArray[storeIndex].chats.push({
        user: this.atendenteService.nome,
        message: this.messageText,
      });
      setTimeout(() => {
        var objDiv = document.getElementById("scroll");
        objDiv!.scrollTop = objDiv!.scrollHeight;
      }, 600);
    } else {
      this.storageArray = this.chatService.getStorage();
      const storeIndex = this.storageArray;

      const updateStorage = {
        roomId: this.roomId,
        chats: [{
          user: this.atendenteService.nome,
          message: this.messageText
        }]
      };

      this.storageArray.push(updateStorage);
      setTimeout(() => {
        var objDiv = document.getElementById("scroll");
        objDiv!.scrollTop = objDiv!.scrollHeight;
      }, 600);
    }

    this.chatService.setStorage(this.storageArray);
    this.messageText = '';
    this.setFocus()
  }

  sendImage(){
    this.chatService.sendMessage({
      user: this.atendenteService.nome,
      message: '',
      room: this.roomId,
      image: this.image,
      arquivo: ''
    });

    setTimeout(() => {
      var objDiv = document.getElementById("scroll");
      objDiv!.scrollTop = objDiv!.scrollHeight;
    }, 600);

    this.storageArray = this.chatService.getStorage();
    const storeIndex = this.storageArray
      .findIndex((storage) => storage.roomId === this.roomId);

    if (storeIndex > -1) {
      this.storageArray[storeIndex].chats.push({
        user: this.atendenteService.nome,
        image: this.image,
      });
      setTimeout(() => {
        var objDiv = document.getElementById("scroll");
        objDiv!.scrollTop = objDiv!.scrollHeight;
      }, 600);
    } else {
      this.storageArray = this.chatService.getStorage();
      const storeIndex = this.storageArray;

      const updateStorage = {
        roomId: this.roomId,
        chats: [{
          user: this.atendenteService.nome,
          image: this.image
        }]
      };

      this.storageArray.push(updateStorage);
      setTimeout(() => {
        var objDiv = document.getElementById("scroll");
        objDiv!.scrollTop = objDiv!.scrollHeight;
      }, 600);
    }

    this.chatService.setStorage(this.storageArray);
    this.image = '';
    this.setFocus()
    this.imageSelect = false;
  }

  sendArquivo(){
    this.chatService.sendMessage({
      user: this.atendenteService.nome,
      message: '',
      room: this.roomId,
      image: '',
      arquivo: this.file,
      dados_arquivo: this.dados
    });

    setTimeout(() => {
      var objDiv = document.getElementById("scroll");
      objDiv!.scrollTop = objDiv!.scrollHeight;
    }, 600);

    this.storageArray = this.chatService.getStorage();
    const storeIndex = this.storageArray
      .findIndex((storage) => storage.roomId === this.roomId);

    if (storeIndex > -1) {
      this.storageArray[storeIndex].chats.push({
        user: this.atendenteService.nome,
        arquivo: this.file,
        dados_arquivo: this.dados
      });
      setTimeout(() => {
        var objDiv = document.getElementById("scroll");
        objDiv!.scrollTop = objDiv!.scrollHeight;
      }, 600);
    } else {
      this.storageArray = this.chatService.getStorage();
      const storeIndex = this.storageArray;

      const updateStorage = {
        roomId: this.roomId,
        chats: [{
          user: this.atendenteService.nome,
          arquivo: this.file,
          dados_arquivo: this.dados
        }]
      };

      this.storageArray.push(updateStorage);
      setTimeout(() => {
        var objDiv = document.getElementById("scroll");
        objDiv!.scrollTop = objDiv!.scrollHeight;
      }, 600);
    }

    this.chatService.setStorage(this.storageArray);
    this.file = '';
    this.setFocus()
    this.imageSelect = false;
  }

  getfile(event: any){
    this.image = event.target.files[0];
  }

  onChange($event: Event){
    const target = $event.target as HTMLInputElement;
    const file: File = (target.files as FileList)[0];
    this.type = file.type;

    this.convertToBase64(file);
    this.imageSelect = true;

    if(this.imageSelect){
      this.config.autoClose = 'outside';
    }
  }

  convertToBase64(file: File){
    const observable = new Observable((subscriber: Subscriber<any>) => {
      this.readFile(file,subscriber)
    })
    observable.subscribe((d) => {
     this.myImage = d;
     this.base64code = d;

     setTimeout(() => {
        this.image = d;
     }, 500);
    })
  }

  readFile(file: File,subscriber: Subscriber<any>){
    const filereader = new FileReader();

    filereader.readAsDataURL(file)
    filereader.onload = () => {
      subscriber.next(filereader.result);
      subscriber.complete()
    }
    filereader.onerror = () => {
      subscriber.error()
      subscriber.complete();
    }
  }

  getMessage(){
    this.chatService.getMessage()
    .subscribe((data: { user: string, room: string, message: string, image?:string, arquivo?: string, dados_arquivo?: string }) => {
      // this.messageArray.push(data);
      if (this.roomId) {
        setTimeout(() => {
          this.storageArray = this.chatService.getStorage();
          const storeIndex = this.storageArray
            .findIndex((storage) => storage.roomId === this.roomId);
          this.messageArray = this.storageArray[storeIndex].chats;
          setTimeout(() => {
            var objDiv = document.getElementById("scroll");
            objDiv!.scrollTop = objDiv!.scrollHeight;
          }, 600);
        }, 500);
      }
    });
  }

  handleFileInput = async (event) => {
    this.lstFiles = event.target.files;
    this.isuploadDocument = false;
    if (this.lstFiles.length > 0) {
      for (let i = 0; i < this.lstFiles.length; i++) {
        this.fileToUpload = this.lstFiles.item(i);
        if (this.fileToUpload.type === 'application/x-msdownload' || this.fileToUpload.type === 'application/exe') {
          this.isuploadDocument = false;
          this.toastrService.error('O tamanho do arquivo combinado não deve exceder.', 'Error!');
        } else {
          this.totalFileSize = this.totalFileSize + this.fileToUpload.size;
          if (this.totalFileSize <= 1000000) {
            this.fileUploaded = {
              RequestID: '',
              AttachmentFlag: true,
              FormType: 'MRF',
              AttachmentName: this.fileToUpload.name,
              AttachmentContent: await this.readUploadedFileAsDataUrl(this.lstFiles.item(i))
            };
            this.file = this.fileToUpload.name;
            this.dados = await this.readUploadedFileAsDataUrl(this.lstFiles.item(i));
            this.lstUploadedFiles.push(this.fileUploaded);
            this.isuploadDocument = true;

            setTimeout(() => {
              this.sendArquivo();
            }, 500);
          } else {
            this.isuploadDocument = false;
            this.toastrService.error('O tamanho do arquivo combinado não deve exceder 4 MB', 'Error!');
          }
        }
      }
    }
  }

  readUploadedFileAsDataUrl = (inputFile) => {
    const temporaryFileReader = new FileReader();
    return new Promise((resolve, reject) => {
      temporaryFileReader.onerror = () => {
        temporaryFileReader.abort();
        reject(this.toastrService.error('Não é possível carregar um arquivo executável.', 'Error!'));
      };
      temporaryFileReader.onload = () => {
        resolve(temporaryFileReader.result);
      };
      temporaryFileReader.readAsDataURL(inputFile);
    });
  }

  downloadfile(filename: string) {
    this.spinner.show();
    this.downloadFile = this.lstUploadedFiles.filter(e => e.AttachmentName === filename);
    console.log(this.downloadFile);
    if (this.downloadFile) {
      this.prepareDownload(filename, this.dados);
    }
    this.spinner.hide();
  }

  prepareDownload(filename, text) {
    // console.log(text);
    const element = document.createElement('a');
    element.setAttribute('href', text);
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  async getUsuario(){
    this.listRoom = [];
    const dataAll: Atendente[] = await this.atendenteService.getAtendente().toPromise();
    this.allAtendente = dataAll;

    const dataAllNew: Atendente[] = await this.atendenteService.getAtendente().toPromise();
    this.allNewAtendente = dataAllNew.filter((user) => user.name !== this.atendenteService.nome);
  }

  async getRoom(){
    this.listRoom = [];
    for (let index = 0; index < this.allAtendente.length; index++) {
      const element = this.allAtendente[index];
      this.listRoom.push(Object.values(element.roomId)[0]);
    }

    if (this.listRoom.length > 0) {
      let lastRow = null;
      let currentIndex = this.listRoom.length - 1;

      // Percorre o array de trás para frente até encontrar o registro desejado
      while (currentIndex >= 0) {
        const currentRow = this.listRoom[currentIndex];

        if (currentRow !== undefined) {
          lastRow = currentRow;
          break;
        }

        currentIndex--;
      }

      if (lastRow !== null) {
        this.ultimaLinha = this.ultimaLinha.concat(lastRow);

        if (this.ultimaLinha.length > 0) {
          const chaves = Object.keys(this.ultimaLinha[0]);
          const ultimaChave = chaves[chaves.length - 1];
          const ultimoItem = this.ultimaLinha[0][ultimaChave];

          if (ultimoItem) {
            var parts = ultimoItem.split("-");
            this.room = parts[0];
            this.numeroRoom = +parts[1] + 1;
          }
        }
      }else{
        const lastRow = this.listRoom[this.listRoom.length - 1];
        this.ultimaLinha = this.ultimaLinha.concat(lastRow);
        if(this.ultimaLinha = []){
          this.room = 'room';
          this.numeroRoom = +0 + 1;
        }else{
          if (this.ultimaLinha.length > 0) {
            const chaves = Object.keys(this.ultimaLinha[0]);
            const ultimaChave = chaves[chaves.length - 1];
            const ultimoItem = this.ultimaLinha[0][ultimaChave];

            if (ultimoItem) {
              var parts = ultimoItem.split("-");
              this.room = parts[0];
              this.numeroRoom = +parts[1] + 1;
            }
          }
        }
      }
    }
  }

  closeImg(){
    this.imageSelect = false;
    this.image = '';
  }

  async getPerson(){
    const data = await this.atendenteService.getByIdAtendente(this.atendenteService.id).toPromise();
    this.atendenteForm = data;
  }

  async openEditPerson(){
    this.getPerson();

    const elemento = document.querySelector('.person_dados') as HTMLElement;
    elemento.style.display = 'block';
  }

  updatePerson(){
    this.atendenteService.updateAtendente(this.atendenteForm).subscribe((data) => {
      const elemento = document.querySelector('.person_dados') as HTMLElement;
      elemento.style.display = 'none';
    })
  }

  onChangeImgPerson($event: Event){
    const target = $event.target as HTMLInputElement;
    const file: File = (target.files as FileList)[0];

    this.convertToBase64ImgPerson(file);
  }

  convertToBase64ImgPerson(file: File){
    const observable = new Observable((subscriber: Subscriber<any>) => {
      this.readFileImgPerson(file,subscriber)
    })
    observable.subscribe((d) => {
      this.myImage = d;
      this.base64code = d;

      setTimeout(() => {
        this.atendenteForm.image = d;
      }, 500);
     })
  }

  readFileImgPerson(file: File,subscriber: Subscriber<any>){
    const filereader = new FileReader();

    filereader.readAsDataURL(file)
    filereader.onload = () => {
      subscriber.next(filereader.result);
      subscriber.complete()
    }
    filereader.onerror = () => {
      subscriber.error()
      subscriber.complete();
    }
  }
}


// class GuidGenerator {
//   newGuid() {
//     return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
//       var r = Math.random() * 16 | 0,
//       v = c == 'x' ? r : (r & 0x3 | 0x8);
//       return v.toString(16);
//     });
//   }
// }
