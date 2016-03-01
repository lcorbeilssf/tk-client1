angular.module('SortingArray', [])
    .service('magicSort', function() {
        //comes out sorted
        service.sort = function(unsortedArray) {
            var sortedArray = unsortedArray;
            var swapped;
            do {

                swapped = false
                for (var i = 0; i <= sortedArray.length; i++) {
                    if (sortedArray[i] > sortedArray[i + 1]) {
                        var temp = sortedArray[i];
                        sortedArray[i] = sortedArray[i + 1];
                        sortedArray[i + 1] = temp;
                        swapped = true;
                    }
                }
            } while (swapped);
            return sortedArray;
        };
    });