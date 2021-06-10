
import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';

interface ROUTE {
    icon?: string;
    route?: string;
    title?: string;
    custom?: boolean;
}

@Component({
    selector: 'app-iot-home-cockpit',
    templateUrl: './iot-home-cockpit.component.html',
    styleUrls: ['./iot-home-cockpit-style.css']
})

export class IotHomeCockpitComponent {

    networkRoutes: ROUTE[] = [
        {
            icon: 'iotdashboard',
            route: '/starterApp/home/iotdashboard',
            title: 'IoT Dashboard',
            custom: true
        }, 
        {
            icon: 'gateway',
            route: '/starterApp/home/gateway',
            title: 'Device Groups',
            custom: true
        }
    ];

    deviceRoutes: ROUTE[] = [
        {
            icon: 'device',
            route: '/starterApp/home/device',
            title: 'Devices',
            custom: true
        }, {
            icon: 'devicedashboard',
            route: '/starterApp/home/deviceprofile',
            title: 'Device Profiles',
            custom: true
        }, {
            icon: 'provisioning',
            route: '/starterApp/home/deviceprovision',
            title: 'Device Provisioning',
            custom: true
        }, {
            icon: 'command',
            route: '/starterApp/home/devicecommand',
            title: 'Device Commands',
            custom: true
        }, {
            icon: 'rules',
            route: '/starterApp/home/rules',
            title: 'Edge Rules',
            custom: true
        }, {
            icon: 'rules',
            route: '/starterApp/home/mlmodels',
            title: 'Edge ML Models',
            custom: true
        },
        {
            icon: 'rules',
            route: '/starterApp/home/simulator',
            title: 'Simulator',
            custom: true
        },        
        // {
        //     icon: 'rules',
        //     route: '/starterApp/home/tcerules',
        //     title: 'Cloud Rules',
        //     custom: true
        // }, 
        {
            icon: 'instrumenthistory',
            route: '/starterApp/home/notifications',
            title: 'Notifications',
            custom: true
        }
        // {
        //     icon: 'settings',
        //     route: '/starterApp/home/casemanagement',
        //     title: 'Case Management',
        //     custom: false
        // }, 
        // {
        //     icon: 'settings',
        //     route: 'sales/leads',
        //     title: 'Settings',
        //     custom: false
        // }, {
        //     icon: 'get_app',
        //     route: 'sales/opportunities',
        //     title: 'Software Update',
        //     custom: false
        // }
    ];



    /**
     * The name of the logged user
     */
    @Input() userName = "";

    /**
     * The ID of the logged user
     */
    @Input() userId = "";


}
