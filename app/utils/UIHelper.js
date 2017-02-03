var color = require('color'),
    app = require('application'),
    UIHelper,
    Toast;

UIHelper = function () {
    if (OS_IOS) {
        Toast = require('nativescript-toasts');
        CSToastManager.setDefaultPosition(NSValue.valueWithCGPoint(CGPointMake(frame.topmost().ios.controller.view.center.x, 120)));
    } else if (OS_ANDROID) {
        Toast = android.widget.Toast;
    }
};

UIHelper.prototype.toast = function (message, duration) {
    if (OS_IOS) {
        Toast.show({
            text: message,
            duration: duration || Toast.DURATION.LONG
        });
    } else if (OS_ANDROID) {
        var tost = Toast.makeText(app.android.context, message, duration || Toast.LENGTH_LONG);
        tost.setGravity(android.view.Gravity.TOP | android.view.Gravity.CENTER_HORIZONTAL, 0, 220);
        tost.show();
    }
};

UIHelper.prototype.showLoader = function (message) {
    if (uiHelper._indicatorView) {
        return;
    }

    var indicatorView;
    if (OS_IOS) {
        UIApplication.sharedApplication().beginIgnoringInteractionEvents();

        var currentView = frame.topmost().ios.controller.view;
        indicatorView = UIView.alloc().initWithFrame(CGRectMake(0, 0, 90, 90));
        indicatorView.center = currentView.center;
        indicatorView.layer.cornerRadius = 4;
        indicatorView.backgroundColor = new color.Color("#CC000000").ios;

        var indicator = UIActivityIndicatorView.alloc().initWithActivityIndicatorStyle(UIActivityIndicatorViewStyle.UIActivityIndicatorViewStyleWhiteLarge);
        indicator.center = CGPointMake(45, 45);

        indicatorView.addSubview(indicator);
        currentView.addSubview(indicatorView);

        indicator.startAnimating();
    } else if (OS_ANDROID) {
        indicatorView = android.app.ProgressDialog.show(app.android.currentContext, '', locale.asObject().msg_loading);
    }
    uiHelper._indicatorView = indicatorView;
};

UIHelper.prototype.hideLoader = function () {
    if (!uiHelper._indicatorView) {
        return;
    }

    var indicatorView = uiHelper._indicatorView;
    if (OS_IOS) {
        indicatorView.removeFromSuperview();
        UIApplication.sharedApplication().endIgnoringInteractionEvents();
    } else if (OS_ANDROID) {
        indicatorView.dismiss();
    }
    delete uiHelper._indicatorView;
};

module.exports = global.uiHelper = new UIHelper();