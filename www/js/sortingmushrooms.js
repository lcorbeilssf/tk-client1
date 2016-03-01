angular.module('SortingArray', [])
    .service('magicSort', function() {
        //comes out sorted
        service.sort = function(unsortedArray) {
            var sortedArray = unsortedArray;
            var swapped;
            for (var i = 0; i <= sortedArray.length; i++) {
                if (sortedArray[i] > sortedArray[i + 1]) {
                    var temp = sortedArray[i];
                    sortedArray[i] = sortedArray[i + 1];
                    sortedArray[i + 1] = temp;
                }
            }
            return sortedArray;
        };
    });