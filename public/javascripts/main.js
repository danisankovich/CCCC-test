'use strict';

var app = angular.module('CCCC', ['ui.router']);
app.constant('constant', {
  url: 'http://localhost:3000/'
  // url: 'https://CCCC.herokuapp.com/'
});


app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/');
  $stateProvider
    .state('index', {
      url: '/',
      templateUrl: 'views/login.ejs'
    })
    .state('listings', {
      url: '/listings',
      templateUrl: 'views/listings.ejs',
      controller: 'ListingsCtrl'
    })
    .state('addshow', {
      url: '/addshow',
      templateUrl: 'views/addshow.ejs',
      controller: 'ListingsCtrl'
    })
    .state('viewshow', {
      url: '/viewshow',
      templateUrl: 'views/viewshow.ejs',
      controller: 'ListingsCtrl'
    })
    .state('myshows', {
      url: '/myshows',
      templateUrl: 'views/myshows.ejs',
      controller: 'ShowCTRL'
    })
    .state('editshow', {
      url: '/editshow',
      templateUrl: 'views/editshow.ejs',
      controller: 'ShowCTRL'
    });
}]);

app.service('listingsService', function($http, constant) {
  var thisService = this;
  this.currentUser = null;
  this.selectEditShowId = null;
  this.selectedFavoriteShow = null;
  this.addShow = function(addShow) {
    $http.post(constant.url + 'add_show', addShow)
      .success(function(data) {
        thisService.getCurrentUser();
        console.log('successdata', data);
      }).catch(function(error) {
        console.log(error);
      });
  };

  this.addComment = function(addComment) {
    $http.post(constant.url + 'add_comment', addComment)
      .success(function(data) {
        this.Service.getCurrentUser();
        console.log('successdata', data);
      }).catch(function(error) {
        console.log(error);
      });
    };

  this.editShow = function(editShow) {
    $http.post(constant.url + 'edit_show', editShow)
      .success(function(data) {
        thisService.getCurrentUser();
        console.log('successdata', data);
      }).catch(function(error) {
        console.log(error);
      });
  };

  this.getCurrentUser = function() {
    return $http.get(constant.url + 'get_current_user');
  };

  this.getEvents = function() {
    return $http.get(constant.url + 'events_listings');
  };

  this.updateEvents = function() {
    return $http.get(constant.url + 'get_current_user');
  };

  this.deleteShow = function(show) {
    $http.delete(constant.url + 'delete_show/'+ thisService.currentUser.email + '/' + show._id)
      .success(function(data){
        console.log(data);
      }).catch(function(error){
        console.log(error);
      });
  };
  this.editingShow = function(changedShowValue) {
    $http.patch(constant.url + 'edit_show/' + thisService.currentUser.email + '/' + thisService.selectEditShowId, changedShowValue)
      .success(function(data){
        console.log(data);
      }).catch(function(error){
        console.log(error);
      });
  };
  this.offerToFavorite = function(selectedShow, myShow) {
    var favorite = {
                myOffer : { 'selectedShow' : selectedShow, 'myShow' : myShow, 'myEmail': this.currentUser.email },
                theirOffer : { 'selectedShow' : myShow, 'myShow' : selectedShow, 'theirEmail' : this.currentUser.email}
              };
    console.log(favorite);
    $http.patch(constant.url + 'favorite_show', favorite)
    .success(function(data){
      console.log(data);
    }).catch(function(error){
      console.log(error);
    });
  };
  this.getPendingOffer = function(){
    return $http.get(constant.url + 'get_pending_offer');
  };
});

app.controller('ListingsCtrl', function($scope, listingsService) {
  console.log('listings');
  listingsService.getCurrentUser()
  .success(function(currentUser){
    listingsService.currentUser = currentUser;
    $scope.myShows = currentUser.events;
  }).catch(function(error){
    console.log(error);
  });

  listingsService.getEvents()
  .success(function (listingsEvents) {
    console.log(listingsEvents);
    var showEvents = [];
    listingsEvents.forEach(function(users){
      var userName = users.userName;
      var email = users.email;
      users.events.forEach(function(item){
        item.userName = userName;
        item.email = email;

        showEvents.push(item);
      });
    });
    console.log(showEvents);
    $scope.showEvents = showEvents;
  }).catch(function(error) {
    console.log(error);
  });

  $scope.selectedShow = listingsService.selectedFavoriteShow;

  $scope.addingShow = function(addShow) {
    $scope.addShow = '';
    listingsService.addShow(addShow);
  };

  $scope.addingComment = function(addComment) {
    $scope.addComment = '';
    listingsService.addComment(addComment);
  };
  $scope.selectedFavoriteShow = function(selectedFavoriteShow) {
    listingsService.selectedFavoriteShow = selectedFavoriteShow;
  };

  $scope.hideFavoriteButton = function(show) {
    return listingsService.currentUser.email === show.email;
  };

  $scope.offerToFavorite = function(selectedShow, myShow) {
    listingsService.offerToFavorite(selectedShow, myShow);
  };
});

app.controller('ShowCTRL', function($scope, listingsService, $state){
  listingsService.updateEvents()
    .success(function(currentUser){
      listingsService.currentUser = currentUser;
      $scope.myShows = currentUser.events;
    }).catch(function(error){
      console.log(error);
    });

  $scope.deleteShow = function(show) {
    listingsService.deleteShow(show);
    $state.reload();
  };

  $scope.editingLink = function(show){
    listingsService.selectEditShowId = show._id;
  };
  $scope.editingShow = function(changedShowValue){
    listingsService.editingShow(changedShowValue);
  };
});

app.controller('PendingCtrl', function($scope, listingsService) {
  listingsService.getPendingOffer()
  .success(function(pendingOffer){
    console.log(pendingOffer);
    $scope.favoriteOffers = pendingOffer;
  }).catch(function(error){
    console.log(error);
  });
});
