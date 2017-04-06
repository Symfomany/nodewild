console.log('ready to go...');


if ($('#search').length) {

    $('#search').keyup(function () {
        var word = $('#search').val();
        $("table tr").show();

        if (word.length > 3) {
            $("table tr:contains('" + word + "')").hide();
        } else {
            $("table tr").show();
        }

    })
}

