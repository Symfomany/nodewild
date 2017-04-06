console.log('ready to go...');


if ($('#search').length) {

    $('#search').keyup(function () {
        var word = $('#search').val();
        console.log(word);
        $("table tr").css("visibility", "visible");

        if (word.length > 3) {
            $("table tr td:contains('" + word + "')").each(function () {
                $(this).parent().css("visibility", "hidden");
            });
        } else {
            $("table tr").css("visibility", "visible");
        }

    })
}

