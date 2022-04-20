// Copyright 2018 Ping Identity
//
// Licensed under the MIT License (the "License"); you may not use this file
// except in compliance with the License.
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Component, OnInit, AfterViewInit } from '@angular/core';
import { AuthorizationService } from '../../services/authorization.service';
import { Router } from '@angular/router';
import { TokenService } from '../../services/token.service';

@Component({
    selector: 'app-callback',
    templateUrl: './callback.component.html',
    styleUrls: ['./callback.component.css']
})
export class CallbackComponent implements AfterViewInit {

    constructor(public authorizationService: AuthorizationService, private tokenService: TokenService, public router: Router) { }

    ngAfterViewInit() {
        if (!window.location.hash || window.location.hash.length === 0) {
            const queryString = window.location.search.substring(1); // substring strips '?'
            const path = [window.location.pathname, queryString].join('#');
            window.location.assign(new URL(path, window.location.href).toString());
        } else if (new URLSearchParams(window.location.hash.substring(1)).has('code')) {
            this.authorizationService.completeAuthorizationRequest().then((tokenResponse) => {
                this.tokenService.tokenResponse(tokenResponse);
                const dest = localStorage.getItem('airRequestedPath');
                if (dest) {
                    this.router.navigate([dest]);    
                } else {
                    this.router.navigate(['splash']);
                }
            });
        } else {
            console.log('did not recognize callback in URL fragment or query');
            this.router.navigate(['error']);
        }
    }
}
