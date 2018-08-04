function arrayStep(arry,i){
    arry.push()
    var temp = arry[i];
    var j = i - 1;
    while (j >= 0 && arry[j] > temp) {
        arry[j + 1] = arry[j];
        j--;
    }
    arry[j + 1] = temp;
    
}


function merge(left, right) {
    var result = [];
    while (left.length && right.length) {
        if (left[0] <= right[0]) {
            result.push(left.shift());
        } else {
            result.push(right.shift());
        }
    }
    while (left.length)
        result.push(left.shift());
    while (right.length)
        result.push(right.shift());
    
    return result;
}
var vm = new Vue({
    el: '#exercise',
    data: {
        number: 0,
        array: [],   
    },

    methods:{
        insertionSort: function(){
            setTimeout(function timeoutSort(array, i) {
                if (i < array.length) {
                    arrayStep(array, i);
                    setTimeout(timeoutSort, 10, array, i + 1);
                }
            }, 10, this.array, 0);

            return this.array;

        },
        mergeSort: function(){ //not operational
            setTimeout(function timeoutSort(array){
                if(array.length < 2){
                    
                    return this.array;
                }
                else{
                    console.log("xxx")
                    var middle = parseInt(array.length / 2);
                    var left = array.slice(0, middle);
                    var right = array.slice(middle, array.length);
                    return merge(setTimeout(timeoutSort, 10, left), setTimeout(timeoutSort, 10, right));
                }
            }, 10, this.array);

        },

        
        bigArray: function (numberStr) {
            x = parseInt(numberStr)
            a = []
            
            for (i = 0; i < x + 1; i++) {
                a.push(Math.random() * 300);
            }
            

            
            this.array = a
        },
        
        divClasses: function(h) {
            return {
                width: '5px',
                height: h + 'px',
                display: 'inline-block',
                backgroundColor: this.randomColor(),
                float: 'left',
                //opacity: .9
            };
        },

        randomColor: function() {
            var letters = '0123456789ABCDEF';
            var color = '#';
            for(var i = 0; i< 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];        
            }
        return color;
        },



    },

});


/*

        
new Vue({
    el: '#exercise',
    data: {
        isShown: true,
        array: ['Max', 'Anna', 'Chris', 'Manu'],
        myObject: {
            title: 'Lord of the Rings',
            author: 'J.R.R. Tolkiens',
            books: '3'
        },
        testData: {
            name: 'TESTOBJECT',
            id: 10,
            data: [1.67, 1.33, 0.98, 2.21]
        }
    }
});

*/
