/**
 * Created by Lenovo on 2016/9/23.
 */

angular.module('AdminApp').controller('WorkOrderCenter', ['$rootScope', '$scope','$http', '$timeout', '$location',
    'Base64', 'Dialog', 'workorderDetailData',
    function ($rootScope, $scope, $http, $timeout, $location, Base64, Dialog, workorderDetailData) {

        var getAllUsersRole = function(acceptor, users, group, message) {
            $http({
                url: '/Admin/api/auth/getAllUsersAndRoles',
                method: 'GET',
                headers: {
                    Authorization: 'Basic '
                    + Base64.encode($rootScope.me.user + ':' + $rootScope.me.PWD)
                }
            }).success(function(result) {
                result.users.forEach(function(user) {
                    var option = $('<option></option>').text(user.user);
                    users.append(option);
                });
                result.rolesname.forEach(function(role) {
                    var option = $('<option></option>').text(role);
                    group.append(option);
                });
                var temp = message.find('div');
                $(temp[1]).append(acceptor);
                $scope.candidate = result.users;
                $scope.candidateGroup = result.rolesname;
            }).error(function(err) {
                Dialog.errorDialog('失败', err.err);
            });
        };

        var newCreateWorkOrderContent = function() {
            var acceptor = $('<select id="acceptor" class="form-control"></select>');
            var users = $('<optgroup label="用户"></optgroup>');
            var group = $('<optgroup label="用户组"></optgroup>');
            acceptor.append(users).append(group);
            var message = $(
                '<div class="alert alert-danger hide"></div>'+
                '<form role="form">' +
                '<input  id="title" class="form-control" required placeholder="工单标题..." />' + '<br />' +
                '<textarea class="form-control" required placeholder="工单内容..."></textarea>' + '<br />' +
                '<div class="form-group">' +
                '<label>工单优先级</label>' + '<br />' +
                '<label class="radio-inline"><input type="radio" name="priority" value="一般"checked>一般</label>' +
                '<label class="radio-inline"><input type="radio" name="priority" value="紧急" >紧急</label>' +
                '<label class="radio-inline"><input type="radio" name="priority" value="非常紧急">非常紧急</label>' +
                '</div>' +
                '<div class="form-group">' +
                '<label>受理人/组</label>' +
                '</div>' +
                '<div class="form-group">' +
                '<label>工单分类</label>' +
                '<select id="category" class="form-control">' +
                '<option></option>' +
                '<option>类型1</option>' +
                '<option>类型2</option>' +
                '<option>类型3</option>' +
                '</select>' +
                '</div>' +
                '</form>');
            getAllUsersRole(acceptor, users, group, message);
            return message;
        };
        var dialogContent = newCreateWorkOrderContent();



        $scope.getAllMyAcceptWorkOrder = function() {
            $http({
                url: '/Admin/api/auth/getAllMyAcceptWorkOrder',
                method: 'GET',
                headers: {
                    Authorization: 'Basic '
                    + Base64.encode($rootScope.me.user + ':' + $rootScope.me.PWD)
                }
            }).success(function(result) {
                result.map(function(row) {
                    row.localeCTime = new Date(row.CTime).toLocaleString();
                    row.localeMTime = new Date(row.MTime).toLocaleString();
                });
                $scope.allMyAcceptWorkOrderAlert = result.length;
                $scope.tableData = result;
            }).error(function(err) {

            });
        };


        $scope.getAllMyPublishWorkOrder = function() {
            $http({
                url: '/Admin/api/auth/getAllMyPublishWorkOrder',
                method: 'GET',
                headers: {
                    Authorization: 'Basic '
                    + Base64.encode($rootScope.me.user + ':' + $rootScope.me.PWD)
                }
            }).success(function(result) {
                result.map(function(row) {
                    row.localeCTime = new Date(row.CTime).toLocaleString();
                    row.localeMTime = new Date(row.MTime).toLocaleString();
                });
                $scope.tableData = result;
            }).error(function(err) {

            });
        };

        $scope.getAllMyProcessedWorkOrder = function() {
            $http({
                url: '/Admin/api/auth/getAllMyProcessedWorkOrder',
                method: 'GET',
                headers: {
                    Authorization: 'Basic '
                    + Base64.encode($rootScope.me.user + ':' + $rootScope.me.PWD)
                }
            }).success(function(result) {
                result.map(function(row) {
                    row.localeCTime = new Date(row.CTime).toLocaleString();
                    row.localeMTime = new Date(row.MTime).toLocaleString();
                });
                $scope.tableData = result;
            }).error(function(err) {

            });
        };

        $scope.createWorkOrder = function() {
            BootstrapDialog.show({
                title: '工单信息',
                message: dialogContent,
                buttons: [{
                    label: '提交',
                    cssClass: 'btn-primary',
                    action: function(dialog) {
                        var that = this;
                        var modelBody = dialog.getModalBody();
                        var message = modelBody.find('div.hide');
                        var title = modelBody.find('#title').val();
                        var content = modelBody.find('textarea').val();
                        var radio = modelBody.find('input[name=priority]:checked').val();
                        var acceptor = modelBody.find('#acceptor').val();
                        var category = modelBody.find('#category').val();

                        if (!title || !content || !category || !acceptor) {
                            message.removeClass('hide');
                            message.text('输入数据不完全,[标题],[内容],[受理人],[工单分类]为必填项!');
                        } else {
                            var workorder = {};
                            var me = $rootScope.me.user;
                            workorder.relevantPeople = [];
                            workorder.relevantPeople.push(me);
                            workorder.title = title;
                            workorder.content = content;
                            workorder.initiator = me;
                            workorder.acceptor = acceptor;
                            workorder.priority = radio;
                            workorder.category = category;

                            var thisHistory = {};
                            thisHistory.modifyBy = me;
                            thisHistory.nextAcceptor = acceptor;
                            thisHistory.operation = '创建';
                            thisHistory.MTime = new Date().toLocaleString();
                            workorder.history = [];
                            workorder.history.push(thisHistory);

                            var fd = new FormData();
                            fd.append('workOrder', JSON.stringify(workorder));

                            $http.post('/Admin/api/auth/createWorkOrder', fd, {
                                transformRequest: angular.identity,
                                headers: {
                                    'Content-Type': undefined,
                                    'Authorization': 'Basic '
                                    + Base64.encode($rootScope.me.user + ':' + $rootScope.me.PWD)
                                }
                            }).success(function(result){
                                that.remove();
                                dialog.setMessage(result.result);
                                dialogContent = newCreateWorkOrderContent();
                            }).error(function(err) {
                                dialog.setType(BootstrapDialog.TYPE_DANGER);
                                dialog.setMessage(err.err);
                            });
                        }
                    }
                }, {
                    label: '关闭',
                    action: function(dialog) {
                        dialog.close();
                    }
                }]

            });
        };

        $scope.showDetail = function() {
            this.row.candidate = $scope.candidate;
            this.row.candidateGroup = $scope.candidateGroup;
            workorderDetailData.setData(this.row);
            $location.path('/workOrderCenter/' + this.row.id);
        };

        $scope.getAllMyAcceptWorkOrder();

    }]);

//end of file