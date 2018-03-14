$(function(){

	var config
	var menu

	if(location.hash.length > 0){

		//console.log(location.hash)
	} 


	////-- Load file: Config --////
	$.get( "./config.yaml", function(yaml) {
		config = jsyaml.load(yaml)
	}).fail(function(req, textStatus) {
		console.log('Error in config.yaml: '+textStatus)
		console.log(req)
	});

	////-- Load file: Menu --////
	$.get( "./menu.yaml", function(yaml) {
		menu = jsyaml.load(yaml)
		//console.log(menu)
		
		$.each(jsyaml.load(yaml), function(key, values) { 
			$('#list').append(createMenuItem(key, values))
		})
	}).fail(function(req, textStatus) {
		console.log('Error in menu.yaml: ')
		console.log(req)
		$('#error-sidebar').show()
	}).always(function() {
		$('#loading-sidebar').hide()
	})

	////-- OnClick: Sidebar MenuItem --////
	$("#list").on("click", "li a", function() {
		$('#loading-body').show()

		let elem = $(this)
		
		changePage(elem)

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

/*
	$(window).bind('hashchange', function(){
		alert(location.hash)
	})

  	// Trigger the event (useful on page load).
  	$(window).hashchange();
*/
});


function createMenuItem(key, page){
	html =  `<li>
				<a href="#${page.folder}" data-url="${page.folder}/chapter.md" data-folder=${page.folder} data-ftitle=${escape(page.title)} data-toggle="collapse"><span>${page.id}. </span> ${page.title}</a>
				<ul id="${page.folder}" class="list-unstyled collapse">`

	$.each(page.items, function(key2, item) { 
		let path = page.folder +'/'+item.file
		html += `<li><a href="#${path}" data-url="${path}.md" data-folder=${page.folder} data-ftitle=${escape(page.title)} data-title=${escape(item.title)}  ><span>${page.id}.${(key2+1)}</span> ${item.title}</a></li>`
	});
													
	return html + '</ul></li>'
	
	// <li><a href="#" data-url='Basic/what-is-githow.md'><span>1.</span> Sidebar Link</a></li>
}

function changePage(elem){
	let url = elem.data('url')
	let path = url.split("/#!/")[0].split("/");

	$.get("pages/"+url, function(data) {
		$('#error-body').hide()
		
		if(url.endsWith('/chapter.md')){				
			if(!$("#chapter").length > 0){
				$("#body-inner").wrap("<div id='chapter'></div>")					
			}
			
		} else {
			$('#chapter').contents().unwrap()
		}
	
		$('#top-bar').remove()
		$('#body-content').prepend(createBreadcrumb(elem.data()))
		$('#body-inner').html(new showdown.Converter({noHeaderId: 'true'}).makeHtml(data))
		


	}).fail(function(req, textStatus) {
		//console.log(req)
		$('#body-inner').html('')
		$('#error-body').show().find('p').text('Error '+req.status)
	}).always(function() {
		$('#loading-body').hide()
	})
}




function createBreadcrumb(elem){
	console.log(elem)

	// elem.folder cambiar al title de folder

	let html = `<div id="top-bar">
					<div id="top-github-link">
						<a class="github-link" href="#"><i class="fa fa-pencil"></i></a>
					</div>
					<div id="breadcrumbs" itemscope="" itemtype="http://data-vocabulary.org/Breadcrumb">
						<a href="#${elem.folder}" itemprop="url" class="bc-url"><span class="bc-folder" itemprop="title">${unescape(elem.ftitle)}</span></a>`
	
	if(elem.title !== undefined){
		html +=	`<i class="fa fa-angle-right bc-separator"></i>
					<span class="bc-file" itemprop="title">${unescape(elem.title)}</span>`
	  }

	return html + '</div></div>'
}