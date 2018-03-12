$(document).ready(function () {
	// toggle sidebar when button clicked
	$('.sidebar-toggle').on('click', function () {
		$('.sidebar').toggleClass('toggled');
	});

	// auto-expand submenu if an item is active
	var active = $('.sidebar .active');

	if (active.length && active.parent('.collapse').length) {
		var parent = active.parent('.collapse');

		parent.prev('a').attr('aria-expanded', true);
		parent.addClass('show');
	}


    $(".list a").click(function(){
		$.get("pages/"+$(this).data('url'), function (data) {
			$('#body').html(new showdown.Converter().makeHtml(data));
		});
    });

});