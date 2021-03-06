/**
 * Created by ZT on 2016/9/24.
 */

angular.
    module('chart', ['ngRoute', 'AdminApp'])
    .component('chart', {
    templateUrl: 'pages/chart.html',
    controller: ['$rootScope', '$scope', '$http', 'Base64',
        function($rootScope, $scope, $http, Base64) {
            var myHostsChart = echarts.init(document.getElementById('host'));
            var myDBChart = echarts.init(document.getElementById('DBChart'));

            $http({
                url: '/Admin/api/auth/getAllMonitorHostsIP',
                method: 'GET',
                headers: {
                    Authorization: 'Basic '
                    + Base64.encode($rootScope.me.user + ':' + $rootScope.me.PWD)
                }
            }).success(function(hosts) {
                $scope.hostsip = [];
                hosts.forEach(function(host) {
                   $scope.hostsip.push(host.IP);
                });
            }).error(function(err) {

            });

            $http({
                url: '/Admin/api/auth/getAllMonitorDBInstance',
                method: 'GET',
                headers: {
                    Authorization: 'Basic '
                    + Base64.encode($rootScope.me.user + ':' + $rootScope.me.PWD)
                }
            }).success(function(DBs) {
                $scope.DBs = [];
                DBs.forEach(function(db) {
                    $scope.DBs.push(db.DBInstance);
                });
            }).error(function(err) {

            });

            /*
            * /getMonitorDBDataByDBname
             /getAllMonitorDBInstance
            * */


            $scope.hostSelected = function() {
                myHostsChart = echarts.init(document.getElementById('host'));
                getHostInfo($scope.selectedHostIP);
            };

            var getHostInfo = function(ip) {
                $http({
                    url: '/Admin/api/auth/getMonitorHostDataByIP',
                    method: 'GET',
                    params : {
                      ip : ip
                    },
                    headers: {
                        Authorization: 'Basic '
                        + Base64.encode($rootScope.me.user + ':' + $rootScope.me.PWD)
                    }
                }).success(function(host) {
                    if (Array.isArray(host) && (host.length !== 0)) {
                        updateHostChart(myHostsChart, host[0]);
                    }
                }).error(function(err) {

                });
            };

            var updateHostChart = function(chart, chartData) {

                var legend = function() {
                    var data = [];
                    if (Array.isArray(chartData.disk) && (chartData.disk.length !== 0)) {
                        for (var prop in chartData.disk[0]) {
                            if (prop !== 'timestamp') {
                                data.push(prop);
                            }
                        }
                    }
                    return data;
                }();

                var xData = function() {
                    var data = [];
                    chartData.disk.forEach(function(item){
                        data.push(new Date(item.timestamp * 1000).toLocaleString().replace(' ', '\n'));
                    });

                    return data;
                }();


                var itemStyle = {
                    "normal": {
                        "barBorderRadius": 0,

                    }
                };

                var series = function() {
                    var data = [];
                    legend.forEach(function(item) {
                        var obj = {};
                        obj.name = item;
                        obj.type = "bar";
                        obj.stack = "总量";
                        obj.itemStyle = itemStyle;
                        obj.data = [];
                        data.push(obj);
                    });
                    var total = {
                        name: '总使用(TB)',
                        "type": "line",
                        "stack": "总量",
                        symbolSize:10,
                        symbol:'circle',

                        data: []
                    };
                    chartData.disk.forEach(function(item) {
                        var all = 0;
                        for (var prop in item) {

                            if (prop !== 'timestamp') {
                                var target;
                                for (var i in data) {
                                    if (data[i].name == prop) {
                                        target = data[i];
                                        break;
                                    }
                                }
                                target.data.push(item[prop].UsePercent.replace('%', ''));
                                all += item[prop].Used;
                            }
                        }
                        total.data.push(all/1024);
                    });
                    data.push(total);
                    return data;
                }();

                var option = {
                    "tooltip": {
                        "trigger": "axis",
                        "axisPointer": {
                            "type": "shadow",
                            textStyle: {
                                color: "#fff"
                            }

                        }
                    },
                    "grid": {
                        "borderWidth": 0,
                        "top": 110,
                        "bottom": 95,
                        textStyle: {
                            color: "#fff"
                        }
                    },
                    "legend": {
                        x: '4%',
                        top: '11%',
                        "data": legend
                    },


                    "calculable": true,
                    "xAxis": [{
                        "type": "category",
                        "splitLine": {
                            "show": false
                        },
                        "axisTick": {
                            "show": false
                        },
                        "splitArea": {
                            "show": false
                        },
                        "axisLabel": {
                            "interval": 0

                        },
                        "data": xData
                    }],
                    "yAxis": [{
                        "type": "value",
                        "splitLine": {
                            "show": false
                        },
                        "axisTick": {
                            "show": false
                        },
                        "axisLabel": {
                            "interval": 0
                        },
                        "splitArea": {
                            "show": false
                        }

                    }],
                    "dataZoom": [{
                        "show": true,
                        "height": 30,
                        "xAxisIndex": [
                            0
                        ],
                        bottom: 30,
                        "start": 30,
                        "end": 100,
                        handleIcon: 'path://M306.1,413c0,2.2-1.8,4-4,4h-59.8c-2.2,0-4-1.8-4-4V200.8c0-2.2,1.8-4,4-4h59.8c2.2,0,4,1.8,4,4V413z',
                        handleSize: '110%'
                    }, {
                        "type": "inside",
                        "show": true,
                        "height": 15,
                        "start": 1,
                        "end": 35
                    }],
                    "series": series
                };

                chart.setOption(option);
            };



            var updateDBChart = function(chart, chartData, dbinstname) {
                var legend = function() {
                    var data = [];
                    data.push('总大小(GB)');
                    data.push('已使用(GB)');
                    data.push('使用率(%)');
                    data.push('空闲(GB)');
                    return data;
                }();

                var xData = function() {
                    var data = [];
                    chartData.TableSpace.forEach(function(item){
                        data.push(new Date(item.timestamp * 1000).toLocaleString().replace(' ', '\n'));
                    });
                    return data;
                }();


                var itemStyle = {
                    "normal": {
                        "label": {
                            "show": true,
                            "position": "top",
                            formatter: function(p) {
                                return p.value > 0 ? (p.value) : '';
                            }
                        }
                    }
                };

                var series = function() {
                    var data = [];
                    legend.forEach(function(item) {
                        var obj = {};
                        obj.name = item;
                        obj.type = "line";
                        obj.itemStyle = itemStyle;
                        obj.data = [];
                        data.push(obj);
                    });

                    chartData.TableSpace.forEach(function(item) {
                        for (var prop in item) {
                            if (prop !== 'timestamp' && prop === dbinstname) {
                                data.forEach(function(one) {
                                   switch(one.name) {
                                       case '总大小(GB)':
                                           one.data.push(parseFloat(item[prop].TotalSize));
                                           break;
                                       case '已使用(GB)':
                                           one.data.push(parseFloat(item[prop].Used));
                                           break;
                                       case '使用率(%)':
                                           one.data.push(parseFloat(item[prop].UsedPercent));
                                           break;
                                       case '空闲(GB)':
                                           one.data.push(parseFloat(item[prop].Free));
                                           break;
                                   }
                                });
                            }
                        }
                    });
                    return data;
                }();

                var option = {
                    "tooltip": {
                        "trigger": "axis",
                        axisPointer: {
                            animation: false
                        }
                    },
                    "grid": {
                        "borderWidth": 0,
                        "top": 110,
                        "bottom": 95,
                        textStyle: {
                            color: "#fff"
                        }
                    },
                    "legend": {
                        x: '4%',
                        top: '0%',
                        "data": legend
                    },


                    "calculable": true,
                    "xAxis": [{
                        "type": "category",
                        "splitLine": {
                            "show": false
                        },
                        "axisTick": {
                            "show": false
                        },
                        "splitArea": {
                            "show": false
                        },
                        "axisLabel": {
                            "interval": 0

                        },
                        "data": xData
                    }],
                    "yAxis": [{
                        "type": "value",
                        "splitLine": {
                            "show": false
                        },
                        "axisTick": {
                            "show": false
                        },
                        "axisLabel": {
                            "interval": 0
                        },
                        "splitArea": {
                            "show": false
                        }

                    }],
                    "dataZoom": [{
                        "show": true,
                        "height": 30,
                        "xAxisIndex": [
                            0
                        ],
                        bottom: 30,
                        "start": 30,
                        "end": 100,
                        handleIcon: 'path://M306.1,413c0,2.2-1.8,4-4,4h-59.8c-2.2,0-4-1.8-4-4V200.8c0-2.2,1.8-4,4-4h59.8c2.2,0,4,1.8,4,4V413z',
                        handleSize: '110%'
                    }, {
                        "type": "inside",
                        "show": true,
                        "height": 15,
                        "start": 1,
                        "end": 35
                    }],
                    "series": series
                };
                chart.setOption(option);
            };



            $scope.DBNameSelected = function() {
                getDBData($scope.selectedDBName);
                $scope.selectedDBType = '';
            };

            $scope.DBData = {};

            var getDBData = function(dbname) {
                $http({
                    url: '/Admin/api/auth/getMonitorDBDataByDBname',
                    method: 'GET',
                    params : {
                        dbname : dbname
                    },
                    headers: {
                        Authorization: 'Basic '
                        + Base64.encode($rootScope.me.user + ':' + $rootScope.me.PWD)
                    }
                }).success(function(data) {
                    if (Array.isArray(data) && (data.length !== 0)) {
                        $scope.DBData = data[0];
                    }

                    $scope.DBInstNames = [];
                    var tableSpaceAry = $scope.DBData.TableSpace;
                    for (var prop in tableSpaceAry[tableSpaceAry.length - 1]) {
                        if ( prop !== 'timestamp') {
                            $scope.DBInstNames.push(prop);
                        }
                    }

                }).error(function(err) {

                });
            };

            $scope.DBShowHistory = function() {
                myDBChart = echarts.init(document.getElementById('DBChart'));
                updateDBChart(myDBChart, $scope.DBData, $scope.selectedDBInstName)
            };

            $scope.toArrayAndFilterTimestamp = function(items) {
                var result = [];
                angular.forEach(items, function(value, key) {
                    if (key !== 'timestamp') {
                        var obj = {};
                        obj.tableSpaceName = key;
                        for (var prop in value) {
                            obj[prop] = value[prop];
                        }
                        result.push(obj);
                    }
                });
                return result;
            };

            window.onresize = function() {
                myHostsChart.resize;
                myDBChart.resize;
            };


    }]
});

//end of file