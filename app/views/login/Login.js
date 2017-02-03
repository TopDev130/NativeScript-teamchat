var utils = require('utils/utils'),
    userColl = localStorage.getCollection('user'),
    Controller;

Controller = function () {
    BaseController.call(this);
};

Controller.prototype = Object.create(BaseController.prototype);

Controller.prototype.onTapLogin = function (args) {
    var me = this,
        lstrings = locale.asObject(),
        page = frame.topmost().currentPage,
        username = page.getViewById('txtUsername').text,
        password = page.getViewById('txtPwd').text;

    if (OS_ANDROID) {
        utils.ad.dismissSoftInput(page.android);
    }

    if (username && password) {
        uiHelper.showLoader();
        notificationHandler.isEnabled(true).then(notificationHandler.getToken, uiHelper.hideLoader).then(function (deviceToken) {
            return HttpRequest({
                method: 'USER_LOGIN',
                params: {
                    login_id: username,
                    password: password,
                    device_id: deviceToken
                }
            }).then(me.onLogin);
        });
    } else {
        dialogs.alert({
            title: lstrings.login_title,
            message: lstrings.login_val_required,
            okButtonText: lstrings.btn_ok
        });
    }
};

Controller.prototype.onLogin = function (result) {
    userColl.clear();
    userColl.save(result);
    userColl.commit();

    frame.topmost().navigate({
        moduleName: 'views/main/Main',
        animated: false,
        clearHistory: true
    });
};

module.exports = new Controller();