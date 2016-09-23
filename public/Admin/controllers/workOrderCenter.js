/**
 * Created by Lenovo on 2016/9/23.
 */

angular.module('AdminApp').controller('WorkOrderCenter', ['$rootScope', '$scope','$http', '$timeout', 'Base64', 'Dialog',

    function ($rootScope, $scope, $http, $timeout, Base64, Dialog) {
        var acceptor = $('<select id="acceptor" class="form-control"></select>');
        var users = $('<optgroup label="用户">');
        var group = $('<optgroup label="用户组">');
        acceptor.append(users).append(group);
        var getAllUsersRole = function() {
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

            }).error(function(err) {
                Dialog.errorDialog('失败', err.err);
            });
        };

        $scope.tableRows = [
            {'id': '1001', 'priority': '中', 'title': '测试1'},
            {'id': '1002', 'priority': '中', 'title': '测试2'},
            {'id': '1003', 'priority': '中', 'title': '测试3'}
        ];

        $scope.createWorkOrder = function() {
            BootstrapDialog.show({
                title: '工单信息',
                message:$(
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
                            acceptor[0].outerHTML +
                        '</div>' +
                        '<div class="form-group">' +
                            '<label>工单分类</label>' +
                            '<select id="category" class="form-control">' +
                            '<option></option>' +
                            '<option>1</option>' +
                            '<option>2</option>' +
                            '<option>3</option>' +
                            '<option>4</option>' +
                            '</select>' +
                        '</div>' +
                '</form>'),
                buttons: [{
                    label: '提交',
                    cssClass: 'btn-primary',
                    action: function(dialog) {
                        var modelBody = dialog.getModalBody();
                        var message = modelBody.find('div.hide');
                        var title = modelBody.find('#title').val();
                        var content = modelBody.find('textarea').val();
                        var radio = modelBody.find('input[name=priority]:checked').val();
                        var acceptor = modelBody.find('#acceptor').val();
                        var category = modelBody.find('#category').val();
                        message.removeClass('hide');
                        message.text('测试');
                        modelBody.text('保存成功');
                        this.remove();
                    }
                }, {
                    label: '取消',
                    action: function(dialog) {
                        dialog.close();
                    }
                }]

            });
        };

        $scope.setSelected = function() {

        };

        getAllUsersRole();
    }]);

//end of file