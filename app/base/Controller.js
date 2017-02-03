var page = require('ui/page'),
    observable = require('data/observable'),
    appConfigObs = new observable.Observable(appConfig),
    BaseController;

BaseController = function () {
    var me = this;
    me.bindingContext = {
        appConfig: appConfigObs
    };
    // locale is initialized only on appload
    if (typeof locale !== 'undefined') {
        me.bindingContext.locale = locale.asObservable();
    }
    // bind event listeners to scope
    // which will be used with xml later
    _.forIn(me, function (func, prop) {
        if (_.startsWith(prop, 'on') && _.isFunction(func)) {
            me['listeners.' + prop] = _.bind(func, me);
        }
    });
};

BaseController.prototype.onLoaded = function (args) {
    var me = this,
        source = args.object;

    source.off(page.Page.loadedEvent);
    me.updateBindingContext(source);
};

BaseController.prototype.updateBindingContext = function (source) {
    source.bindingContext = this.bindingContext;
};

module.exports = global.BaseController = BaseController;