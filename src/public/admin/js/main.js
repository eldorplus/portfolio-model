var app=angular.module("ng-portfolio",["ui.router","ui.bootstrap","ngTable"]);app.config(function($httpProvider){$httpProvider.defaults.headers.common["X-Requested-With"]="XMLHttpRequest"});app.config(function($stateProvider,$urlRouterProvider){$urlRouterProvider.otherwise("/dashboard");$stateProvider.state("dashboard",{url:"/dashboard",templateUrl:"/vendor/portfolio/admin/views/dashboard.html",controller:"DashboardController"}).state("project",{url:"/project",templateUrl:"/vendor/portfolio/admin/views/project/project.html"}).state("project.index",{url:"/index",templateUrl:"/vendor/portfolio/admin/views/project/project.index.html",controller:"ProjectController"}).state("project.create",{url:"/create",templateUrl:"/vendor/portfolio/admin/views/project/project.edit.html",controller:"ProjectCreateController"}).state("project.edit",{url:"/:id/edit",templateUrl:"/vendor/portfolio/admin/views/project/project.edit.html",controller:"ProjectEditController"}).state("project-section",{url:"/project/:id/section",templateUrl:"/vendor/portfolio/admin/views/project/project.section.index.html",controller:"ProjectSectionController"}).state("section-edit",{url:"/section/:id/edit",templateUrl:"/vendor/portfolio/admin/views/section/section.edit.html",controller:"SectionEditController"})});app.factory("RestfulApi",function($http,messageBag){var checkResponseCode=function(data,status){switch(status){case 422:console.log("Model validation error");console.log(data);break;case 401:console.log("You have been logged out. Refresh the page to log back in again");break;case 500:console.log("API Error");break;default:console.log("Some other problem!");console.log(data)}};return{getRoute:function(resource,method,id){if(typeof id==="undefined"){id="0"}var prefix="/admin/api";var routes={project:{index:prefix+"/project",show:prefix+"/project/"+id,store:prefix+"/project/",update:prefix+"/project/"+id,destroy:prefix+"/project/"+id},section:{index:prefix+"/section",show:prefix+"/section/"+id,store:prefix+"/section/",update:prefix+"/section/"+id,destroy:prefix+"/section/"+id}};return routes[resource][method]},success:function(data,status,headers,config){console.log("API Request successful")},error:function(data,status,headers,config){checkResponseCode(data,status);return data}}});app.factory("messageBag",function($http){var ApiError=function(){};return{success:function(data,status,headers,config){console.log(data);if(status==401){$scope.errors=[{"Logged out":"You have been logged out. Refresh the page to log back in again"}]}else{$scope.errors=data}}}});app.controller("DashboardController",function($scope,$http,$stateParams){});app.controller("ProjectController",function($scope,$filter,ngTableParams,$http,RestfulApi){$scope.data=[];$scope.tableParams=new ngTableParams({page:1,count:10,sorting:{updated_at:"desc"}},{filterDelay:10,total:$scope.data.length,getData:function($defer,params){var filteredData=params.filter()?$filter("filter")($scope.data,params.filter()):$scope.data;var orderedData=params.sorting()?$filter("orderBy")(filteredData,params.orderBy()):$scope.data;params.total(orderedData.length);$defer.resolve(orderedData.slice((params.page()-1)*params.count(),params.page()*params.count()))}});$scope.init=function(){$http.get(RestfulApi.getRoute("project","index")).success(function(data,status,headers,config){RestfulApi.success(data,status,headers,config);$scope.data=data;$scope.tableParams.reload()}).error(function(data,status,headers,config){RestfulApi.error(data,status,headers,config)})};$scope.delete=function(id){$http.delete("/admin/api/project/"+id).success(function(data,status,headers,config){$scope.init()}).error(function(data,status,headers,config){$scope.errors=data})};$scope.init()});app.controller("ProjectCreateController",function($scope,$http,$stateParams,$location,RestfulApi){$scope.data={};$scope.save=function(){$http.post(RestfulApi.getRoute("project","create"),$scope.data).success(function(data,status,headers,config){$location.path("/project")}).error(function(data,status,headers,config){RestfulApi.error(data,status,headers,config)})}});app.controller("ProjectEditController",function($scope,$http,$stateParams,$location,RestfulApi){$scope.data={};$http.get(RestfulApi.getRoute("project","show",$stateParams.id)).success(function(data,status,headers,config){$scope.data=data}).error(function(data,status,headers,config){if(status==401){$scope.errors=[{"Logged out":"You have been logged out. Refresh the page to log back in again"}]}else{$scope.errors=data}});$scope.addSection=function(){$scope.data.sections.push({})};$scope.deleteSection=function(index){$scope.data.sections.splice(index,1)};$scope.save=function(){$http.put(RestfulApi.getRoute("project","update",$stateParams.id),$scope.data).success(function(data,status,headers,config){$location.path("/project/index")}).error(function(data,status,headers,config){$scope.errors=RestfulApi.error(data,status,headers,config)})}});app.controller("ProjectSectionController",function($scope,$filter,ngTableParams,$http,$route,$routeParams,$location){$scope.data=[];$scope.tableParams=new ngTableParams({page:1,count:10,sorting:{created_at:"desc"}},{filterDelay:10,total:$scope.data.length,getData:function($defer,params){var filteredData=params.filter()?$filter("filter")($scope.data,params.filter()):$scope.data;var orderedData=params.sorting()?$filter("orderBy")(filteredData,params.orderBy()):$scope.data;params.total(orderedData.length);$defer.resolve(orderedData.slice((params.page()-1)*params.count(),params.page()*params.count()))}});$scope.init=function(){console.log($routeParams.project_id);$http.get("/admin/api/project/"+$routeParams.project_id+"/section").success(function(data,status,headers,config){$scope.data=data;angular.forEach(data,function(data){data.id=parseFloat(data.id)});$scope.tableParams.reload()}).error(function(data,status,headers,config){console.log(status);if(status==401){$scope.errors=[{"Logged out":"You have been logged out. Refresh the page to log back in again"}]}else{$scope.errors=data}})};$scope.delete=function(id){$http.delete("/admin/api/project/"+id).success(function(data,status,headers,config){$scope.init()}).error(function(data,status,headers,config){$scope.errors=data})};$scope.init()});app.controller("SectionCreateController",function($scope,$http,$route,$routeParams,$location){$scope.data={};$scope.save=function(){$http.post("/admin/api/project",$scope.data).success(function(data,status,headers,config){$location.path("/project")}).error(function(data,status,headers,config){if(status==401){$scope.errors=[{"Logged out":"You have been logged out. Refresh the page to log back in again"}]}else{$scope.errors=data}})}});app.controller("SectionEditController",function($scope,$http,$route,$routeParams,$location){$scope.data={};$http.get("/admin/api/section/"+$routeParams.id).success(function(data,status,headers,config){$scope.data=data}).error(function(data,status,headers,config){if(status==401){$scope.errors=[{"Logged out":"You have been logged out. Refresh the page to log back in again"}]}else{$scope.errors=data}});$scope.addSection=function(){$scope.data.sections.push({})};$scope.deleteSection=function(index){$scope.data.sections.splice(index,1)};$scope.save=function(){$http.put("/admin/api/section/"+$routeParams.id,$scope.data).success(function(data,status,headers,config){$location.path("/project/"+data.attachment_id+"/section")}).error(function(data,status,headers,config){if(status==401){$scope.errors=[{"Logged out":"You have been logged out. Refresh the page to log back in again"}]}else{$scope.errors=data}})}});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9wdWJsaWMvYWRtaW4vanMvbWFpbi5qcyJdLCJuYW1lcyI6WyJhcHAiLCJhbmd1bGFyIiwibW9kdWxlIiwiY29uZmlnIiwiJGh0dHBQcm92aWRlciIsImRlZmF1bHRzIiwiaGVhZGVycyIsImNvbW1vbiIsIiRzdGF0ZVByb3ZpZGVyIiwiJHVybFJvdXRlclByb3ZpZGVyIiwib3RoZXJ3aXNlIiwic3RhdGUiLCJ1cmwiLCJ0ZW1wbGF0ZVVybCIsImNvbnRyb2xsZXIiLCJmYWN0b3J5IiwiJGh0dHAiLCJtZXNzYWdlQmFnIiwiY2hlY2tSZXNwb25zZUNvZGUiLCJkYXRhIiwic3RhdHVzIiwiY29uc29sZSIsImxvZyIsImdldFJvdXRlIiwicmVzb3VyY2UiLCJtZXRob2QiLCJpZCIsInByZWZpeCIsInJvdXRlcyIsInByb2plY3QiLCJpbmRleCIsInNob3ciLCJzdG9yZSIsInVwZGF0ZSIsImRlc3Ryb3kiLCJzZWN0aW9uIiwic3VjY2VzcyIsImVycm9yIiwiQXBpRXJyb3IiLCIkc2NvcGUiLCJlcnJvcnMiLCJMb2dnZWQgb3V0IiwiJHN0YXRlUGFyYW1zIiwiJGZpbHRlciIsIm5nVGFibGVQYXJhbXMiLCJSZXN0ZnVsQXBpIiwidGFibGVQYXJhbXMiLCJwYWdlIiwiY291bnQiLCJzb3J0aW5nIiwidXBkYXRlZF9hdCIsImZpbHRlckRlbGF5IiwidG90YWwiLCJsZW5ndGgiLCJnZXREYXRhIiwiJGRlZmVyIiwicGFyYW1zIiwiZmlsdGVyZWREYXRhIiwiZmlsdGVyIiwib3JkZXJlZERhdGEiLCJvcmRlckJ5IiwicmVzb2x2ZSIsInNsaWNlIiwiaW5pdCIsImdldCIsInJlbG9hZCIsImRlbGV0ZSIsIiRsb2NhdGlvbiIsInNhdmUiLCJwb3N0IiwicGF0aCIsImFkZFNlY3Rpb24iLCJzZWN0aW9ucyIsInB1c2giLCJkZWxldGVTZWN0aW9uIiwic3BsaWNlIiwicHV0IiwiJHJvdXRlIiwiJHJvdXRlUGFyYW1zIiwiY3JlYXRlZF9hdCIsInByb2plY3RfaWQi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QyxHQUFJaUIsUUFBVSxJQUFLLENBQ2ZtQixPQUFPQyxTQUFXQyxhQUFlLHdFQUM5QixDQUNIRixPQUFPQyxPQUFTckIsVUFRcENuQixLQUFJYyxXQUFXLHdCQUF5QixTQUFTeUIsT0FBUXZCLE1BQU82RCxPQUFRQyxhQUFjWCxXQUVsRjVCLE9BQU9wQixPQUVQSCxPQUFNZ0QsSUFBSSxzQkFBd0JjLGFBQWFwRCxJQUMzQ1UsUUFBUSxTQUFTakIsS0FBTUMsT0FBUWQsUUFBU0gsUUFDcENvQyxPQUFPcEIsS0FBT0EsT0FFbEJrQixNQUFNLFNBQVNsQixLQUFNQyxPQUFRZCxRQUFTSCxRQUNsQyxHQUFJaUIsUUFBVSxJQUFLLENBQ2ZtQixPQUFPQyxTQUFXQyxhQUFlLHdFQUM5QixDQUNIRixPQUFPQyxPQUFTckIsT0FLNUJvQixRQUFPZ0MsV0FBYSxXQUVoQmhDLE9BQU9wQixLQUFLcUQsU0FBU0MsU0FJekJsQyxRQUFPbUMsY0FBZ0IsU0FBUzVDLE9BRTVCUyxPQUFPcEIsS0FBS3FELFNBQVNHLE9BQU83QyxNQUFPLEdBS3ZDUyxRQUFPNkIsS0FBTyxXQUVWcEQsTUFBTTRELElBQUksc0JBQXdCRSxhQUFhcEQsR0FBSWEsT0FBT3BCLE1BQ3REaUIsUUFBUSxTQUFTakIsS0FBTUMsT0FBUWQsUUFBU0gsUUFHcENnRSxVQUFVRyxLQUFNLFlBQWNuRCxLQUFLZ0UsY0FBZ0IsY0FFdkQ5QyxNQUFNLFNBQVNsQixLQUFNQyxPQUFRZCxRQUFTSCxRQUNsQyxHQUFJaUIsUUFBVSxJQUFLLENBQ2ZtQixPQUFPQyxTQUFXQyxhQUFlLHdFQUM5QixDQUNIRixPQUFPQyxPQUFTckIiLCJmaWxlIjoic3JjL3B1YmxpYy9hZG1pbi9qcy9tYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gRmlyZSB1cCB0aGUgYXBwXG52YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ25nLXBvcnRmb2xpbycsIFsndWkucm91dGVyJywgJ3VpLmJvb3RzdHJhcCcsICduZ1RhYmxlJ10pO1xuXG4vLyBDb25maWd1cmUgQW5ndWxhclxuXG4vKiBhcHAuY29uZmlnKGZ1bmN0aW9uKCRpbnRlcnBvbGF0ZVByb3ZpZGVyKSB7XG4gICAgLy8gU2V0IEFuZ3VsYXIgdG8gdXNlIHNxdWFyZS1icmFja2V0cyBpbnN0ZWFkIG9mIGN1cmx5IC0gYSB3b3JrIGFyb3VuZCB0byBwbGF5IG5pY2Ugd2l0aCBMYXJhdmVsIEJsYWRlIHRlbXBsYXRlc1xuICAgICRpbnRlcnBvbGF0ZVByb3ZpZGVyLnN0YXJ0U3ltYm9sKCd7eycpO1xuICAgICRpbnRlcnBvbGF0ZVByb3ZpZGVyLmVuZFN5bWJvbCgnfX0nKTtcbn0pOyAqL1xuXG5hcHAuY29uZmlnKGZ1bmN0aW9uKCRodHRwUHJvdmlkZXIpIHtcbiAgICAvLyBBZGQgdGhlIFhNTEh0dHBSZXF1ZXN0IGhlYWRlciBzbyB0aGF0IExhcmF2ZWwgY2FuIHRlbGwgYXBhcnQgQUpBWCByZXF1ZXN0c1xuICAgICRodHRwUHJvdmlkZXIuZGVmYXVsdHMuaGVhZGVycy5jb21tb25bXCJYLVJlcXVlc3RlZC1XaXRoXCJdID0gXCJYTUxIdHRwUmVxdWVzdFwiO1xufSk7XG5cblxuLy8gU2V0dXAgdGhlIHN0YXRlIG1hbmFnZXIgKFJvdXRlcilcbmFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcikge1xuXG4gIC8vIEZvciBhbnkgdW5tYXRjaGVkIHVybCwgcmVkaXJlY3QgdG8gL3N0YXRlMVxuICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKFwiL2Rhc2hib2FyZFwiKTtcblxuICAvLyR1cmxSb3V0ZXJQcm92aWRlci53aGVuKCcvcHJvamVjdCcsICcvcHJvamVjdC9pbmRleCcpO1xuXG4gIC8vIE5vdyBzZXQgdXAgdGhlIHN0YXRlc1xuICAkc3RhdGVQcm92aWRlclxuICAgIC5zdGF0ZSgnZGFzaGJvYXJkJywge1xuICAgICAgdXJsOiBcIi9kYXNoYm9hcmRcIixcbiAgICAgIHRlbXBsYXRlVXJsOiBcIi92ZW5kb3IvcG9ydGZvbGlvL2FkbWluL3ZpZXdzL2Rhc2hib2FyZC5odG1sXCIsXG4gICAgICBjb250cm9sbGVyOiBcIkRhc2hib2FyZENvbnRyb2xsZXJcIlxuICAgIH0pXG4gICAgLnN0YXRlKCdwcm9qZWN0Jywge1xuICAgICAgdXJsOiBcIi9wcm9qZWN0XCIsXG4gICAgICB0ZW1wbGF0ZVVybDogXCIvdmVuZG9yL3BvcnRmb2xpby9hZG1pbi92aWV3cy9wcm9qZWN0L3Byb2plY3QuaHRtbFwiLFxuICAgIH0pXG4gICAgLnN0YXRlKCdwcm9qZWN0LmluZGV4Jywge1xuICAgICAgdXJsOiBcIi9pbmRleFwiLFxuICAgICAgdGVtcGxhdGVVcmw6IFwiL3ZlbmRvci9wb3J0Zm9saW8vYWRtaW4vdmlld3MvcHJvamVjdC9wcm9qZWN0LmluZGV4Lmh0bWxcIixcbiAgICAgIGNvbnRyb2xsZXI6IFwiUHJvamVjdENvbnRyb2xsZXJcIlxuICAgIH0pXG4gICAgLnN0YXRlKCdwcm9qZWN0LmNyZWF0ZScsIHtcbiAgICAgIHVybDogXCIvY3JlYXRlXCIsXG4gICAgICB0ZW1wbGF0ZVVybDogXCIvdmVuZG9yL3BvcnRmb2xpby9hZG1pbi92aWV3cy9wcm9qZWN0L3Byb2plY3QuZWRpdC5odG1sXCIsXG4gICAgICBjb250cm9sbGVyOiBcIlByb2plY3RDcmVhdGVDb250cm9sbGVyXCJcbiAgICB9KVxuICAgIC5zdGF0ZSgncHJvamVjdC5lZGl0Jywge1xuICAgICAgdXJsOiBcIi86aWQvZWRpdFwiLFxuICAgICAgdGVtcGxhdGVVcmw6IFwiL3ZlbmRvci9wb3J0Zm9saW8vYWRtaW4vdmlld3MvcHJvamVjdC9wcm9qZWN0LmVkaXQuaHRtbFwiLFxuICAgICAgY29udHJvbGxlcjogXCJQcm9qZWN0RWRpdENvbnRyb2xsZXJcIlxuICAgIH0pXG4gICAgLnN0YXRlKCdwcm9qZWN0LXNlY3Rpb24nLCB7XG4gICAgICB1cmw6IFwiL3Byb2plY3QvOmlkL3NlY3Rpb25cIixcbiAgICAgIHRlbXBsYXRlVXJsOiBcIi92ZW5kb3IvcG9ydGZvbGlvL2FkbWluL3ZpZXdzL3Byb2plY3QvcHJvamVjdC5zZWN0aW9uLmluZGV4Lmh0bWxcIixcbiAgICAgIGNvbnRyb2xsZXI6IFwiUHJvamVjdFNlY3Rpb25Db250cm9sbGVyXCJcbiAgICB9KVxuICAgIC5zdGF0ZSgnc2VjdGlvbi1lZGl0Jywge1xuICAgICAgdXJsOiBcIi9zZWN0aW9uLzppZC9lZGl0XCIsXG4gICAgICB0ZW1wbGF0ZVVybDogXCIvdmVuZG9yL3BvcnRmb2xpby9hZG1pbi92aWV3cy9zZWN0aW9uL3NlY3Rpb24uZWRpdC5odG1sXCIsXG4gICAgICBjb250cm9sbGVyOiBcIlNlY3Rpb25FZGl0Q29udHJvbGxlclwiXG4gICAgfSk7XG59KTtcblxuXG4vLyBTb21lIGhlbHBmdWwgZnVuY3Rpb25zIGZvciBBSkFYIHJlcXVlc3RzXG5hcHAuZmFjdG9yeSgnUmVzdGZ1bEFwaScsIGZ1bmN0aW9uICgkaHR0cCwgbWVzc2FnZUJhZykge1xuXG4gICAgLy8gV290IHRvIGRvIGluY2FzZSBBUEkgZmFpbHMgdG8gcmVzcG9uZCB3aXRoIDIwMFxuICAgIHZhciBjaGVja1Jlc3BvbnNlQ29kZSA9IGZ1bmN0aW9uKGRhdGEsIHN0YXR1cykge1xuICAgICAgICBzd2l0Y2goc3RhdHVzKSB7XG4gICAgICAgICAgICAvLyBVbmF1dGhlbnRpY2F0ZWRcbiAgICAgICAgICAgIGNhc2UgNDIyOlxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiTW9kZWwgdmFsaWRhdGlvbiBlcnJvclwiKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIC8vIFVuYXV0aGVudGljYXRlZFxuICAgICAgICAgICAgY2FzZSA0MDE6XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJZb3UgaGF2ZSBiZWVuIGxvZ2dlZCBvdXQuIFJlZnJlc2ggdGhlIHBhZ2UgdG8gbG9nIGJhY2sgaW4gYWdhaW5cIik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDUwMDpcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkFQSSBFcnJvclwiKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJTb21lIG90aGVyIHByb2JsZW0hXCIpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcblxuICAgICAgICAvLyBSZXR1cm5zIHRoZSBzdHJpbmcgb2YgYSBwYXJ0aWN1bGFyIHJvdXRlXG4gICAgICAgIGdldFJvdXRlOiBmdW5jdGlvbihyZXNvdXJjZSwgbWV0aG9kLCBpZCkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBpZCA9PT0gJ3VuZGVmaW5lZCcpIHsgaWQgPSAnMCc7IH1cblxuICAgICAgICAgICAgdmFyIHByZWZpeCA9ICcvYWRtaW4vYXBpJztcblxuICAgICAgICAgICAgdmFyIHJvdXRlcyA9IHtcbiAgICAgICAgICAgICAgICBwcm9qZWN0ICAgICA6ICB7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4ICAgOiBwcmVmaXggKyAnL3Byb2plY3QnLFxuICAgICAgICAgICAgICAgICAgICBzaG93ICAgIDogcHJlZml4ICsgJy9wcm9qZWN0LycgKyBpZCxcbiAgICAgICAgICAgICAgICAgICAgc3RvcmUgICA6IHByZWZpeCArICcvcHJvamVjdC8nLFxuICAgICAgICAgICAgICAgICAgICB1cGRhdGUgIDogcHJlZml4ICsgJy9wcm9qZWN0LycgKyBpZCxcbiAgICAgICAgICAgICAgICAgICAgZGVzdHJveSA6IHByZWZpeCArICcvcHJvamVjdC8nICsgaWRcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNlY3Rpb24gICAgIDogIHtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXggICA6IHByZWZpeCArICcvc2VjdGlvbicsXG4gICAgICAgICAgICAgICAgICAgIHNob3cgICAgOiBwcmVmaXggKyAnL3NlY3Rpb24vJyArIGlkLFxuICAgICAgICAgICAgICAgICAgICBzdG9yZSAgIDogcHJlZml4ICsgJy9zZWN0aW9uLycsXG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZSAgOiBwcmVmaXggKyAnL3NlY3Rpb24vJyArIGlkLFxuICAgICAgICAgICAgICAgICAgICBkZXN0cm95IDogcHJlZml4ICsgJy9zZWN0aW9uLycgKyBpZFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHJldHVybiByb3V0ZXNbcmVzb3VyY2VdW21ldGhvZF07XG5cbiAgICAgICAgfSxcblxuICAgICAgICAvLyBEbyBzb21lIHN0dWZmIHVwb24gYSBzdWNjZXNzZnVsIEFqYXggcmVxdWVzdFxuICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJBUEkgUmVxdWVzdCBzdWNjZXNzZnVsXCIpO1xuICAgICAgICB9LFxuICAgICAgICAvLyBEbyBzb21lIHN0dWZmIHVwb24gYW4gdW5zdWNjZXNzZnVsIEFqYXggcmVxdWVzdFxuICAgICAgICBlcnJvcjogZnVuY3Rpb24oZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIHtcbiAgICAgICAgICAgIGNoZWNrUmVzcG9uc2VDb2RlKGRhdGEsIHN0YXR1cyk7XG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG5cbmFwcC5mYWN0b3J5KCdtZXNzYWdlQmFnJywgZnVuY3Rpb24gKCRodHRwKSB7XG5cbiAgICAvLyBXb3QgdG8gZG8gaW5jYXNlIEFQSSBmYWlscyB0byByZXNwb25kIGNvcnJlY3RseVxuICAgIHZhciBBcGlFcnJvciA9IGZ1bmN0aW9uKCkge1xuXG4gICAgfVxuXG4gICAgcmV0dXJuIHtcblxuICAgICAgICAvKiAtLSBMaXN0cyAtLSAqL1xuICAgICAgICAvKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cblxuICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykge1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTtcblxuICAgICAgICAgICAgaWYgKHN0YXR1cyA9PSA0MDEpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuZXJyb3JzID0gW3tcIkxvZ2dlZCBvdXRcIiA6IFwiWW91IGhhdmUgYmVlbiBsb2dnZWQgb3V0LiBSZWZyZXNoIHRoZSBwYWdlIHRvIGxvZyBiYWNrIGluIGFnYWluXCJ9XTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmVycm9ycyA9IGRhdGE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG5hcHAuY29udHJvbGxlcignRGFzaGJvYXJkQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJGh0dHAsICRzdGF0ZVBhcmFtcykge1xuXG5cblxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdQcm9qZWN0Q29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJGZpbHRlciwgbmdUYWJsZVBhcmFtcywgJGh0dHAsIFJlc3RmdWxBcGkpIHtcblxuICAgIC8vIEluaXRpYWxpc2UgYW4gZW1wdHkgYXJyYXkgdG8gaG9sZCBkYXRhXG4gICAgJHNjb3BlLmRhdGEgPSBbXTtcblxuICAgIC8vIEluaXRpYWxpc2UgdGhlIGRhdGEgdGFibGVcbiAgICAkc2NvcGUudGFibGVQYXJhbXMgPSBuZXcgbmdUYWJsZVBhcmFtcyh7XG4gICAgICAgIHBhZ2U6IDEsICAgICAgICAgICAgLy8gc2hvdyBmaXJzdCBwYWdlXG4gICAgICAgIGNvdW50OiAxMCwgICAgICAgICAgLy8gY291bnQgcGVyIHBhZ2VcbiAgICAgICAgc29ydGluZzoge1xuICAgICAgICAgICAgdXBkYXRlZF9hdDogJ2Rlc2MnICAgICAvLyBpbml0aWFsIHNvcnRpbmdcbiAgICAgICAgfSxcbiAgICB9LCB7XG4gICAgICAgIGZpbHRlckRlbGF5OiAxMCxcbiAgICAgICAgdG90YWw6ICRzY29wZS5kYXRhLmxlbmd0aCwgLy8gbGVuZ3RoIG9mIGRhdGFcbiAgICAgICAgZ2V0RGF0YTogZnVuY3Rpb24oJGRlZmVyLCBwYXJhbXMpIHtcbiAgICAgICAgICAgIC8vIHVzZSBidWlsZC1pbiBhbmd1bGFyIGZpbHRlclxuICAgICAgICAgICAgdmFyIGZpbHRlcmVkRGF0YSA9IHBhcmFtcy5maWx0ZXIoKSA/XG4gICAgICAgICAgICAgICAgICAgICRmaWx0ZXIoJ2ZpbHRlcicpKCRzY29wZS5kYXRhLCBwYXJhbXMuZmlsdGVyKCkpIDpcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRhdGE7XG4gICAgICAgICAgICB2YXIgb3JkZXJlZERhdGEgPSBwYXJhbXMuc29ydGluZygpID9cbiAgICAgICAgICAgICAgICAgICAgJGZpbHRlcignb3JkZXJCeScpKGZpbHRlcmVkRGF0YSwgcGFyYW1zLm9yZGVyQnkoKSkgOlxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YTtcblxuICAgICAgICAgICAgcGFyYW1zLnRvdGFsKG9yZGVyZWREYXRhLmxlbmd0aCk7IC8vIHNldCB0b3RhbCBmb3IgcmVjYWxjIHBhZ2luYXRpb25cbiAgICAgICAgICAgICRkZWZlci5yZXNvbHZlKG9yZGVyZWREYXRhLnNsaWNlKChwYXJhbXMucGFnZSgpIC0gMSkgKiBwYXJhbXMuY291bnQoKSwgcGFyYW1zLnBhZ2UoKSAqIHBhcmFtcy5jb3VudCgpKSk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIEluaXRpYWxpc2UgKGxvYWQpIGRhdGFcbiAgICAkc2NvcGUuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIC8vY29uc29sZS5sb2coUmVzdGZ1bEFwaS5nZXRSb3V0ZSgncHJvamVjdCcsICd1cGRhdGUnLCA0KSk7XG5cbiAgICAgICAgJGh0dHAuZ2V0KFJlc3RmdWxBcGkuZ2V0Um91dGUoJ3Byb2plY3QnLCAnaW5kZXgnKSkuXG4gICAgICAgIHN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIHtcblxuICAgICAgICAgICAgUmVzdGZ1bEFwaS5zdWNjZXNzKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKTtcblxuICAgICAgICAgICAgJHNjb3BlLmRhdGEgPSBkYXRhO1xuXG4gICAgICAgICAgICAkc2NvcGUudGFibGVQYXJhbXMucmVsb2FkKCk7XG5cbiAgICAgICAgfSkuXG4gICAgICAgIGVycm9yKGZ1bmN0aW9uKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XG4gICAgICAgICAgICBSZXN0ZnVsQXBpLmVycm9yKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKTtcbiAgICAgICAgfSk7XG5cbiAgICB9O1xuXG5cbiAgICAkc2NvcGUuZGVsZXRlID0gZnVuY3Rpb24oaWQpIHtcblxuICAgICAgICAkaHR0cC5kZWxldGUoJy9hZG1pbi9hcGkvcHJvamVjdC8nICsgaWQpLlxuICAgICAgICAgIHN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuaW5pdCgpO1xuICAgICAgICAgIH0pLlxuICAgICAgICAgIGVycm9yKGZ1bmN0aW9uKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmVycm9ycyA9IGRhdGE7XG4gICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgJHNjb3BlLmluaXQoKTtcblxufSk7XG5cblxuXG5cblxuYXBwLmNvbnRyb2xsZXIoJ1Byb2plY3RDcmVhdGVDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkaHR0cCwgJHN0YXRlUGFyYW1zLCAkbG9jYXRpb24sIFJlc3RmdWxBcGkpIHtcblxuICAgICRzY29wZS5kYXRhID0ge307XG5cbiAgICAkc2NvcGUuc2F2ZSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICRodHRwLnBvc3QoUmVzdGZ1bEFwaS5nZXRSb3V0ZSgncHJvamVjdCcsICdjcmVhdGUnKSwgJHNjb3BlLmRhdGEpLlxuICAgICAgICAgICAgc3VjY2VzcyhmdW5jdGlvbihkYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykge1xuICAgICAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCBcIi9wcm9qZWN0XCIgKTtcbiAgICAgICAgICAgIH0pLlxuICAgICAgICAgICAgZXJyb3IoZnVuY3Rpb24oZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIHtcbiAgICAgICAgICAgICAgICBSZXN0ZnVsQXBpLmVycm9yKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxufSk7XG5cblxuYXBwLmNvbnRyb2xsZXIoJ1Byb2plY3RFZGl0Q29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJGh0dHAsICRzdGF0ZVBhcmFtcywgJGxvY2F0aW9uLCBSZXN0ZnVsQXBpKSB7XG5cbiAgICAkc2NvcGUuZGF0YSA9IHt9O1xuXG4gICAgJGh0dHAuZ2V0KFJlc3RmdWxBcGkuZ2V0Um91dGUoJ3Byb2plY3QnLCAnc2hvdycsICRzdGF0ZVBhcmFtcy5pZCkpLlxuICAgICAgICBzdWNjZXNzKGZ1bmN0aW9uKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XG4gICAgICAgICAgICAkc2NvcGUuZGF0YSA9IGRhdGE7XG4gICAgICAgIH0pLlxuICAgICAgICBlcnJvcihmdW5jdGlvbihkYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykge1xuICAgICAgICAgICAgaWYgKHN0YXR1cyA9PSA0MDEpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuZXJyb3JzID0gW3tcIkxvZ2dlZCBvdXRcIiA6IFwiWW91IGhhdmUgYmVlbiBsb2dnZWQgb3V0LiBSZWZyZXNoIHRoZSBwYWdlIHRvIGxvZyBiYWNrIGluIGFnYWluXCJ9XTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmVycm9ycyA9IGRhdGE7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG5cbiAgICAkc2NvcGUuYWRkU2VjdGlvbiA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICRzY29wZS5kYXRhLnNlY3Rpb25zLnB1c2goe30pO1xuXG4gICAgfTtcblxuICAgICRzY29wZS5kZWxldGVTZWN0aW9uID0gZnVuY3Rpb24oaW5kZXgpIHtcblxuICAgICAgICAkc2NvcGUuZGF0YS5zZWN0aW9ucy5zcGxpY2UoaW5kZXgsIDEpO1xuXG4gICAgfTtcblxuXG4gICAgJHNjb3BlLnNhdmUgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICAkaHR0cC5wdXQoUmVzdGZ1bEFwaS5nZXRSb3V0ZSgncHJvamVjdCcsICd1cGRhdGUnLCAkc3RhdGVQYXJhbXMuaWQpLCAkc2NvcGUuZGF0YSkuXG4gICAgICAgICAgICBzdWNjZXNzKGZ1bmN0aW9uKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XG4gICAgICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoIFwiL3Byb2plY3QvaW5kZXhcIiApO1xuICAgICAgICAgICAgfSkuXG4gICAgICAgICAgICBlcnJvcihmdW5jdGlvbihkYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykge1xuICAgICAgICAgICAgICAgICRzY29wZS5lcnJvcnMgPSBSZXN0ZnVsQXBpLmVycm9yKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxufSk7XG5hcHAuY29udHJvbGxlcignUHJvamVjdFNlY3Rpb25Db250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkZmlsdGVyLCBuZ1RhYmxlUGFyYW1zLCAkaHR0cCwgJHJvdXRlLCAkcm91dGVQYXJhbXMsICRsb2NhdGlvbikge1xuXG4gICAgJHNjb3BlLmRhdGEgPSBbXTtcblxuICAgIC8vIEluaXRpYWxpc2UgdGhlIGRhdGEgdGFibGVcbiAgICAkc2NvcGUudGFibGVQYXJhbXMgPSBuZXcgbmdUYWJsZVBhcmFtcyh7XG4gICAgICAgIHBhZ2U6IDEsICAgICAgICAgICAgLy8gc2hvdyBmaXJzdCBwYWdlXG4gICAgICAgIGNvdW50OiAxMCwgICAgICAgICAgLy8gY291bnQgcGVyIHBhZ2VcbiAgICAgICAgc29ydGluZzoge1xuICAgICAgICAgICAgY3JlYXRlZF9hdDogJ2Rlc2MnICAgICAvLyBpbml0aWFsIHNvcnRpbmdcbiAgICAgICAgfSxcbiAgICB9LCB7XG4gICAgICAgIGZpbHRlckRlbGF5OiAxMCxcbiAgICAgICAgdG90YWw6ICRzY29wZS5kYXRhLmxlbmd0aCwgLy8gbGVuZ3RoIG9mIGRhdGFcbiAgICAgICAgZ2V0RGF0YTogZnVuY3Rpb24oJGRlZmVyLCBwYXJhbXMpIHtcbiAgICAgICAgICAgIC8vIHVzZSBidWlsZC1pbiBhbmd1bGFyIGZpbHRlclxuICAgICAgICAgICAgdmFyIGZpbHRlcmVkRGF0YSA9IHBhcmFtcy5maWx0ZXIoKSA/XG4gICAgICAgICAgICAgICAgICAgICRmaWx0ZXIoJ2ZpbHRlcicpKCRzY29wZS5kYXRhLCBwYXJhbXMuZmlsdGVyKCkpIDpcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRhdGE7XG4gICAgICAgICAgICB2YXIgb3JkZXJlZERhdGEgPSBwYXJhbXMuc29ydGluZygpID9cbiAgICAgICAgICAgICAgICAgICAgJGZpbHRlcignb3JkZXJCeScpKGZpbHRlcmVkRGF0YSwgcGFyYW1zLm9yZGVyQnkoKSkgOlxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YTtcblxuICAgICAgICAgICAgcGFyYW1zLnRvdGFsKG9yZGVyZWREYXRhLmxlbmd0aCk7IC8vIHNldCB0b3RhbCBmb3IgcmVjYWxjIHBhZ2luYXRpb25cbiAgICAgICAgICAgICRkZWZlci5yZXNvbHZlKG9yZGVyZWREYXRhLnNsaWNlKChwYXJhbXMucGFnZSgpIC0gMSkgKiBwYXJhbXMuY291bnQoKSwgcGFyYW1zLnBhZ2UoKSAqIHBhcmFtcy5jb3VudCgpKSk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgICRzY29wZS5pbml0ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgY29uc29sZS5sb2coJHJvdXRlUGFyYW1zLnByb2plY3RfaWQpO1xuXG4gICAgICAgICRodHRwLmdldCgnL2FkbWluL2FwaS9wcm9qZWN0LycgKyAkcm91dGVQYXJhbXMucHJvamVjdF9pZCArICcvc2VjdGlvbicpLlxuICAgICAgICBzdWNjZXNzKGZ1bmN0aW9uKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XG4gICAgICAgICAgICAkc2NvcGUuZGF0YSA9IGRhdGE7XG5cbiAgICAgICAgICAgIC8vIFBhcnNlIElEIGZyb20gdGV4dCB0byBpbnRlZ2VyXG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goZGF0YSwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBkYXRhLmlkICA9IHBhcnNlRmxvYXQoZGF0YS5pZCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgJHNjb3BlLnRhYmxlUGFyYW1zLnJlbG9hZCgpO1xuXG4gICAgICAgIH0pLlxuICAgICAgICBlcnJvcihmdW5jdGlvbihkYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykge1xuICAgICAgICAgICAgY29uc29sZS5sb2coc3RhdHVzKTtcbiAgICAgICAgICAgIGlmIChzdGF0dXMgPT0gNDAxKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmVycm9ycyA9IFt7XCJMb2dnZWQgb3V0XCIgOiBcIllvdSBoYXZlIGJlZW4gbG9nZ2VkIG91dC4gUmVmcmVzaCB0aGUgcGFnZSB0byBsb2cgYmFjayBpbiBhZ2FpblwifV07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICRzY29wZS5lcnJvcnMgPSBkYXRhO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xuXG4gICAgfTtcblxuXG4gICAgJHNjb3BlLmRlbGV0ZSA9IGZ1bmN0aW9uKGlkKSB7XG5cbiAgICAgICAgJGh0dHAuZGVsZXRlKCcvYWRtaW4vYXBpL3Byb2plY3QvJyArIGlkKS5cbiAgICAgICAgICBzdWNjZXNzKGZ1bmN0aW9uKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmluaXQoKTtcbiAgICAgICAgICB9KS5cbiAgICAgICAgICBlcnJvcihmdW5jdGlvbihkYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykge1xuICAgICAgICAgICAgICAgICRzY29wZS5lcnJvcnMgPSBkYXRhO1xuICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgICRzY29wZS5pbml0KCk7XG5cbn0pO1xuXG5cblxuYXBwLmNvbnRyb2xsZXIoJ1NlY3Rpb25DcmVhdGVDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkaHR0cCwgJHJvdXRlLCAkcm91dGVQYXJhbXMsICRsb2NhdGlvbikge1xuXG4gICAgJHNjb3BlLmRhdGEgPSB7fTtcblxuICAgICRzY29wZS5zYXZlID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgJGh0dHAucG9zdCgnL2FkbWluL2FwaS9wcm9qZWN0JywgJHNjb3BlLmRhdGEpLlxuICAgICAgICAgICAgc3VjY2VzcyhmdW5jdGlvbihkYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykge1xuICAgICAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCBcIi9wcm9qZWN0XCIgKTtcbiAgICAgICAgICAgIH0pLlxuICAgICAgICAgICAgZXJyb3IoZnVuY3Rpb24oZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIHtcbiAgICAgICAgICAgICAgICBpZiAoc3RhdHVzID09IDQwMSkge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXJyb3JzID0gW3tcIkxvZ2dlZCBvdXRcIiA6IFwiWW91IGhhdmUgYmVlbiBsb2dnZWQgb3V0LiBSZWZyZXNoIHRoZSBwYWdlIHRvIGxvZyBiYWNrIGluIGFnYWluXCJ9XTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXJyb3JzID0gZGF0YTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbn0pO1xuXG5cbmFwcC5jb250cm9sbGVyKCdTZWN0aW9uRWRpdENvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRodHRwLCAkcm91dGUsICRyb3V0ZVBhcmFtcywgJGxvY2F0aW9uKSB7XG5cbiAgICAkc2NvcGUuZGF0YSA9IHt9O1xuXG4gICAgJGh0dHAuZ2V0KCcvYWRtaW4vYXBpL3NlY3Rpb24vJyArICRyb3V0ZVBhcmFtcy5pZCkuXG4gICAgICAgIHN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIHtcbiAgICAgICAgICAgICRzY29wZS5kYXRhID0gZGF0YTtcbiAgICAgICAgfSkuXG4gICAgICAgIGVycm9yKGZ1bmN0aW9uKGRhdGEsIHN0YXR1cywgaGVhZGVycywgY29uZmlnKSB7XG4gICAgICAgICAgICBpZiAoc3RhdHVzID09IDQwMSkge1xuICAgICAgICAgICAgICAgICRzY29wZS5lcnJvcnMgPSBbe1wiTG9nZ2VkIG91dFwiIDogXCJZb3UgaGF2ZSBiZWVuIGxvZ2dlZCBvdXQuIFJlZnJlc2ggdGhlIHBhZ2UgdG8gbG9nIGJhY2sgaW4gYWdhaW5cIn1dO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuZXJyb3JzID0gZGF0YTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cblxuICAgICRzY29wZS5hZGRTZWN0aW9uID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgJHNjb3BlLmRhdGEuc2VjdGlvbnMucHVzaCh7fSk7XG5cbiAgICB9O1xuXG4gICAgJHNjb3BlLmRlbGV0ZVNlY3Rpb24gPSBmdW5jdGlvbihpbmRleCkge1xuXG4gICAgICAgICRzY29wZS5kYXRhLnNlY3Rpb25zLnNwbGljZShpbmRleCwgMSk7XG5cbiAgICB9O1xuXG5cbiAgICAkc2NvcGUuc2F2ZSA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICRodHRwLnB1dCgnL2FkbWluL2FwaS9zZWN0aW9uLycgKyAkcm91dGVQYXJhbXMuaWQsICRzY29wZS5kYXRhKS5cbiAgICAgICAgICAgIHN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSwgc3RhdHVzLCBoZWFkZXJzLCBjb25maWcpIHtcblxuXG4gICAgICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoIFwiL3Byb2plY3QvXCIgKyBkYXRhLmF0dGFjaG1lbnRfaWQgKyBcIi9zZWN0aW9uXCIpO1xuICAgICAgICAgICAgfSkuXG4gICAgICAgICAgICBlcnJvcihmdW5jdGlvbihkYXRhLCBzdGF0dXMsIGhlYWRlcnMsIGNvbmZpZykge1xuICAgICAgICAgICAgICAgIGlmIChzdGF0dXMgPT0gNDAxKSB7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5lcnJvcnMgPSBbe1wiTG9nZ2VkIG91dFwiIDogXCJZb3UgaGF2ZSBiZWVuIGxvZ2dlZCBvdXQuIFJlZnJlc2ggdGhlIHBhZ2UgdG8gbG9nIGJhY2sgaW4gYWdhaW5cIn1dO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5lcnJvcnMgPSBkYXRhO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxufSk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=