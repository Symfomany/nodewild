console.log('ready to go...');

let app = new Vue({
    el: '#app',
    data: {
        blocks: []
    },
    created: function () {
        this.blocks = $.getJSON('http://localhost:8080/api/blocks')
    }
});


