"use strict";

angular.module("homeuiApp")
  .controller("ConfigCtrl", function ($scope, $routeParams, $timeout, ConfigEditorProxy, whenMqttReady, gotoDefStart, $location, PageState, errors) {
    $scope.file = {
      path: $routeParams.path,
      loaded: false,
      valid: true,
      content: {}
    };
    if (!/^\//.test($scope.file.path))
      $scope.file.path = "/" + $scope.file.path;

    $scope.canSave = function () {
      return PageState.isDirty() && $scope.file.valid;
    };

    $scope.onChange = function (content, errors) {
      if (!angular.equals($scope.file.content, content)) {
        PageState.setDirty(true);
        $scope.file.content = content;
      }
      $scope.file.valid = !errors.length;
    };

    $scope.save = function () {
      PageState.setDirty(false);
      ConfigEditorProxy.Save({ path: $scope.file.path, content: $scope.file.content })
        .catch(function (e) {
          PageState.setDirty(true);
          errors.showError("Error saving " + $scope.file.path, e);
        });
    };

    whenMqttReady().then(function () {
      return ConfigEditorProxy.Load({ path: $scope.file.path });
    }).then(function (r) {
      $scope.file.content = r.content;
      $scope.file.schema = r.schema;
      $scope.file.loaded = true;
    }).catch(errors.catch("Error loading the file"));
  });
