var gravatar = require('gravatar');
var config = require('config');

module.exports = function(req, title, next) {

    var vm = {
        title: title + ' | University of Alabama Housing'
    };

    if (req.user) {
        vm.user = req.user;
        delete vm.user.password;
        vm.user.image = gravatar.url(vm.user.email, { s:200, r: 'pg', d: 'mm'}, true);
    }

    vm.bodyClass = "";

    if (req.session.justLoggedIn) {
        req.session.justLoggedIn = false;
        vm.bodyClass += 'page-fade ';
    }

    vm.navigation = [
        {
            linkName: 'Calendar',
            url: '/',
            icon: 'entypo-calendar',
            subMenu: [
                {
                    linkName: 'View Calendar',
                    url: '/'
                },
                {
                    linkName: 'Add Event',
                    url: '/add'
                },
                {
                    linkName: 'Schedule Editor',
                    url: '/schedule'
                }
            ]
        },
        {
            linkName: 'Notifications',
            url: '/notifications',
            icon: 'entypo-paper-plane',
            subMenu: [
                {
                    linkName: 'Notification History',
                    url: '/notifications'
                },
                {
                    linkName: 'Send Notification',
                    url: '/notifications/send'
                }
            ]
        },
        {
            linkName: 'Staff Members',
            url: '/staff',
            icon: 'entypo-users',
            subMenu: [
                {
                    linkName: 'Manage Staff',
                    url: '/staff'
                },
                {
                    linkName: 'Add Staff Member',
                    url: '/staff/add'
                }
            ]
        },
        {
            linkName: 'Settings',
            url: '/settings',
            icon: 'entypo-gauge'
        }
    ];

    vm.classes = {};

    vm.footer = '';

    if (config.has('build')) {
        vm.footer = config.get('build');
    }

    for(var i = 0; i < vm.navigation.length; i++) {
        var currentLink = vm.navigation[i];
        vm.classes[currentLink.linkName] = '';
        if (!currentLink.icon) {
            currentLink.icon = null;
        }
        if(currentLink.subMenu) {
            vm.classes[currentLink.linkName] += 'has-sub ';
        } else {
            currentLink.subMenu = null;
        }
    }

    return vm;
}
