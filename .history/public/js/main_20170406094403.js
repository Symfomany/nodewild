console.log('ready to go...');


if ($('#search').length) {

    $('#search').keyup(function () {
        let word = $('#search').val();
        if (word.length > 3) {
            $("table tr td:contains('" + word + "')").each(function () {
                $(this).siblings('td.ms-vb-icon').css("visibility", "hidden");
            });
        }


    })
}

