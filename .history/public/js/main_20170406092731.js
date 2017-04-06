console.log('ready to go...');

let app = new Vue({
    el: '#app',
    data: {
        blocks: []
    },
    created: function () {
        // `this` points to the vm instance
        console.log('a is: ' + this.a)
    }
});


