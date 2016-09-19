/**
 * Created by Lenovo on 2016/9/19.
 */
angular.
    module('navbar', ['AdminApp']).
    service('navbarInterface', ['$http', 'Base64', function($http, Base64) {
        var filenames = [];
        var files = [];
        var username;
        var passwd;


        var setUserAndPasswd = function(user, PWD) {
            username = user;
            passwd = PWD;
        };
        var getfiles = function() {
            $http({
                url: '/Admin/api/auth/validFilenamesAndLock',
                method: 'GET',
                headers: {
                    Authorization: 'Basic '
                    + Base64.encode(username + ':' + passwd)
                }
            }).success(function(result) {

                files.splice(0, files.length);
                filenames.splice(0, filenames.length);

                result.forEach(function(obj) {
                    files.push(obj);
                    filenames.push(obj.filename);
                });
            }).error(function(err) {

            });

        };


        return {
            files : files,
            filenames: filenames,
            getfiles: getfiles,
            setUserAndPasswd: setUserAndPasswd
        }
    }]);



//end of file