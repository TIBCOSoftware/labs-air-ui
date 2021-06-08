import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'app-starter-app',
  templateUrl: './starter-app.component.html',
  styleUrls: ['./starter-app.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class StarterAppComponent implements OnInit {

  constructor(private route: ActivatedRoute, private router: Router, private titleService: Title) { }

  ngOnInit() {
    this.titleService.setTitle('Project Air App');
  }

}
