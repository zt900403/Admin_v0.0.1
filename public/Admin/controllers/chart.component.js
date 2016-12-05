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
                        "label": {
                            "show": true,
                            "position": "insideBottom",
                            formatter: function(p) {
                                return p.value > 0 ? ('已使用 ' + p.value + '%') : '';
                            }
                        }
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
                        "itemStyle": {
                            "normal": {
                                "barBorderRadius": 0,
                                "label": {
                                    "show": true,
                                    "position": "top",
                                    formatter: function(p) {
                                        return p.value > 0 ? ('总使用(TB): ' + p.value.toFixed(3)) : '';
                                    }
                                }
                            }
                        },
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



            var updateDBChart = function(chart, chartData, dataname) {
                var legend = function() {
                    var data = [];
                    if (Array.isArray(chartData.TableSpace)
                        && (chartData.TableSpace.length !== 0)) {
                        for (var prop in chartData.TableSpace[0]) {
                            if (prop !== 'timestamp') {
                                data.push(prop);
                            }
                        }
                    }
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
                            if (prop !== 'timestamp') {
                                var target;
                                for (var i in data) {
                                    if (data[i].name == prop) {
                                        target = data[i];
                                        break;
                                    }
                                }
                                target.data.push(parseFloat(item[prop][dataname]));
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

                }).error(function(err) {

                });
            };

            $scope.DBShowType = function() {
                myDBChart = echarts.init(document.getElementById('DBChart'));
                updateDBChart(myDBChart, $scope.DBData, $scope.selectedDBType)
            };

            $scope.filterTimestamp = function(items) {
                var result = {};
                angular.forEach(items, function(value, key) {
                    if (key !== 'timestamp') {
                        result[key] = value;
                    }
                });
                return result;
            };

            window.onresize = function() {
                myHostsChart.resize;
                myDBChart.resize;
            };

            $scope.test = {
                a: 1,
                b: 2,
                c: 3
            };
    }]
});

//end of file