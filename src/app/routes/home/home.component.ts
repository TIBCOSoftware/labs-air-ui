import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  public userName: string;
  public userId: string;
  public welcomeMessage: string;

  constructor(private router: Router, private route: ActivatedRoute) {
    this.userName = "My User Name";
    this.userId = "1234";
    this.welcomeMessage = 'Edge Hub Management';
  }
 
  ngOnInit() {
  }

}
