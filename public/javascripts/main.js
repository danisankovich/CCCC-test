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
    .state('trade', {
      url: '/trade',
      templateUrl: 'views/trade.ejs',
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
    })
    .state('pending', {
      url: '/pending',
      templateUrl: 'views/pending.ejs',
      controller: 'PendingCtrl'
    });
}]);

app.service('listingsService', function($http, constant) {
  var thisService = this;
  this.currentUser = null;
  this.selectEditShowId = null;
  this.selectedTradeShow = null;
  this.addShow = function(addShow) {
    $http.post(constant.url + 'add_show', addShow)
      .success(function(data) {
        thisService.getCurrentUser();
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

  this.getMarketInventory = function() {
    return $http.get(constant.url + 'markeplace_inventory');
  };

  this.updateInventory = function() {
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
  this.offerToTrade = function(selectedShow, myShow) {
    var trade = {
                myOffer : { 'selectedShow' : selectedShow, 'myShow' : myShow, 'myEmail': this.currentUser.email },
                theirOffer : { 'selectedShow' : myShow, 'myShow' : selectedShow, 'theirEmail' : this.currentUser.email}
              };
    console.log(trade);
    $http.patch(constant.url + 'trade_show', trade)
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
    $scope.myShows = currentUser.inventory;
  }).catch(function(error){
    console.log(error);
  });

  listingsService.getMarketInventory()
  .success(function (listingsInventory) {
    console.log(listingsInventory);
    var showInventory = [];
    listingsInventory.forEach(function(users){
      var userName = users.userName;
      var email = users.email;
      users.inventory.forEach(function(item){
        item.userName = userName;
        item.email = email;

        showInventory.push(item);
      });
    });
    console.log(showInventory);
    $scope.showInventory = showInventory;
  }).catch(function(error) {
    console.log(error);
  });

  $scope.selectedShow = listingsService.selectedTradeShow;

  $scope.addingShow = function(addShow) {
    $scope.addShow = '';
    listingsService.addShow(addShow);
  };
  $scope.selectedTradeShow = function(selectedTradeShow) {
    listingsService.selectedTradeShow = selectedTradeShow;
  };

  $scope.hideTradeButton = function(show) {
    return listingsService.currentUser.email === show.email;
  };

  $scope.offerToTrade = function(selectedShow, myShow) {
    listingsService.offerToTrade(selectedShow, myShow);
  };
});

app.controller('ShowCTRL', function($scope, listingsService, $state){
  listingsService.updateInventory()
    .success(function(currentUser){
      listingsService.currentUser = currentUser;
      $scope.myShows = currentUser.inventory;
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
    $scope.tradeOffers = pendingOffer;
  }).catch(function(error){
    console.log(error);
  });
});
