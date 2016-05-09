// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('taskmanager', ['ionic'])

.run(function ($ionicPlatform) {
	$ionicPlatform.ready(function () {
		// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
		// for form inputs)
		if (window.cordova && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
		}
		if (window.StatusBar) {
			StatusBar.styleDefault();
		}
	});
})

.factory('Categories', function () {
	return {
		all: function () {
			var categoryString = window.localStorage['categories'];
			if (categoryString) {
				return angular.fromJson(categoryString);
			}
			return [];
		},
		save: function (categories) {
			window.localStorage['categories'] = angular.toJson(categories);
		},
		newCategory: function (categoryTitle) {
			// Add Category
			return {
				title: categoryTitle,
				tasks: []
			};
		},

		removeNullObjects: function (categories, index) {
			//console.log(categories, index);
			return categories.splice(index, 1);
		},

		getLastActiveIndex: function () {
			return parseInt(window.localStorage['lastActiveCategory']) || 0
		},
		setLastActiveIndex: function (index) {
			window.localStorage['lastActiveCategory'] = index;
		}
	}
})

.controller('TaskCtrl', function ($scope, $timeout, $ionicModal, Categories, $ionicSideMenuDelegate) {
	var createCategory = function (categoryTitle) {
		var newCategory = Categories.newCategory(categoryTitle);
		$scope.categories.push(newCategory);
		Categories.save($scope.categories);
		$scope.selectCategory(newCategory, $scope.categories.length - 1);
	}

	$scope.categories = Categories.all();

	$scope.activeCategory = $scope.categories[Categories.getLastActiveIndex()];

	$scope.newCategory = function () {
		var categoryTitle = prompt('New Category name (i.e. ShoppingList, Personal, Business)');
		if (categoryTitle) {
			createCategory(categoryTitle);
		}
	}

	$scope.selectCategory = function (category, index) {
		$scope.activeCategory = category;
		Categories.setLastActiveIndex(index);
		$ionicSideMenuDelegate.toggleLeft(false);
	}

	$scope.removeCategory = function (category, index) {
		//console.log(category, index);
		if (!$scope.activeCategory) {
			return;
		}
		$scope.activeCategory = category;
		Categories.setLastActiveIndex(index);
		var deletePrompt = prompt('Type OK to delete. This will remove ALL associated tasks!');
		if (deletePrompt) {
			for (i = 0; i < $scope.activeCategory.tasks.length; i++) {
				$scope.activeCategory.tasks.splice(i);
				Categories.save($scope.categories);
			}
			delete $scope.categories[index];
			Categories.removeNullObjects($scope.categories, index);
			Categories.setLastActiveIndex(0);
			Categories.save($scope.categories);
		}
		$ionicSideMenuDelegate.toggleLeft(false);
	}

	$scope.moveTask = function (task, fromIndex, toIndex) {
		if (!$scope.activeCategory || !task) {
			return;
		}
		//console.log('moveTask ' + $scope.activeCategory.tasks, fromIndex, toIndex);
		$scope.activeCategory.tasks.splice(fromIndex, 1);
		$scope.activeCategory.tasks.splice(toIndex, 0, task);
		Categories.save($scope.categories);
	}

	// Load Modal
	$ionicModal.fromTemplateUrl('new-task.html', function (modal) {
		$scope.taskModal = modal;
	}, {
		scope: $scope,
		animation: 'slide-in-up'
	});

	$scope.createTask = function (task) {
		if (!$scope.activeCategory || !task) {
			return;
		}

		$scope.activeCategory.tasks.push({
			title: task.title
		});

		$scope.taskModal.hide();

		// Save Task
		Categories.save($scope.categories);

		task.title = "";
	}

	$scope.removeTask = function (task) {
		for (i = 0; i < $scope.activeCategory.tasks.length; i++) {
			if ($scope.activeCategory.tasks[i].title == task.title) {
				$scope.activeCategory.tasks.splice(i, 1);
				Categories.save($scope.categories);
			}
		}
	}

	$scope.newTask = function () {
		$scope.taskModal.show();
	}

	$scope.closeNewTask = function () {
		$scope.taskModal.hide();
	}

	$scope.toggleCategories = function () {
		$ionicSideMenuDelegate.toggleLeft();
	}

	$timeout(function () {
		if ($scope.categories.length == 0) {
			while (true) {
				var categoryTitle = prompt('Please Create A Category');
				if (categoryTitle) {
					createCategory(categoryTitle);
					break;
				}
			}
		}
	});

});
