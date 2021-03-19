import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router, ActivatedRoute} from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class BreadcrumbsService {

  public path = new BehaviorSubject<String[]>([]);

  constructor(private router: Router, private route: ActivatedRoute) {
    this.router.events
      .pipe(
        // only filter for NavigationEnd, which should have breadcrumbs
        filter((event) => event instanceof NavigationEnd)
      )
      .subscribe((event) => {
        const root = this.router.routerState.snapshot.root;
        this.setCrumbs(root);
      });
  }

  // recursively looks through the route tree to find breadcrumbs for the current page.
  private setCrumbs(route: ActivatedRouteSnapshot) {
    if (route) {
      if (route.data.breadcrumb) {
        let parsedCrumbs = this.checkForGatewayID(route.data.breadcrumb);
        this.path.next(parsedCrumbs);
      }
      // go to the next element if not found
      this.setCrumbs(route.firstChild);
    }
  }

  private checkForGatewayID(path: String[]) {
    const deviceIndex = path.findIndex(x => x == 'Devices');
    if (deviceIndex >= 0) {
      let gatewayId = this.route.snapshot.params.gatewayId
      path[deviceIndex] = 'Devices (' + gatewayId +')'
    }
    return path;
  }
}
