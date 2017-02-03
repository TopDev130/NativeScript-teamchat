var Plugin = require('nativescript-push-notifications'),
    NotificationHandler;

NotificationHandler = function () { };

NotificationHandler.prototype.isEnabled = function (alertUser) {
    return new Promise(function (resolve, reject) {
        // not supported on emulators
        if (process.isEmulator()) {
            return resolve();
        }
        Plugin.areNotificationsEnabled(function (enabled) {
            if (enabled) {
                resolve();
            } else {
                if (alertUser === true) {
                    var lstrings = locale.asObject();
                    dialogs.alert({
                        title: lstrings.app_name,
                        message: stringFormatter.format(lstrings.msg_push_disabled, lstrings.app_name),
                        okButtonText: lstrings.btn_ok
                    }).then(reject);
                } else {
                    reject();
                }
            }
        });
    });
};

NotificationHandler.prototype.register = function () {
    return new Promise(function (resolve, reject) {
        // not supported on emulators
        if (process.isEmulator()) {
            return resolve("");
        }
        Plugin.register({
            // ios
            badge: true,
            sound: true,
            alert: true,
            notificationCallbackIOS: notificationHandler.onMessageReceivedIOS,
            // android
            senderID: appConfig.GCM_SENDER_ID
        }, resolve, reject);
    });
};

NotificationHandler.prototype.onRegistered = function (token) {
    notificationHandler._token = token;
    if (OS_ANDROID) {
        Plugin.onMessageReceived(notificationHandler.onMessageReceivedAndroid);
    }
    return token;
};

NotificationHandler.prototype.onError = function (error) {
    logger.error('registration failed', error);
    return error;
};

NotificationHandler.prototype.getToken = function (token) {
    return notificationHandler.register().then(notificationHandler.onRegistered, notificationHandler.onError);
};

NotificationHandler.prototype.onMessageReceivedIOS = function (data) {
    // To Do
};

NotificationHandler.prototype.onMessageReceivedAndroid = function (message, data) {
    // To Do
};

module.exports = global.notificationHandler = new NotificationHandler();