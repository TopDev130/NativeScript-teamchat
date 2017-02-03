var app = require('application'),
  http = require('http'),
  filesystem = require('file-system'),
  imageSource = require('image-source'),
  page = require('ui/page'),
  observable = require('data/observable'),
  observableArray = require('data/observable-array'),
  userColl = localStorage.getCollection('user'),
  preferenceColl = localStorage.getCollection('preference'),
  teamColl = localStorage.getCollection('team'),
  channelColl = localStorage.getCollection('channel'),
  directProfileColl = localStorage.getCollection('directprofile'),
  cacheImageSrc,
  postColl,
  Controller;

Controller = function () {
  var me = this;
  BaseController.call(me);
  cacheImageSrc = imageSource.fromResource('cache');
  app.resources['onProfileImage'] = me['listeners.onProfileImage'];
};

Controller.prototype = Object.create(BaseController.prototype);

Controller.prototype.updateBindingContext = function (source) {
  var me = this,
    bindingContext = me.bindingContext;

  bindingContext.user = new observable.Observable(_.cloneDeep(userColl.findAll()[0]));
  bindingContext.selectedTeam = new observable.Observable();
  bindingContext.selectedChannel = new observable.Observable();
  bindingContext.publicChannelList = new observableArray.ObservableArray();
  bindingContext.privateChannelList = new observableArray.ObservableArray();
  bindingContext.directChannelList = new observableArray.ObservableArray();
  bindingContext.postList = new observableArray.ObservableArray();

  BaseController.prototype.updateBindingContext.call(me, source);
};

Controller.prototype.onNavigatedTo = function (args) {
  var me = this,
    bindingContext = me.bindingContext,
    selectedTeam = bindingContext.selectedTeam,
    selectedTeamId = selectedTeam.get('id'),
    selectedTeamDoc = teamColl.find({ selected: true }, { $limit: 1 })[0],
    source = args.object;

  if (selectedTeamId || selectedTeamDoc) {
    source.off(page.Page.navigatedToEvent);
    if (!selectedTeamId) {
      _.each(selectedTeamDoc, function (value, key) {
        selectedTeam.set(key, _.cloneDeep(value));
      });
    }
    me.updateChannelList();
  } else {
    me.getTeamList();
  }
};

Controller.prototype.onTapHamburger = function () {
  frame.topmost().getViewById('drawer').toggleDrawerState();
};

Controller.prototype.onTapInfo = function () {
  var me = this,
    bindingContext = me.bindingContext,
    locale = bindingContext.locale,
    selectedChannel = bindingContext.selectedChannel;

  dialogs.alert({
    title: selectedChannel.get('display_name'),
    message: selectedChannel.get('header') || locale.get('main_no_channel_header'),
    okButtonText: locale.get('btn_ok')
  });
};

Controller.prototype.onTapSearch = function () {

};

Controller.prototype.onTapOptionMenu = function () {

};

Controller.prototype.getTeamList = function () {
  frame.topmost().navigate('views/team/List');
};

Controller.prototype.getChannelList = function () {
  var me = this,
    bindingContext = me.bindingContext,
    selectedTeam = bindingContext.selectedTeam;

  HttpRequest({
    method: 'CHANNEL_GET',
    pathVars: [selectedTeam.get('id')]
  }).then(me['listeners.onChannelList']);
};

Controller.prototype.onChannelList = function (result) {
  var me = this;

  _.each(result.channels, function (channel) {
    channelColl.save(channel);
  });
  channelColl.commit();

  me.updateChannelList();
};

Controller.prototype.updateChannelList = function () {
  var me = this;

  if (channelColl.getLength()) {
    var bindingContext = me.bindingContext,
      channelTypes = appConfig.API_CONSTANTS.CHANNEL_TYPES,
      lastChannelId = (preferenceColl.find({ category: appConfig.API_CONSTANTS.PREFERENCE_TYPES.LAST }, { $limit: 1 })[0] || {}).value,
      activeDirectChannels = preferenceColl.find({ category: appConfig.API_CONSTANTS.PREFERENCE_TYPES.DIRECT }),
      activeDirectChannelsLen = activeDirectChannels.length,
      publicChannels = [],
      privateChannels = [],
      directChannels = [];

    _.each(channelColl.findAll(), function (channel) {
      var type = channel.type,
        selected = channel.id === lastChannelId,
        channelObs = new observable.Observable(_.extend(_.cloneDeep(channel), { selected: selected }));

      if (type === channelTypes.PUBLIC) {
        publicChannels.push(channelObs);
      } else if (type === channelTypes.PRIVATE) {
        privateChannels.push(channelObs);
      } else if (type === channelTypes.DIRECT) {
        var directProfileId = _.split(channel.name, '__')[0];
        if (activeDirectChannelsLen === 0 || _.find(activeDirectChannels, { name: directProfileId })) {
          var profileData = _.cloneDeep(directProfileColl.find({ id: directProfileId }, { $limit: 1 })[0]);
          channelObs.set('display_name', profileData.first_name + ' ' + profileData.last_name);
          channelObs.set('profile', profileData);
          directChannels.push(channelObs);
        }
      }

      if (selected) {
        me.updateSelectedChannel(channelObs);
      }
    });

    bindingContext.publicChannelList.push(_.sortBy(publicChannels, me.sortBy));
    bindingContext.privateChannelList.push(_.sortBy(privateChannels, me.sortBy));
    bindingContext.directChannelList.push(_.sortBy(directChannels, me.sortBy));
  } else {
    me.getChannelList();
  }
};

Controller.prototype.sortBy = function (item) {
  return item.display_name.toLowerCase();
};

Controller.prototype.updateSelectedChannel = function (channel) {
  var me = this,
    bindingContext = me.bindingContext,
    selectedChannel = bindingContext.selectedChannel,
    postList = bindingContext.postList;

  _.each(['id', 'type', 'display_name', 'header', 'message'], function (key) {
    selectedChannel.set(key, channel.get(key));
  });

  postList.splice(0, postList.length);

  postColl = localStorage.getCollection(selectedChannel.get('id'));

  me.getPostList();
};

Controller.prototype.getPostList = function () {
  var me = this,
    bindingContext = me.bindingContext,
    selectedTeam = bindingContext.selectedTeam,
    selectedChannel = bindingContext.selectedChannel,
    postList = bindingContext.postList,
    postListLen = postList.length;

  HttpRequest({
    method: 'POST_GET',
    pathVars: [selectedTeam.get('id'), selectedChannel.get('id'), postListLen, appConfig.API_CONSTANTS.POST_GET_LIMIT],
    busy: false,
    alertUser: false
  }).then(function (result) {
    var order = _.reverse(result.order),
      posts = result.posts;
    if (postListLen === 0) {
      postColl.clear();
      _.each(order, function (postId) {
        postColl.save(_.cloneDeep(posts[postId]));
      });
      postColl.commit();
    }
    return result;
  }).then(me['listeners.onPostList']).catch(me['listeners.onPostListFail']);
};

Controller.prototype.onPostList = function (result) {
  var me = this,
    bindingContext = me.bindingContext,
    selectedChannel = bindingContext.selectedChannel,
    postList = bindingContext.postList,
    order = result.order,
    posts = result.posts,
    postObsArr = [0, 0];

  if (order.length < appConfig.API_CONSTANTS.POST_GET_LIMIT) {
    selectedChannel.set('more', false);
  }
  _.each(order, function (postId) {
    postObsArr.push(new observable.Observable(posts[postId]));
  });

  postList.splice.apply(postList, postObsArr);

  setTimeout(function () {
    var scvContent = frame.topmost().currentPage.getViewById('scvContent');
    if (scvContent) {
      scvContent.scrollToVerticalOffset(scvContent.scrollableHeight, false);
    }
  }, 500);

  return result;
};

Controller.prototype.onPostListFail = function () {
  var me = this,
    bindingContext = me.bindingContext,
    locale = bindingContext.locale,
    postList = bindingContext.postList,
    postObsArr = [];

  if (postList.length === 0 && postColl.getLength() !== 0) {
    _.each(postColl.findAll(), function (post) {
      postObsArr.push(new observable.Observable(_.cloneDeep(post)));
    });
    postList.push(postObsArr);
  } else {
    uiHelper.toast(locale.get('msg_offline'));
  }
};

Controller.prototype.onProfileImage = function (postId, userId) {
  var me = this,
    bindingContext = me.bindingContext,
    user = bindingContext.user,
    postList = bindingContext.postList,
    picture = user.get('id') === userId && user.get('picture') || (directProfileColl.find({ id: userId }, { $limit: 1 })[0] || {}).picture,
    isUserImage = picture === appConfig.API_CONSTANTS.PROFILE_IMAGE_TYPE.USER,
    url;

  if (isUserImage) {
    url = stringFormatter.format(appConfig.API_CONSTANTS.PROFILE_IMAGE_URL.USER, userId);
  } else {
    url = stringFormatter.format(appConfig.API_CONSTANTS.PROFILE_IMAGE_URL.SYSTEM, appConfig.BASE_URL, userId);
  }

  var imagePath = filesystem.path.join(filesystem.knownFolders.temp().getFolder(appConfig.IMAGE_CACHE_PATH).path, appUtils.md5(url));
  if (filesystem.File.exists(imagePath)) {
    return imagePath;
  }

  http.getFile({
    url: url,
    headers: !isUserImage && {
      'Authorization': user.get('authorization_token')
    }
  }, imagePath).then(function (image) {
    postList.some(function (post) {
      if (post.get('id') === postId) {
        post.notifyPropertyChange('user_id', userId);
        return true;
      }
    });
  });

  return cacheImageSrc;
};

Controller.prototype.onTapMenuItem = function (args) {
  var me = this,
    bindingContext = me.bindingContext,
    selectedChannel = bindingContext.selectedChannel,
    sourceBindingContenxt = args.object.bindingContext,
    channelTypes = appConfig.API_CONSTANTS.CHANNEL_TYPES;

  if (!sourceBindingContenxt.get('selected')) {
    var type = selectedChannel.get('type'),
      lastChannelId = selectedChannel.get('id');

    if (type === channelTypes.PUBLIC) {
      channelList = bindingContext.publicChannelList;
    } else if (type === channelTypes.PRIVATE) {
      channelList = bindingContext.privateChannelList;
    } else if (type === channelTypes.DIRECT) {
      channelList = bindingContext.directChannelList;
    }

    channelList.some(function (channelObs) {
      if (channelObs.get('id') === lastChannelId) {
        channelObs.set('selected', false);
        channelObs.set('message', selectedChannel.get('message'));
        return true;
      }
    });

    sourceBindingContenxt.set('selected', true);
    me.updateSelectedChannel(sourceBindingContenxt);
  }

  me.onTapHamburger();
};

module.exports = new Controller();