import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Atendente } from 'src/app/models/atendente';
import { AtendenteService } from 'src/app/service/atendente.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  public showScreen = false;
  public name!: string;
  public senha!: string;
  public currentUser: any;

  allAtendente!: Atendente[];

  atendenteForm: Atendente = {
    id:0,
    name: '',
    senha: '',
    confirmacao: '',
    image: '',
    phone: '',
    roomId: []
  }

  constructor(private router: Router, private atendenteService: AtendenteService, public dialog: MatDialog){}

  ngOnInit(){
    this.getAtendente();
  }

  openDialogLogin() {
    this.dialog.open(DialogElementsLoginDialog,{width:'290px', height:'110px',ariaModal:true,position:{top:'20%',left:'42%'}});
  }

  openDialog() {
    this.dialog.open(DialogElementsExampleDialog,{width:'290px', height:'110px',ariaModal:true,position:{top:'20%',left:'42%'}});
  }

  login(): void {
    setTimeout(() => {
      this.atendenteService.getAtendente().subscribe(res=>{
        const user = res.find((a: any) =>{
            return a.name === this.atendenteForm.name && a.senha === this.atendenteForm.senha;
        });
        if(this.atendenteForm.name =='' || this.atendenteForm.senha == ''){
          this.openDialogLogin()
        }
        else if(user){
          this.atendenteService.Autenticado = true;
          this.atendenteService.mostrarMenuEmitter.emit(true);
          this.atendenteService.mostrarMenuEmitterFalse.emit(false);
          this.atendenteService.nome = user.name;
          this.atendenteService.image = user.image;
          this.atendenteService.id = user.id;
          this.atendenteService.mostrarNome.emit(this.atendenteService.nome);
          // this.atendenteService.mostrarImg.emit(this.atendenteService.image)
          // alert(this.nome)
          this.router.navigate(['main']);
        }else{
          this.openDialog()
          this.atendenteService.mostrarMenuEmitter.emit(false);
        }
      },error=>{
        alert("Somethin went wrong");
      })
    }, 100);
  }

  getAtendente(){
    this.atendenteService.getAtendente().subscribe((result) => {
      this.allAtendente = result;
    })
  }
}

@Component({
  selector: 'login.component.component',
  templateUrl: 'dialog-elements-login.html',
})
export class DialogElementsLoginDialog {
  constructor(public dialog: MatDialog){

  }
  fecharDialog(){
    this.dialog.closeAll();
  }
}

@Component({
  selector: 'login.component.component',
  templateUrl: 'dialog-elements-example-dialog.html',
})
export class DialogElementsExampleDialog {
  constructor(public dialog: MatDialog){

  }
  fecharDialog(){
    this.dialog.closeAll();
  }
}
