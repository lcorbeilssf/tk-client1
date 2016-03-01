describe('magicSort', function(){
    var sortObject;
    // load the controller's module
    beforeEach(module('ionic'));
   
    beforeEach(module('sortingArray'));
    
    //Inject the scope and save it in a variable
    beforeEach(inject(function( sortService) {
        sortObject = sortService;
    }));
    // tests start here
    it('should have a title with  Login', function(){
        var unsortedArray = [6, 9, 4, 3];
        var sortedArray = [3, 4, 6, 9];
        var sorted = sortObject.sort(unsortedArray);
        expect(sortedArray).toEqual(sorted);
        
    });
});
