'use strict';


let config = require('../config'),
    util = require('util'),
    mandrill = require('mandrill-api/mandrill'),
    mandrill_client = new mandrill.Mandrill(config.mandrill.key),
    message = {
        to: [],
        important: true,
        track_opens: true,
        track_clicks: true,
        preserve_recipients: true,
        view_content_link: true,
        tags: [],
        global_merge_vars: []
    },
    sendMail = function mandrill$sendMail(template, content) {

        return true;

        mandrill_client.messages.sendTemplate(
            {
                'template_name': template,
                'template_content': content || [],
                'message': message,
                'async': false
            },
            () => {
                //console.log('Success on email delivery!');
            },
            err => {
                console.error('Error on email delivery!', err);
            }
        );

        return true;
    };

module.exports = {

    accountEmail: body => {

        let emailTemplate = '';

        message.to = [{ email: body.email, name: body.username }];
        message.global_merge_vars.push(
            {
                name: 'USERNAME',
                content: body.username
            }
        );

        switch (body.type) {
            case 'welcome':
                emailTemplate = 'welcome-email';
                message.subject = 'Your phlow account is ready!';
                break;

            case 'goodbye':
                emailTemplate = 'goodbye-email';
                message.subject = 'We are very sorry to see you go!';
                break;
        }

        sendMail(emailTemplate);
    }
};