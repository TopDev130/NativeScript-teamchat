var userColl = localStorage.getCollection('user'),
  Controller;

Controller = function () {
  BaseController.call(this);
};

Controller.prototype = Object.create(BaseController.prototype);

Controller.prototype.onLoaded = function (args) {
  var me = this;

  BaseController.prototype.onLoaded.call(me, args);

  // ios statusbar background color, to match android experience
  if (OS_IOS) {
    var color = require('color'),
      statusBarFrame = UIApplication.sharedApplication().statusBarFrame,
      statusBarView = UIView.alloc().initWithFrame(statusBarFrame);
    statusBarView.backgroundColor = new color.Color(appConfig.STYLE.PRIMARY_DARK_COLOR).ios;
    statusBarView.autoresizingMask = (UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleBottomMargin);
    statusBarView.autoresizesSubviews = true;
    frame.topmost().ios.controller.view.superview.addSubview(statusBarView);
  }

  // cache app info
  // note: tns activity should be active 
  // to use `nativescript-appversion`
  var appversion = require('nativescript-appversion');
  appversion.getAppId().then(function (appId) {
    appConfig.APP_ID = appId;
  }).then(appversion.getVersionName).then(function (versionName) {
    appConfig.VERSION_NAME = versionName;
  }).then(appversion.getVersionCode).then(function (versionCode) {
    appConfig.VERSION_CODE = versionCode;
  }).then(me.initLocale);
};

Controller.prototype.initLocale = function () {
  // import app modules, depended on tns activity
  require('~/utils/Locale');
  require('~/utils/UIHelper');
  require('~/utils/NotificationHandler');

  // navigate to first page
  frame.topmost().navigate({
    moduleName: userColl.getLength() && 'views/main/Main' || 'views/login/Login',
    animated: false,
    clearHistory: true
  });
};

module.exports = new Controller();