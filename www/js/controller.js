angular.module('starter.controllers', [])
    .controller('LoginCtrl', ['$scope', '$state', 'UserService', '$ionicHistory',
        function($scope, $state, UserService, $ionicHistory, $window) {
            $scope.user = {};
            $scope.title = 'Login';
            $scope.loginSubmitForm = function(form) {
                if (form.$valid) {
                    UserService.login($scope.user)
                        .then(function(response) {
                            if (response.status === 200) {
                                //Should return a token
                                console.log(response);
                                $window.localStorage["userID"] = response.data.userId;
                                $window.localStorage['token'] = response.data.id;
                                $ionicHistory.nextViewOptions({
                                    historyRoot: true,
                                    disableBack: true
                                });
                                $state.go('lobby');
                            }
                            else {
                                // invalid response
                                alert("Something went wrong, try again.");
                            }
                        }, function(response) {
                            // Code 401 corresponds to Unauthorized access, in this case, the email/password combination was incorrect.
                            if (response.status === 401) {
                                alert("Incorrect username or password");
                            }
                            else if (response.data === null) {
                                //If the data is null, it means there is no internet connection.
                                alert("The connection with the server was unsuccessful, check your internet connection and try again later.");
                            }
                            else {
                                alert("Something went wrong, try agai./mongodn.");
                            }
                        });
                }
            };
        }
    ])

//

.controller('RegisterCtrl', ['$scope', '$state', 'UserService', '$ionicHistory',
        function($scope, $state, UserService, $ionicHistory, $window) {
            $scope.user = {};
            $scope.repeatPassword = {};

            $scope.signupForm = function(form) {
                if (form.$valid) {
                    if ($scope.user.password !== $scope.user.repeatPassword) {
                        alert("Something went wrong, try again.");

                    }
                    else {
                        UserService.create($scope.user)
                            .then(function(response) {
                                if (response.status === 200) {
                                    loginAfterRegister();
                                }
                                else {
                                    //invalid response
                                    console.log(response);
                                    alert("something went wrong, try again.");
                                }
                            }, function(response) {

                                console.log(response);
                                //status 422 in this case corresponds to the email already registered to the DB
                                if (response.status === 422) {
                                    alert("The email is already taken.");
                                }
                                else if (response.data === null) {
                                    //If the data is null, it means there is no internet connection.
                                    alert("The connection with the server was unsuccessful, check your internet connection and try again later.");
                                }
                                else {
                                    alert("Something went wrong, try again.");
                                }
                            });
                    }


                }
            };
            //Required to get the access token
            function loginAfterRegister() {
                UserService.login($scope.user)
                    .then(function(response) {
                        if (response.status === 200) {
                            //Should return a token
                            $window.localStorage["userID"] = response.data.userId;
                            $window.localStorage['token'] = response.data.id;
                            $ionicHistory.nextViewOptions({
                                historyRoot: true,
                                disableBack: true
                            });
                            $state.go('lobby');
                        }
                        else {
                            // invalid response
                            $state.go('landing');
                        }
                    }, function(response) {
                        // something went wrong
                        console.log(response);
                        $state.go('landing');
                    });
            }

        }

    ])
    .controller('LobbyCtrl', ['$scope', '$state', '$ionicHistory', 'UserService', '$window', 'ServerQuestionService', 'TKQuestionsService',
            function($scope, $state, $ionicHistory, UserService, $window, ServerQuestionService, TKQuestionsService) {
                $scope.logout = function() {
                    UserService.logout($window.localStorage.token)
                        .then(function(response) {
                            //The successful code for logout is 204
                            if (response.status === 204) {
                                $ionicHistory.nextViewOptions({
                                    historyRoot: true,
                                    disableBack: true
                                });
                                $state.go('landing');
                            }
                            else {
                                alert("Could not logout at this moment, try again.");
                            }
                        }, function(response) {
                            alert("Could not logout at this moment, try again.");
                        });
                    //Get Questions Initially if they are not already stored
                    if (TKQuestionsService.questionsLength() === 0)
                        getQuestions();

                    function getQuestions() {
                        ServerQuestionService.all($window.localStorage['token'])
                            .then(function(response) {
                                if (response.status === 200) {
                                    var questions = response.data;
                                    TKQuestionsService.setQuestions(questions);
                                }
                                else {
                                    // invalid response
                                    confirmPrompt();
                                }
                            }, function(response) {
                                // something went wrong
                                confirmPrompt();
                            });
                    }

                    function confirmPrompt() {
                        var response = confirm("The questions could not be retrieved at this time, do you want to try again?");
                        if (response == true) {
                            getQuestions();
                        }
                    }
                    $scope.takeTestButtonTapped = function() {
                        if (TKQuestionsService.questionsLength() === 0)
                            getQuestions();
                        else {
                            $state.go('test.detail', {
                                testID: 1
                            });
                        }
                    };
                };
            }
        ]

        .controller('TestCtrl', ['$scope', 'testInfo', '$stateParams', '$state', '$window', 'TKQuestionsService', 'TKAnswersService', 'ServerAnswersService', '$ionicHistory',
            function($scope, testInfo, $stateParams, $state, $window, TKQuestionsService, TKAnswersService, ServerAnswersService, $ionicHistory) {
                //testInfo is passed in the router to obtain the questions
                var qNumber = $stateParams.testID;
                $scope.title = "Question #" + qNumber;
                testInfo.forEach(function(infoDict) {
                    if (infoDict.Answer_ID === "A")
                        $scope.questionA = infoDict;
                    if (infoDict.Answer_ID === "B")
                        $scope.questionB = infoDict;
                });
                $scope.buttonClicked = function(option) {
                    var category = $scope["question" + option].Style;
                    TKAnswersService.saveAnswer(qNumber, category, option);

                    var nextqNumber = Number(qNumber) + 1;
                    if (nextqNumber > 30) {
                        performRequest();
                    }
                    else {
                        $state.go('test.detail', {
                            testID: nextqNumber
                        });
                    }
                };

                function performRequest() {
                    var answersDict = TKAnswersService.getAnswers();
                    answersDict["userID"] = $window.localStorage['userID'];
                    var date = new Date();
                    answersDict["createDate"] = date.toUTCString();
                    ServerAnswersService.create(answersDict, $window.localStorage['token'])
                        .then(function(response) {
                            if (response.status === 200) {
                                $ionicHistory.nextViewOptions({
                                    disableBack: true
                                });
                                $state.go('results');
                            }
                            else {
                                // invalid response
                                confirmPrompt();
                            }
                        }, function(response) {
                            // something went wrong
                            confirmPrompt();
                        });
                }

                function confirmPrompt() {
                    var response = confirm("The answers could not be saved at the moment, do you want to try again?");
                    if (response == true) {
                        performRequest();
                    }
                    else {
                        $ionicHistory.nextViewOptions({
                            disableBack: true
                        });
                        $state.go('results');
                    }
                }
            }
        ])
        .controller('ResultsCtrl', ['$scope', 'TKAnswersService', '$ionicHistory', '$state',
            function($scope, TKAnswersService, $ionicHistory, $state) {
                $scope.menuButtonTapped = function()
{        
     $ionicHistory.nextViewOptions({
         historyRoot: true,
         disableBack: true
     });
     $state.go('lobby');
};
            }
        ])
    );
