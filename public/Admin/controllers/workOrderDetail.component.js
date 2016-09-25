/**
 * Created by ZT on 2016/9/24.
 */

angular.
    module('workorderDetail', ['ngRoute', 'AdminApp']).
    factory('workorderDetailData', function() {
        var workorderData = {
            data: ''
        };

        return {
            setData: function(data) {
                    workorderData.data = data;
            },
            getData: function() {
                return workorderData.data;
            }
        };
    }).
    component('workorderDetail', {
    templateUrl: 'pages/workOrderDetail.html',
    controller: ['$rootScope', '$http', 'workorderDetailData', 'Base64', '$location',
        function($rootScope, $http, workorderDetailData, Base64, $location) {
            var self = this;
            this.data = workorderDetailData.getData();
            this.data.localCTime = new Date(this.data.CTime).toLocaleString();
            var acceptor = $('<select id="acceptor" class="form-control"></select>');
            var users = $('<optgroup label="用户"></optgroup>');
            var group = $('<optgroup label="用户组"></optgroup>');
            this.data.candidate.forEach(function(user) {
                users.append($('<option></option>').text(user.user));
            });
            this.data.candidateGroup.forEach(function(role) {
                group.append($('<option></option>').text(role));
            });
            acceptor.append(users).append(group);

            var dialogMsg = $('<div class="form-group"><label>受理人/组</label></div>');
            dialogMsg.append(acceptor);
            this.deliverWorkOrder = function() {
                BootstrapDialog.show({
                    title: '工单信息',
                    message: dialogMsg,
                    buttons: [{
                        label: '提交',
                        cssClass: 'btn-primary',
                        action: function(dialog) {
                            var that = this;
                            var workorder = JSON.parse(JSON.stringify(self.data));
                            var acceptor = dialog.getModalBody().find('#acceptor').val();

                            delete workorder.candidate;
                            delete workorder.candidateGroup;
                            delete workorder.MTime;
                            delete workorder.localeCTime;
                            delete workorder.localeMTime;
                            delete workorder.$$hashKey;

                            workorder.acceptor = acceptor;
                            workorder.relevantPeople.push($rootScope.me.user);
                            var thishistory = {
                                modifyBy: $rootScope.me.user,
                                notes: self.notes,
                                nextAcceptor: acceptor,
                                operation: '转交',
                                MTime: new Date().toLocaleString()
                            };
                            workorder.history.push(thishistory);

                            self.data.acceptor = acceptor;
                            self.data.history.push(thishistory);

                            var fd = new FormData();
                            fd.append('workorder', JSON.stringify(workorder));

                            $http.post('/Admin/api/auth/updateWorkOrder', fd, {
                                transformRequest: angular.identity,
                                headers: {
                                    'Content-Type': undefined,
                                    'Authorization': 'Basic '
                                    + Base64.encode($rootScope.me.user + ':' + $rootScope.me.PWD)
                                }
                            }).success(function(result){
                                that.remove();
                                dialog.setMessage(result.result);
                            }).error(function(err) {
                                dialog.setType(BootstrapDialog.TYPE_DANGER);
                                dialog.setMessage(err.err);
                            });
                        }
                    }, {
                        label: '关闭',
                        action: function(dialog) {
                            dialog.close();

                        }
                    }]

                });
            };
            this.finishWorkOrder = function() {
                BootstrapDialog.show({
                    title: '完结工单',
                    message: '确认完结工单吗?',
                    buttons: [{
                        label: '提交',
                        cssClass: 'btn-primary',
                        action: function(dialog) {
                            var that = this;
                            var workorder = JSON.parse(JSON.stringify(self.data));

                            workorder.status = '完结';

                            delete workorder.candidate;
                            delete workorder.candidateGroup;
                            delete workorder.MTime;
                            delete workorder.localeCTime;
                            delete workorder.localeMTime;
                            delete workorder.$$hashKey;

                            workorder.relevantPeople.push($rootScope.me.user);
                            workorder.acceptor = 'none';
                            var thishistory = {
                                modifyBy: $rootScope.me.user,
                                notes: self.notes,
                                operation: '完结',
                                MTime: new Date().toLocaleString()
                            };
                            workorder.history.push(thishistory);

                            self.data.acceptor = 'none';
                            self.data.history.push(thishistory);
                            self.data.status = '完结';

                            var fd = new FormData();
                            fd.append('workorder', JSON.stringify(workorder));

                            $http.post('/Admin/api/auth/updateWorkOrder', fd, {
                                transformRequest: angular.identity,
                                headers: {
                                    'Content-Type': undefined,
                                    'Authorization': 'Basic '
                                    + Base64.encode($rootScope.me.user + ':' + $rootScope.me.PWD)
                                }
                            }).success(function(result){
                                that.remove();
                                dialog.setMessage(result.result);
                            }).error(function(err) {
                                dialog.setType(BootstrapDialog.TYPE_DANGER);
                                dialog.setMessage(err.err);
                            });
                        }
                    }, {
                        label: '关闭',
                        action: function(dialog) {
                            dialog.close();

                        }
                    }]

                });
            }

    }]
});

//end of file