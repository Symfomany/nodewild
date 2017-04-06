console.log('ready to go...');


if ($('#search').length) {

    $('#search').keyup(function () {
        var word = $('#search').val();
        $("table tr td").css("visibility", "visible");

        if (word.length > 3) {
            $("table tr td:contains('" + word + "')").each(function () {
                $(this).siblings('td.ms-vb-icon').css("visibility", "hidden");
            });
        } else {
            $("table tr td").css("visibility", "visible");
        }

    })
}

