import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { Atendente } from './../../models/atendente';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscriber } from 'rxjs';
import { AtendenteService } from 'src/app/service/atendente.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  atendenteForm: Atendente = {
    id:0,
    name: '',
    senha: '',
    confirmacao: '',
    image: '',
    phone: '',
    roomId: []
  }
  myImage: any;
  base64code: any;
  type!: string;

  constructor(private atendenteService: AtendenteService, private router: Router, public dialog: MatDialog,){}

  ngOnInit(){}

  openDialogValidacao() {
    this.dialog.open(DialogElementsValidacao, {width:'290px', height:'110px',ariaModal:true,position:{top:'20%',left:'42%'}});
  }

  openDialogVerificacao() {
    this.dialog.open(DialogElementsVerificacao, {width:'290px', height:'140px',ariaModal:true,position:{top:'20%',left:'42%'}});
  }

  salveAtendente(){
    if(this.atendenteForm.name == '' || this.atendenteForm.phone == '' || this.atendenteForm.senha == '' || this.atendenteForm.confirmacao == '' ){
      this.openDialogValidacao()
    }else{
      if(this.atendenteForm.confirmacao !== this.atendenteForm.senha){
        this.openDialogVerificacao();
      }else{
        this.atendenteService.createAtendente(this.atendenteForm).subscribe((result) => {
          this.router.navigate(['/login']);
        })
      }
    }

  }

  onChange($event: Event){
    const target = $event.target as HTMLInputElement;
    const file: File = (target.files as FileList)[0];

    this.convertToBase64(file);
  }

  convertToBase64(file: File){
    const observable = new Observable((subscriber: Subscriber<any>) => {
      this.readFile(file,subscriber)
    })
    observable.subscribe((d) => {
      this.myImage = d;
      this.base64code = d;

      setTimeout(() => {
        this.atendenteForm.image = d;
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
}

@Component({
  selector: 'signup.component.component',
  templateUrl: 'dialog-elements-validacao.html',
})
export class DialogElementsValidacao {
  constructor(public dialog: MatDialog){

  }
  fecharDialog(){
    this.dialog.closeAll();
  }
}

@Component({
  selector: 'signup.component.component',
  templateUrl: 'dialog-elements-verificacao.html',
})
export class DialogElementsVerificacao {
  constructor(public dialog: MatDialog){

  }
  fecharDialog(){
    this.dialog.closeAll();
  }
}
