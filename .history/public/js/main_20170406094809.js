console.log('ready to go...');


if ($('#search').length) {

    $('#search').keyup(function () {
        var word = $('#search').val();
        $("table tr").hide();
        if (word.length > 3) {
            $("table tr:contains('" + word + "')").show();
        } else {
            $("table tr").show();
        }

    })
}

