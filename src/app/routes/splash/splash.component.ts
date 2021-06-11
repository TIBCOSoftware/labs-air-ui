import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
@Component({
    selector: 'app-splash',
    templateUrl: './splash.component.html',
    styleUrls: ['./splash.component.css']
})
export class SplashComponent implements OnInit {

    constructor(private router: Router, private route: ActivatedRoute, private location: Location) {
    }
    public handleGetStarted = (): void => {
        // get started - navigate to home
        this.router.navigate(['/starterApp/home/gateway']);
    }
    ngOnInit() {
        
    }
}
