$(function(){

	var config
	var menu

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

		$.each(menu, function(key, item) { 
			$('#list').append(createMenuItem(key, item))
		})

		if(location.hash.length > 0){
			let elem = $("#list li a[href='"+location.hash+"']")
			
			changePage(elem)
			 $('.active').closest('ul').collapse("show") 
		} 
	
	}).fail(function(req, textStatus) {
		console.log('Error in menu.yaml: ')
		console.log(req)
		$('#error-sidebar').show()
	}).always(function() {
		$('#loading-sidebar').hide()
	})

	////-- OnClick: Sidebar MenuItem --////

	$("#list").on("click", "li a", function() {
		changePage($(this))
	});

	////-- OnClick: Navigator --////

	$("#navigation").on("click", "a", function() {
		console.log($('.active').data('url'))
		//changePage($(this))
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
	if(page.items == undefined){
		return `<li><a href="#${page.file}" data-url="${page.file}.md" data-ftitle=${escape(page.title)}><span>${page.id}.</span> ${page.title}</a></li>`
	}

	html =  `<li>
				<a href="#${page.folder}" data-url="${page.folder}/chapter.md" data-ftitle=${escape(page.title)} data-toggle="collapse"><span>${page.id}. </span> ${page.title}</a>
				<ul id="${page.folder}" class="list-unstyled collapse">`

	$.each(page.items, function(key2, item) { 
		let path = page.folder +'/'+item.file
		html += `<li><a href="#${path}" data-url="${path}.md" data-ftitle=${escape(page.title)} data-title=${escape(item.title)}  ><span>${page.id}.${(key2+1)}</span> ${item.title}</a></li>`
	});
													
	return html + '</ul></li>'
	
	// <li><a href="#" data-url='Basic/what-is-githow.md'><span>1.</span> Sidebar Link</a></li>
}

function changePage(elem){
	let url = elem.data('url')

	$('#loading-body').show()

	$.get("pages/"+url, function(data) {
		$('#error-body').hide()
		
		if(url.endsWith('/chapter.md')){				
			if(!$("#chapter").length > 0){
				$("#body-inner").wrap("<div id='chapter'></div>")					
			}
			location.hash = elem.prop('hash')
			
		} else {
			$('#chapter').contents().unwrap()
		}
	
		$('#body-content').prepend(createBreadcrumb(elem.data()))
		
		let sd = new showdown.Converter({noHeaderId: 'true',
										 parseImgDimensions: 'true',
										 simplifiedAutoLink: 'true',
										 excludeTrailingPunctuationFromURLs: 'true',
										 strikethrough: 'true',
										 tables: 'true',
										 tasklists: 'true'
										})

		$('#body-inner').html(sd.makeHtml(data))
		

	}).fail(function(req, textStatus) {
		//console.log(req)
		$('#body-inner').html('')
		$('#error-body').show().find('p').text('Error '+req.status)
	}).always(function() {
		$('#loading-body').hide()
	})


	$("#list li a").removeClass('active')	
	elem.addClass('active')
	
	elem.blur()

	$("#list li ul").not(elem.parent().parent()).collapse('hide')
}

function splitUrl(url){
	return url.split("/#!/")[0].split("/");
}


function createBreadcrumb(elem){
	let folder = splitUrl(elem.url)[0]
	
	$('#top-bar').remove()

	let html = `<div id="top-bar">
					<div id="top-github-link">
						<a class="github-link" href="#"><i class="fa fa-pencil"></i></a>
					</div>
					<div id="breadcrumbs" itemscope="" itemtype="http://data-vocabulary.org/Breadcrumb">
						<a href="#${folder}" itemprop="url" class="bc-url"><span class="bc-folder" itemprop="title">${unescape(elem.ftitle)}</span></a>`
	
	if(elem.title !== undefined){
		html +=	`<i class="fa fa-angle-right bc-separator"></i>
					<span class="bc-file" itemprop="title">${unescape(elem.title)}</span>`
	  }

	return html + '</div></div>'
}