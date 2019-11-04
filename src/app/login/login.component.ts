import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { hexValue } from '@erebos/hex';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  @Input()
  public user: hexValue;

  @Output()
  loginMade: EventEmitter<string> = new EventEmitter<string>();
  @Output()
  logoutMade: EventEmitter<string> = new EventEmitter<string>();

  key: string;
  constructor() { }

  ngOnInit() {
  }

  login() {
    this.loginMade.emit(this.key);
  }

  logout() {
    this.user = null;
    this.key = null;
    this.logoutMade.emit();
  }
}
