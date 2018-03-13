$(document).ready(function () {


	$.get( "./menu.yaml", function(yaml) {

		$.each(jsyaml.load(yaml), function(key, value) { 
			$('#list').append(createHtml(key, value))
		})

	}).fail(function(jqXHR, textStatus) {
		alert('Error in index.yaml: '+textStatus)
		console.log(textStatus)
	});


    $("#list").on("click", "li a", function() {
    	let elem = $(this)

		let url = elem.data('url')

		$.get("pages/"+url, function(data) {

			let sd = new showdown.Converter({noHeaderId: 'true'})

			let bf = ""
			let af = ""

			if(url.endsWith('/chapter.md')){
				bf = '<div id="chapter">'
				af = '</div>'
			}

			$('#body').html(bf+sd.makeHtml(data)+af)
		});

		$("#list li a").removeClass('active')
		
		elem.addClass('active')


		elem.blur()

		$("#list li ul").not(elem.parent().parent()).collapse('hide')

    });

    // $("#list").on( "click", ".collapse", function() {
    // 	$("#list li ul").collapse('hide')
    // });

/*
	toggle sidebar when button clicked
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
*/



});


function createHtml(key, page){
	// console.log(page)
	html =  '<li>'
	html += '  <a href="#menu-'+ key +'" data-url="'+ page.dir +'/chapter.md" data-toggle="collapse"><span>'+ page.id +'. </span> '+ page.title +'</a>'
	html += '  <ul id="menu-'+ key +'" class="list-unstyled collapse">'	
	
	$.each(page.items, function(key2, item) { 
		//console.log(item)
		html += '<li><a href="#'+ page.dir +'" data-url="'+ page.dir +'/'+item.file+'.md">'+ item.title +'</a></li>'
	});
													
	html += '  </ul>'
	html +=  '</li>'


	return html
}


// <li><a href="#" data-url='Basic/what-is-githow.md'><span>1.</span> Sidebar Link</a></li>
