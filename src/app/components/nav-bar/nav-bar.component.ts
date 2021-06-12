import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { BreadcrumbsService } from '../../services/breadcrumbs/breadcrumbs.service'
import { Location } from '@angular/common';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit {

  @Output() toggleSidenav = new EventEmitter<void>();

  /**
     * page title comes from config resolver
     */
  @Input() title: string = "";
  paths: String[] = [];

  constructor(private breadcrumb: BreadcrumbsService, private location: Location) {
  }

  ngOnInit() {
    this.breadcrumb.path.subscribe((x) => {
      this.paths = x;
    })
  }

  public goBack() {
    this.location.back();
  }

  public logout() {

  }
}
