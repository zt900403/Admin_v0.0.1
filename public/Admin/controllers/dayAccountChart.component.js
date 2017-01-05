/**
 * Created by Lenovo on 2017/1/5.
 */
/**
 * Created by ZT on 2016/9/24.
 */

angular.
module('dayAccountChart', ['ngRoute', 'AdminApp'])
    .component('dayAccountChart', {
        templateUrl: 'pages/dayAccountChart.html',
        controller: ['$rootScope', '$scope', '$http', 'Base64',
            function($rootScope, $scope, $http, Base64) {
                var myInterfaceMapChart = echarts.init(document.getElementById('dayInterfacesMap'));
                option = {
                    backgroundColor: '#404a59',
                    title: {
                        text: '日接口上传情况',
                        left: 'center',
                        textStyle: {
                            color: '#fff'
                        }
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: '{b}'
                    },
                    series: [
                        {
                            name: '中国',
                            type: 'map',
                            mapType: 'china',
                            selectedMode : 'single',
                            roam: true,
                            label: {
                                normal: {
                                    show: true
                                },
                                emphasis: {
                                    show: true
                                }
                            },
                            itemStyle: {
                                normal: {
                                    borderColor: '#aaa',
                                    areaColor: '#555'
                                }
                            },
                            data:[
                                {name:'广东', selected:true}
                            ]
                        }
                    ]
                };
                myInterfaceMapChart.on('click', function(param) {
                    alert(param.name);
                });
                myInterfaceMapChart.setOption(option);




            }]
    });

//end of file