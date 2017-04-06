console.log('ready to go...');

let app = new Vue({
    el: '#app',
    data: {
        blocks: []
    },
    created: function () {
        $.getJSON('http://localhost:8080/api/blocks', function (resultat) {
            this.blocks = resultat;
            console.log(resultat);
        })
    }
});


