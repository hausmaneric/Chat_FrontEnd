import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Atendente } from '../models/atendente';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AtendenteService {

  public Autenticado: boolean = false;

  mostrarMenuEmitter = new EventEmitter<boolean>();
  mostrarMenuEmitterFalse = new EventEmitter<boolean>();
  mostrarNome = new EventEmitter<string>();
  mostrarImg = new EventEmitter<string>();
  nome!: string;
  image!:string;
  id!: number;

  constructor(private http: HttpClient, private router: Router) { }

  getAtendente(){
    return this.http.get<Atendente[]>("http://localhost:3000/atendente");
  }

  createAtendente(payLoad:Atendente){
    return this.http.post<Atendente>("http://localhost:3000/atendente", payLoad);
  }

  updateAtendente(payLoad:Atendente){
    return this.http.put(`http://localhost:3000/atendente/${payLoad.id}`,payLoad);
  }

  getByIdAtendente(id:number){
    return this.http.get<Atendente>(`http://localhost:3000/atendente/${id}`);
  }

  logar(name: string, senha: string, func:any){
    this.getAtendente().subscribe(res=>{
      const user = res.find((a: any) =>{
          return a.name === name && a.senha === senha
      });
      if(user?.name =='' || user?.senha == ''){
        return func
      }
      else if(user){
        this.Autenticado = true;
        this.mostrarMenuEmitter.emit(true);
        this.mostrarMenuEmitterFalse.emit(false);
        this.nome = user.name;
        this.image = user.image;
        this.id = user.id;
        this.mostrarNome.emit(this.nome);
        // alert(this.nome)
        this.router.navigate(['main']);
      }else{
        // func1
        this.mostrarMenuEmitter.emit(false);
      }
    },error=>{
      alert("Somethin went wrong");
    })
  }

  usuarioAutenticado(){
    return this.Autenticado;
  }
}
