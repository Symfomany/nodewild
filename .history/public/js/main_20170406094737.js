console.log('ready to go...');


if ($('#search').length) {

    $('#search').keyup(function () {
        var word = $('#search').val();
        console.log(word);
        $("table tr").hide();

        if (word.length > 3) {
            $("table tr:contains('" + word + "')").hide();
        } else {
            $("table tr").show();
        }

    })
}

