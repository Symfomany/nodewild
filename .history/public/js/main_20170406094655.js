console.log('ready to go...');


if ($('#search').length) {

    $('#search').keyup(function () {
        var word = $('#search').val();
        console.log(word);
        $("table tr").hide();

        if (word.length > 3) {
            $("table tr td:contains('" + word + "')").each(function () {
                $(this).parent("tr").hide();
            });
        } else {
            $("table tr").show();
        }

    })
}

