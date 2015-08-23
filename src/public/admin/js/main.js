var debug=function(message,type,object){enable_debug=typeof enable_debug!=="undefined"?enable_debug:false;object=typeof object!=="undefined"?object:false;message=typeof message!=="undefined"?message:"Debug";type=typeof type!=="undefined"?type:false;var getDebugCookie=function(){var value="; "+document.cookie;var parts=value.split("; debug=");if(parts.length==2){return true}else{return false}};var cookie_overide=getDebugCookie();if(enable_debug!=false||cookie_overide){if(enable_debug.all!=false||cookie_overide){if(type!=false&&enable_debug[type]!=false||type==false&&enable_debug.typeless==true||cookie_overide){if(type!=false){if(object){console.log(type,'"'+message+'"',object)}else{console.log(type,'"'+message+'"')}}else{if(object){console.log(message,object)}else{console.log(message)}}}}}};var opts={lines:17,length:0,width:22,radius:84,scale:1,corners:0,color:"#ccc",opacity:.05,rotate:0,direction:1,speed:1,trail:30,fps:20,zIndex:2e9,className:"spinner",top:"50%",left:"50%",shadow:false,hwaccel:false,position:"absolute"};document.addEventListener("DOMContentLoaded",function(event){new Spinner(opts).spin(document.getElementById("state-transition-spinner"))});String.prototype.trunc=String.prototype.trunc||function(n){if(this.length>n){return this.substr(0,n-1)+"&ellipsis;"}else{return this.toString()}};var app=angular.module("ng-portfolio",["ui.router","ui.bootstrap","ngFileUpload","ngTable","hc.marked","ngTagsInput","ui.tree"]);app.config(function($httpProvider){$httpProvider.defaults.headers.common["X-Requested-With"]="XMLHttpRequest";$httpProvider.interceptors.push("HttpInterceptor")});app.config(function(tagsInputConfigProvider){tagsInputConfigProvider.setDefaults("tagsInput",{replaceSpacesWithDashes:false})});app.config(["markedProvider",function(markedProvider){markedProvider.setOptions({gfm:true,tables:true})}]);app.config(function($stateProvider,$urlRouterProvider){$urlRouterProvider.otherwise("/dashboard");$stateProvider.state("dashboard",{url:"/dashboard",templateUrl:"/vendor/portfolio/admin/views/dashboard.html",controller:"DashboardController"}).state("page",{url:"/page",templateUrl:"/vendor/portfolio/admin/views/page/page.html"}).state("page.index",{url:"/index",templateUrl:"/vendor/portfolio/admin/views/page/page.index.html",controller:"PageController"}).state("page.edit",{url:"/:id/edit",templateUrl:"/vendor/portfolio/admin/views/page/page.edit.html",controller:"PageEditController"})});app.run(function($rootScope){$rootScope.$on("$stateChangeStart",function(event,toState,toParams,fromState,fromParams){angular.element(document.querySelectorAll(".state-transition")).addClass("-loading")});$rootScope.$on("$stateChangeSuccess",function(event,toState,toParams,fromState,fromParams){angular.element(document.querySelectorAll(".state-transition")).removeClass("-loading")})});app.factory("RestfulApi",function(){return{getRoute:function(resource,method,id){if(typeof id==="undefined"){id="0"}var prefix="/api";var routes={project:{index:prefix+"/project",show:prefix+"/project/"+id,store:prefix+"/project",update:prefix+"/project/"+id,destroy:prefix+"/project/"+id},section:{index:prefix+"/section",show:prefix+"/section/"+id,store:prefix+"/section",update:prefix+"/section/"+id,destroy:prefix+"/section/"+id},projectSection:{store:prefix+"/project/"+id+"/section"},projectPage:{store:prefix+"/project/"+id+"/page"},tag:{index:prefix+"/tag",show:prefix+"/tag/"+id,store:prefix+"/tag",update:prefix+"/tag/"+id,destroy:prefix+"/tag/"+id},page:{index:prefix+"/page",show:prefix+"/page/"+id,store:prefix+"/page",update:prefix+"/page/"+id,destroy:prefix+"/page/"+id},pageSection:{store:prefix+"/page/"+id+"/section"}};return routes[resource][method]}}});app.factory("HttpInterceptor",function($q,notificationService){var checkResponseCode=function(data,status){switch(status){case 422:notificationService.add("Validation failed, please correct the issues","danger");break;case 401:notificationService.add("You have been logged out","warning");break;case 500:notificationService.add("API error","danger");break;default:debug("Some other problem!","http",data)}};return{request:function(config){return config},requestError:function(rejection){return $q.reject(rejection)},response:function(response){return response},responseError:function(rejection){checkResponseCode(rejection.data,rejection.status);debug("responseError","http",rejection);return $q.reject(rejection)}}});app.service("notificationService",function($timeout){var notifications=[];this.get=function(){return notifications};this.add=function(message,type,delay){type=typeof type!=="undefined"?type:"info";delay=typeof delay!=="undefined"?delay:6e3;var notification={type:type,message:message};notifications.push(notification);if(delay!=0&&delay!=null&&delay!="none"){$timeout(this.removeByElement,delay,true,notification)}};this.removeByIndex=function(index){debug("removing one message: "+index,"notification");notifications.splice(index,1)};this.removeByType=function(type){debug("clearing "+type+" messages","notification");for(i=0;i<notifications.length;i++){if(notifications[i].type==type){notifications.splice(i,1)}}};this.removeByElement=function(element){debug("removing message: "+element,"notification");notifications.splice(notifications.indexOf(element),1)};this.clear=function(){debug("clearing all messages","notification");notifications=[]}});app.directive("clickSpinner",["$q",function($q){var spinnerId=1;var directive={restrict:"A",link:link,transclude:true,scope:{clickHandler:"&clickSpinner"},template:'<span style="position: relative"><span ng-transclude></span></span>'};var opts={width:3,length:3,lines:9,radius:4,color:"#fff"};return directive;function link(scope,element,attr){var spinner=new Spinner(opts);var spinnerTarget=element.children();var textElement=spinnerTarget.children();function handler(){var p=$q.when(scope.clickHandler());attr.$set("disabled",true);textElement.css("visibility","hidden");spinner.spin(spinnerTarget[0]);p["finally"](function(){attr.$set("disabled",false);textElement.css("visibility","visible");spinner.stop()})}element.on("click",handler);scope.$on("$destroy",function(){element.off("click",handler)})}}]);app.controller("NotificationController",function($scope,notificationService,$timeout){$scope.notifier=notificationService;$scope.$watch("notifier.get()",function(notifications){if(angular.isDefined(notifications)){$scope.notifications=notifications}},true);$scope.remove=function(element){notificationService.removeByElement(element)}});app.controller("DashboardController",function($scope,$http,$stateParams){});app.config(function($stateProvider,$urlRouterProvider){$stateProvider.state("project",{url:"/project",templateUrl:"/vendor/portfolio/admin/views/project/project.html",controller:"ProjectController"}).state("project.index",{url:"/index",templateUrl:"/vendor/portfolio/admin/views/project/project.index.html",controller:"ProjectIndexController",resolve:{model:function($http){return $http.get("/api/project")}}}).state("project.create",{url:"/create",templateUrl:"/vendor/portfolio/admin/views/project/project.edit.html",controller:"ProjectCreateController"}).state("project.edit",{url:"/:id/edit",templateUrl:"/vendor/portfolio/admin/views/project/project.edit.html",controller:"ProjectEditController",resolve:{model:function($http,RestfulApi,$stateParams){return $http.get(RestfulApi.getRoute("project","show",$stateParams.id))}}})});app.controller("ProjectController",function($scope){$scope.module={name:"projects"}});app.controller("ProjectIndexController",function($scope,model,$filter,ngTableParams,$http,RestfulApi,notificationService){$scope.model=model.data;$scope.tableParams=new ngTableParams({page:1,count:10,sorting:{updated_at:"desc"}},{filterDelay:10,total:$scope.model.length,getData:function($defer,params){var filteredData=params.filter()?$filter("filter")($scope.model,params.filter()):$scope.model;var orderedData=params.sorting()?$filter("orderBy")(filteredData,params.orderBy()):$scope.model;params.total(orderedData.length);$defer.resolve(orderedData.slice((params.page()-1)*params.count(),params.page()*params.count()))}});$scope.delete=function(id,title){if(confirm("Are you sure you wish to delete "+title+"?")){$http.delete("/api/project/"+id).success(function(data){notificationService.add("Project '"+data.title+"' deleted successfully","info");$scope.init()}).error(function(data){$scope.errors=data})}}});app.controller("ProjectCreateController",function($scope,$http,$stateParams,$state,RestfulApi,notificationService){$scope.model={};$scope.create=true;$scope.save=function(apply){$http.post(RestfulApi.getRoute("project","store"),$scope.model).success(function(data){notificationService.add("Project '"+data.title+"' added successfully","success");$scope.errors=[];if(!apply){$state.go("project.index")}else{$state.go("project.edit",{id:data.id})}}).error(function(data){$scope.errors=data})};$scope.loadTags=function(query){return $http.get("/api/tag/search?query="+query)}});app.controller("ProjectEditController",function($scope,model,$http,$stateParams,$state,RestfulApi,notificationService,ngTableParams,$filter,$modal){$scope.model=model.data;$scope.slug=model.data.slug;$scope.tableParams=new ngTableParams({page:1,count:10,sorting:{updated_at:"desc"}},{filterDelay:10,total:$scope.model.pages.length,getData:function($defer,params){var filteredData=params.filter()?$filter("filter")($scope.model.pages,params.filter()):$scope.model.pages;var orderedData=params.sorting()?$filter("orderBy")(filteredData,params.orderBy()):$scope.model.pages;params.total(orderedData.length);$defer.resolve(orderedData.slice((params.page()-1)*params.count(),params.page()*params.count()))}});$scope.options={dragStop:function(scope){debug("stopped dragging","ui",scope);for(i=0;i<scope.dest.nodesScope.$modelValue.length;i++){scope.dest.nodesScope.$modelValue[i].rank=i}},accept:function(sourceNodeScope,destNodesScope,destIndex){return true}};var getRootNodesScope=function(){return angular.element(document.getElementById("tree-root")).scope()};$scope.loadTags=function(query){return $http.get("/api/tag/search?query="+query)};$scope.editSection=function(create,sectionId){sectionId=typeof sectionId!=="undefined"?sectionId:false;modalData={create:create,projectId:$scope.model.id,sectionId:sectionId};var modalInstance=$modal.open({animation:true,templateUrl:"sectionEdit.html",controller:"editSectionController",size:"lg",resolve:{modalData:function(){return modalData}}});modalInstance.result.then(function(section){debug("modal closed","ui",section);if(create){$scope.model.sections.push(section)}else{angular.forEach($scope.model.sections,function(value,key){if(value.id==sectionId){debug("updated section: "+value.id);$scope.model.sections[key]=section}})}})};$scope.deleteSection=function(sectionId){if(confirm("Are you sure you wish to delete this section?.")){$http.delete("/api/section/"+sectionId).success(function(data){angular.forEach($scope.model.sections,function(value,key){if(value.id==sectionId){$scope.model.sections.splice(key,1)}});notificationService.add("Section '"+sectionId+"' deleted successfully","info")}).error(function(data){$scope.errors=data})}};$scope.editPage=function(create,pageId){pageId=typeof pageId!=="undefined"?pageId:false;modalData={create:create,projectId:$scope.model.id,pageId:pageId};var modalInstance=$modal.open({animation:true,templateUrl:"pageEdit.html",controller:"editPageController",size:"lg",resolve:{modalData:function(){return modalData}}});modalInstance.result.then(function(page){if(create){$scope.model.pages.push(page)}else{angular.forEach($scope.model.pages,function(value,key){if(value.id==pageId){debug("updated section: "+value.id);$scope.model.pages[key]=page}})}$scope.tableParams.reload()})};$scope.deletePage=function(pageId){if(confirm("Are you sure you wish to delete this page?.")){$http.delete("/api/page/"+pageId).success(function(data){angular.forEach($scope.model.pages,function(value,key){if(value.id==pageId){$scope.model.pages.splice(key,1)}});notificationService.add("Page '"+pageId+"' deleted successfully","info");$scope.tableParams.reload()}).error(function(data){$scope.errors=data})}};$scope.slugWarning=function(){notificationService.removeByType("warning");if($scope.slug!=$scope.model.slug){notificationService.add("You have modified the project slug. Please be aware that this may break hyperlinks to this project.","warning")}};$scope.save=function(apply){apply=typeof apply!=="undefined"?apply:false;if($scope.slug!=$scope.model.slug){if(confirm("Are you sure you wish to change the slug?")){return $scope.put(apply)}else{$scope.model.slug=$scope.slug;notificationService.add("Slug reset","info")}}else{return $scope.put(apply)}};$scope.put=function(apply){return $http.put(RestfulApi.getRoute("project","update",$stateParams.id),$scope.model).success(function(data){notificationService.add("Project '"+data.title+"' updated successfully","success");$scope.errors=[];$scope.model.updated_at_human="Just now";if(!apply){$state.go("project.index")}}).error(function(data){$scope.errors=data})}});app.controller("editSectionController",function($scope,$http,$modalInstance,RestfulApi,notificationService,modalData){if(!modalData.create){$http.get(RestfulApi.getRoute("section","show",modalData.sectionId)).success(function(data){$scope.section=data}).error(function(data){$scope.errors=data})}$scope.save=function(){debug("Saving section","controller",modalData.create);if(modalData.create){debug("Creating new section","controller");$http.post(RestfulApi.getRoute("projectSection","store",modalData.projectId),$scope.section).success(function(data){notificationService.add("Section (ID:"+data.id+") created successfully","success");$scope.errors=[];$modalInstance.close(data)}).error(function(data){$scope.errors=data})}else{debug("Updating existing section","controller");$http.put(RestfulApi.getRoute("section","update",$scope.section.id),$scope.section).success(function(data){notificationService.add("Section (ID:"+data.id+") updated successfully","success");$scope.errors=[];$modalInstance.close(data)}).error(function(data){$scope.errors=data})}};$scope.cancel=function(){$modalInstance.dismiss("cancel")}});app.controller("editPageController",function($scope,$http,$modalInstance,RestfulApi,notificationService,modalData){if(!modalData.create){$http.get(RestfulApi.getRoute("page","show",modalData.pageId)).success(function(data){$scope.page=data}).error(function(data){$scope.errors=data})}$scope.save=function(){debug("Saving page","controller",modalData);if(modalData.create){debug("Creating new page","controller");$http.post(RestfulApi.getRoute("projectPage","store",modalData.projectId),$scope.page).success(function(data){notificationService.add("Page '"+data.title+"' created successfully","success");$scope.errors=[];$modalInstance.close(data)}).error(function(data){$scope.errors=data})}else{debug("Updating existing page","controller");$http.put(RestfulApi.getRoute("page","update",$scope.page.id),$scope.page).success(function(data){notificationService.add("Page '"+data.title+"' updated successfully","success");$scope.errors=[];$modalInstance.close(data)}).error(function(data){$scope.errors=data})}};$scope.cancel=function(){$modalInstance.dismiss("cancel")}});app.config(function($stateProvider,$urlRouterProvider){$stateProvider.state("tag",{url:"/tag",templateUrl:"/vendor/portfolio/admin/views/tag/tag.html"}).state("tag.index",{url:"/index",templateUrl:"/vendor/portfolio/admin/views/tag/tag.index.html",controller:"TagIndexController"}).state("tag.create",{url:"/create",templateUrl:"/vendor/portfolio/admin/views/tag/tag.edit.html",controller:"TagCreateController"}).state("tag.edit",{url:"/:id/edit",templateUrl:"/vendor/portfolio/admin/views/tag/tag.edit.html",controller:"TagEditController"})});app.controller("TagIndexController",function($scope,$filter,ngTableParams,$http,notificationService){$scope.data=[];$scope.tableParams=new ngTableParams({page:1,count:10,sorting:{updated_at:"desc"}},{filterDelay:10,total:$scope.data.length,getData:function($defer,params){var filteredData=params.filter()?$filter("filter")($scope.data,params.filter()):$scope.data;var orderedData=params.sorting()?$filter("orderBy")(filteredData,params.orderBy()):$scope.data;params.total(orderedData.length);$defer.resolve(orderedData.slice((params.page()-1)*params.count(),params.page()*params.count()))}});$scope.init=function(){$http.get("/api/tag").success(function(data){$scope.data=data;$scope.tableParams.reload()})};$scope.delete=function(id,title){if(confirm("Are you sure you wish to delete "+title+"?")){$http.delete("/api/tag/"+id).success(function(data){notificationService.add("Project '"+data.title+"' deleted successfully","info");$scope.init()}).error(function(data){$scope.errors=data})}};$scope.init()});app.controller("TagCreateController",function($scope,$http,$stateParams,$state,notificationService){$scope.data={};$scope.save=function(apply){$http.post("/api/tag",$scope.data).success(function(data){notificationService.add("Tag '"+data.title+"' added successfully","success");$scope.errors=[];if(!apply){$state.go("tag.index")}else{$state.go("tag.edit",{id:data.id})}}).error(function(data){$scope.errors=data})}});app.controller("TagEditController",function($scope,$http,$stateParams,$state,notificationService,ngTableParams,$filter,$modal){$scope.data={projects:[]};$scope.tableParams=new ngTableParams({page:1,count:10,sorting:{updated_at:"desc"}},{filterDelay:10,total:$scope.data.projects.length,getData:function($defer,params){var filteredData=params.filter()?$filter("filter")($scope.data.projects,params.filter()):$scope.data.projects;var orderedData=params.sorting()?$filter("orderBy")(filteredData,params.orderBy()):$scope.data.projects;params.total(orderedData.length);$defer.resolve(orderedData.slice((params.page()-1)*params.count(),params.page()*params.count()))}});$http.get("/api/tag/"+$stateParams.id).success(function(data){$scope.data=data;$scope.tableParams.reload()}).error(function(data){$scope.errors=data});$scope.save=function(apply){apply=typeof apply!=="undefined"?apply:false;$http.put("/api/tag/"+$stateParams.id,$scope.data).success(function(data){notificationService.add("Tag '"+data.title+"' updated successfully","success");$scope.errors=[];if(!apply){$state.go("tag.index")}}).error(function(data){$scope.errors=data})}});app.controller("PageController",function($scope,$filter,ngTableParams,$http,RestfulApi,notificationService){$scope.model=[];$scope.tableParams=new ngTableParams({page:1,count:10,sorting:{updated_at:"desc"}},{filterDelay:10,total:$scope.model.length,getData:function($defer,params){var filteredData=params.filter()?$filter("filter")($scope.model,params.filter()):$scope.model;var orderedData=params.sorting()?$filter("orderBy")(filteredData,params.orderBy()):$scope.model;params.total(orderedData.length);$defer.resolve(orderedData.slice((params.page()-1)*params.count(),params.page()*params.count()))}});$scope.init=function(){$http.get(RestfulApi.getRoute("page","index")).success(function(data){$scope.model=data;$scope.tableParams.reload()})};$scope.delete=function(id,title){if(confirm("Are you sure you wish to delete "+title+"?")){$http.delete("/api/page/"+id).success(function(data){notificationService.add("Page '"+data.title+"' deleted successfully","info");$scope.init()}).error(function(data){$scope.errors=data})}};$scope.init()});app.controller("PageEditController",function($scope,$http,$stateParams,$state,RestfulApi,notificationService,ngTableParams,$filter,$modal){$scope.model={sections:[]};$http.get(RestfulApi.getRoute("page","show",$stateParams.id)).success(function(data){$scope.model=data;$scope.slug=$scope.model.slug}).error(function(data,status,headers,config){$scope.errors=data});$scope.options={dragStop:function(scope){console.log("stopped dragging");console.log(scope);for(i=0;i<scope.dest.nodesScope.$modelValue.length;i++){scope.dest.nodesScope.$modelValue[i].rank=i}},accept:function(sourceNodeScope,destNodesScope,destIndex){return true}};var getRootNodesScope=function(){return angular.element(document.getElementById("tree-root")).scope()};$scope.editSection=function(create,sectionId){sectionId=typeof sectionId!=="undefined"?sectionId:false;modalData={create:create,pageId:$scope.model.id,sectionId:sectionId};console.log(modalData);var modalInstance=$modal.open({animation:true,templateUrl:"pageSectionEdit.html",controller:"editPageSectionController",size:"lg",resolve:{modalData:function(){return modalData}}});modalInstance.result.then(function(section){console.log("modal closed");console.log(section);if(create){$scope.model.sections.push(section)}else{angular.forEach($scope.model.sections,function(value,key){if(value.id==sectionId){console.log("updated section: "+value.id);$scope.model.sections[key]=section}})}console.log($scope.model.sections)})};$scope.deleteSection=function(sectionId){if(confirm("Are you sure you wish to delete this section?.")){$http.delete("/api/section/"+sectionId).success(function(data){angular.forEach($scope.model.sections,function(value,key){if(value.id==sectionId){console.log(key);$scope.model.sections.splice(key,1)}});notificationService.add("Section '"+sectionId+"' deleted successfully","info")}).error(function(data){$scope.errors=data})}};$scope.slugWarning=function(){notificationService.removeByType("warning");if($scope.slug!=$scope.model.slug){notificationService.add("You have modified the project slug. Please be aware that this may break hyperlinks to this project.","warning")}};$scope.save=function(apply){apply=typeof apply!=="undefined"?apply:false;if($scope.slug!=$scope.model.slug){if(confirm("Are you sure you wish to change the slug?")){$scope.put(apply)}else{$scope.model.slug=$scope.slug;notificationService.removeByType("warning");notificationService.add("Slug reset","info")}}else{$scope.put(apply)}};$scope.put=function(apply){$http.put(RestfulApi.getRoute("page","update",$stateParams.id),$scope.model).success(function(data){notificationService.add("Page '"+data.title+"' updated successfully","success");$scope.errors=[];$scope.model.updated_at_human="Just now";if(!apply){$state.go("page.index")}}).error(function(data){$scope.errors=data})}});app.controller("editPageSectionController",function($scope,$http,$modalInstance,RestfulApi,notificationService,modalData){if(!modalData.create){$http.get(RestfulApi.getRoute("section","show",modalData.sectionId)).success(function(data){$scope.section=data}).error(function(data){$scope.errors=data})}$scope.save=function(){console.log(modalData.create);if(modalData.create){console.log("creating");$http.post(RestfulApi.getRoute("pageSection","store",modalData.pageId),$scope.section).success(function(data){notificationService.add("Section (ID:"+data.id+") created successfully","success");$scope.errors=[];$modalInstance.close(data)}).error(function(data){$scope.errors=data})}else{console.log("editing");$http.put(RestfulApi.getRoute("section","update",$scope.section.id),$scope.section).success(function(data){notificationService.add("Section (ID:"+data.id+") updated successfully","success");$scope.errors=[];$modalInstance.close(data)}).error(function(data){$scope.errors=data})}};$scope.cancel=function(){$modalInstance.dismiss("cancel")}});app.config(function($stateProvider,$urlRouterProvider){$stateProvider.state("assets",{url:"/assets",templateUrl:"/vendor/portfolio/admin/views/assets/assets.html"})});app.controller("AssetController",function($scope,$http,$stateParams,$state,notificationService,Upload){$scope.ui_tree_options={dragStop:function(scope){console.log("stopped dragging");console.log(scope);var object={src_path:scope.source.nodeScope.$modelValue.path+"/"+scope.source.nodeScope.$modelValue.name};if(scope.dest.nodesScope.$nodeScope!=null){object.dest_path=scope.dest.nodesScope.$nodeScope.$modelValue.path+"/"+scope.dest.nodesScope.$nodeScope.$modelValue.name+"/"+scope.source.nodeScope.$modelValue.name}else{object.dest_path="/"+scope.source.nodeScope.$modelValue.name}$http.put("/api/assets",object).success(function(data){scope.source.nodeScope.$modelValue.folders=data.folder.folders;scope.source.nodeScope.$modelValue.path=data.folder.path;scope.source.nodeScope.$modelValue.name=data.folder.name;$scope.checkActiveDirectory(object.src_path,object.dest_path)}).error(function(data){$scope.errors=data})},accept:function(sourceNodeScope,destNodesScope,destIndex){var test=false;for(i=0;i<destNodesScope.$modelValue.length;i++){if(sourceNodeScope.$modelValue.name==destNodesScope.$modelValue[i].name){test=true}}if(test){return false}else{return true}console.log(sourceNodeScope);console.log(destNodesScope)}};$scope.getRootNodesScope=function(){return angular.element(document.getElementById("tree-root")).scope()};$scope.toggle=function(scope){scope.toggle()};$scope.collapseAll=function(){var scope=$scope.getRootNodesScope();scope.collapseAll()};$scope.expandAll=function(){var scope=$scope.getRootNodesScope();scope.expandAll()};$scope.image_types=["jpg","gif","png"];if(typeof $scope.$parent.$parent.module!="undefined"){$scope.type=$scope.$parent.$parent.module.name}else{console.log("derp");$scope.type=""}if(typeof $scope.$parent.model!="undefined"){$scope.root_id=$scope.$parent.model.id}else{$scope.root_id=""}$scope.initial_path=$scope.type+"/"+$scope.root_id;$scope.active_path=$scope.initial_path;$scope.prefix_path=window.location.origin+"/portfolio";$scope.model=[];$scope.init=function(){$http.get("/api/assets?path="+$scope.initial_path).success(function(data){$scope.model=data}).error(function(data,status){if(status==404){$http.post("/api/assets",{path:$scope.initial_path}).success(function(data){$scope.init()}).error(function(data){$scope.errors=data})}})};$scope.changeDirectory=function(path){$http.get("/api/assets?path="+path).success(function(data){$scope.model.files=data.files;$scope.active_path=path}).error(function(data){$scope.errors=data})};$scope.createDirectory=function(node){var name=prompt("Folder name:","newfolder");if(typeof node.$nodeScope!="undefined"){nodeScope=node.$nodeScope.$modelValue}else{nodeScope=node}if(name){$http.post("/api/assets",{path:nodeScope.path+"/"+nodeScope.name+"/"+name}).success(function(data){nodeScope.folders.push(data.folder)}).error(function(data){$scope.errors=data})}};$scope.renameDirectory=function(node){console.log(node);var new_name=prompt("New name:",node.$nodeScope.$modelValue.name);if(new_name){var object={src_path:node.$nodeScope.$modelValue.path+"/"+node.$nodeScope.$modelValue.name,dest_path:node.$nodeScope.$modelValue.path+"/"+new_name};$http.put("/api/assets",object).success(function(data){node.$nodeScope.$modelValue.folders=data.folder.folders;node.$nodeScope.$modelValue.path=data.folder.path;node.$nodeScope.$modelValue.name=data.folder.name;$scope.checkActiveDirectory(object.src_path,object.dest_path)}).error(function(data){$scope.errors=data})}};$scope.deleteDirectory=function(node){if(confirm("Are you sure?")){$http.delete("/api/assets?path="+node.$nodeScope.$modelValue.path+"/"+node.$nodeScope.$modelValue.name).success(function(data){node.remove();$scope.checkActiveDirectory(node.$nodeScope.$modelValue.path+"/"+node.$nodeScope.$modelValue.name,"/")}).error(function(data){$scope.errors=data})}};$scope.checkActiveDirectory=function(oldpath,newpath){if(oldpath==$scope.active_path){$scope.changeDirectory(newpath)}};$scope.addFile=function(files){if(files&&files.length){for(i=0;i<files.length;i++){files[i].progress=0;files[i].progress_type="info";files[i].filename=files[i].name}}};$scope.removeFile=function(file){$scope.files.splice($scope.files.indexOf(file),1)};$scope.uploadFile=function(){console.log($scope.files);angular.forEach($scope.files,function(file,key){Upload.upload({url:"/api/assets",fields:{path:unescape($scope.active_path),filename:file.filename},file:file}).progress(function(evt){var progressPercentage=parseInt(100*evt.loaded/evt.total);file.progress=progressPercentage;if(progressPercentage>=100){file.progress_type="success"}else{file.progress_type="info"}console.log("progress: "+progressPercentage+"% "+evt.config.file.name)}).success(function(data,status,headers,config){console.log("file "+config.file.name+" uploaded. Response: "+data);$scope.model.files.push(data.file);$scope.files.splice($scope.files.indexOf(file),1)}).error(function(data,status,headers,config){console.log("error status: "+status);file.progress_message=data.errors;file.progress_type="danger"})})};$scope.deleteFile=function(node){if(confirm("Are you sure?")){$http.delete("/api/assets?path="+node.path+"&file="+node.filename).success(function(data){for(i=0;i<$scope.model.files.length;i++){if($scope.model.files[i].filename==node.filename){$scope.model.files.splice(i,1)}}}).error(function(data){$scope.errors=data})}};$scope.renameFile=function(node){var new_name=prompt("New name:",node.filename);if(new_name){var object={src_path:node.path,src_file:node.filename,dest_path:node.path,dest_file:new_name};$http.put("/api/assets",object).success(function(data){console.log(data);node.extension=data.file.extension;node.filename=data.file.filename;node.lastmodified=data.file.lastmodified}).error(function(data){$scope.errors=data})}}});
//# sourceMappingURL=main.js.map