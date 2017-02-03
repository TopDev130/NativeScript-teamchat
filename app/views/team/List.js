var observable = require('data/observable'),
    observableArray = require('data/observable-array'),
    configColl = localStorage.getCollection('config'),
    preferenceColl = localStorage.getCollection('preference'),
    teamColl = localStorage.getCollection('team'),
    directProfileColl = localStorage.getCollection('directprofile'),
    Controller;

Controller = function () {
    BaseController.call(this);
};

Controller.prototype = Object.create(BaseController.prototype);

Controller.prototype.updateBindingContext = function (source) {
    var me = this,
        bindingContext = me.bindingContext;

    bindingContext.teamList = new observableArray.ObservableArray();

    HttpRequest({
        method: 'USER_INFO'
    }).then(_.bind(me.onUserInfo, me));

    BaseController.prototype.updateBindingContext.call(me, source);
};

Controller.prototype.onUserInfo = function (result) {
    var me = this,
        bindingContext = me.bindingContext;

    configColl.clear();
    configColl.save(_.cloneDeep(result.client_cfg));
    configColl.commit();

    preferenceColl.clear();
    _.each(result.preferences, function (preference) {
        preferenceColl.save(_.cloneDeep(preference));
    });
    preferenceColl.commit();

    var teams = result.teams;
    teamColl.clear();
    _.each(teams, function (team) {
        teamColl.save(_.extend(_.cloneDeep(team), { selected: false }));
    });
    teamColl.commit();
    bindingContext.teamList.push(teams);

    directProfileColl.clear();
    _.each(result.direct_profiles, function (profile) {
        directProfileColl.save(_.cloneDeep(profile));
    });
    directProfileColl.commit();

    /**
     * clear all collection,
     * as everything depends on team
     */
    _.each(['channel'], function (name) {
        var coll = localStorage.getCollection(name);
        coll.clear();
        coll.commit();
    });
};

Controller.prototype.onTapListItem = function (args) {
    var me = this,
        bindingContext = me.bindingContext,
        itemIndex = args.index;

    teamColl.update({ id: bindingContext.teamList.getItem(itemIndex).id }, { $set: { selected: true } });
    teamColl.commit();

    frame.topmost().goBack();
};

module.exports = new Controller();