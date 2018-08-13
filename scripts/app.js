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
colorArry = ['#d50000', '#c51162', '#aa00ff', '#6200ea', '#304ffe', '#2962ff', '#0091ea', '#00b8d4', '#00bfa5', '#00c853', '#64dd17', '#aeea00', '#ffd600', '#ffab00', '#ff6d00', '#dd2c00']


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
                width: '5.8px',
                height: h + 'px',
                display: 'block',
                backgroundColor: colorArry[Math.floor(Math.random() * colorArry.length)],
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
        this.bigArray(18);
        this.insertionSort();
    }

});


