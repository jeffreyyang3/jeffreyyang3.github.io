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
function Shuffle(o) {
    for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

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

var vueC = {
    data: function(){
        return {
            status: "xxx"
        }
    },
    template: '<p> cool: {{ status }} </p>'
}


new Vue({
    el: '#xx',
    components: {
        'my-cmp': vueC
    }
})


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
                    setTimeout(timeoutSort, 25, array, i + 1);
                }
            }, 25, this.array, 0);

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
            
            for (i = 0; i < x + 1; i+= 0.15) {
                a.push(i + 1);
            }
            

            Shuffle(a)
            this.array = a
        },
        
        divClasses: function(h) {
            return {
                width: '3px',
                height: h + 'px',
                display: 'block',
                backgroundColor: this.randomColor(),
                //opacity: .75,
                float: 'left',
                marginTop: '0px'
            

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
    mounted(){
        this.bigArray(16);
        this.insertionSort();
    }

});


