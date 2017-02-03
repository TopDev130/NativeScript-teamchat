var app = require('application');

function init() {

  // utility variables
  var platform = require('platform');
  global.OS_IOS = platform.isIOS;
  global.OS_ANDROID = platform.isAndroid;

  // import native modules
  global.frame = require('ui/frame');
  global.dialogs = require('ui/dialogs');

  // import node modules
  require('nativescript-master-technology');
  global._ = require('lodash');
  global.moment = require('moment');
  global.stringFormatter = require('nativescript-stringformat');

  // import app modules
  require('~/AppConfig');
  require('~/utils/Logger');
  require('~/utils/AppUtils');
  require('~/utils/LocalStorage');
  require('~/utils/HttpRequest');
  require('~/base/Controller');

  // default transition accross app
  frame.Frame.defaultTransition = { name: 'slide' };

  app.start({
    moduleName: 'views/appload/AppLoad'
  });
}

init();