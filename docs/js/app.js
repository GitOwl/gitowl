 "use strict"
var config

$(function(){

	////////////// LOAD CONFIG //////////////
	$.get('./config.yaml', function(file) {
		config = jsyaml.load(file)

		$('head').append('<link rel="stylesheet" href="themes/'+config.theme+'/css/app.css"/>')
		$('.logo').html(config.logo)
		$('#h-title').html(config.title)

		if(config.lang.active) create.drop(config.lang.list, "lang")
		if(config.versions.active) create.drop(config.versions.list, "version")


	}).fail(function(req, textStatus) {
		console.log('Error in config.yaml: '+textStatus)
	}).always(function() {
		$('body').fadeIn(1000)

		////////////// LOAD ROUTES //////////////		
		$.get('./routes.yaml', function(file) {
			$.each(jsyaml.load(file), function(i, item) { 
				$('#list').append(create.menuItem(i, item))
			})

			if(location.hash.length > 0){
				let elem = $("#list li a[href='"+location.hash+"']")
				
				changePage(elem)
				 $('.active').closest('ul').collapse('show') 
			} 
		
		}).fail(function(req, textStatus) {
			console.log('Error in menu.yaml: ')
			$('#error-sidebar').show()
		}).always(function() {
			if(config.bullet.level1) $('.b-level1').show()
			if(config.bullet.level2) $('.b-level2').show()
			new PerfectScrollbar('#scroll', config.perfectscrollbar);
			$('#loading-sidebar').hide()
		})
	})

	$('#search-by').on('keyup', function() {

		let search = $(this).val()

		$('.sb-close').show()

		$('#list li').filter(function() {
			$(this).toggle($(this).text().toLowerCase().indexOf(search.toLowerCase()) > -1)
		})

		if($(this).val().length == 0){
			$('#list li ul').not($('.active').parent().parent()).collapse('hide')
		}else{
			$('#list li ul').collapse('show')
		}

		$('text').each(function(i, item) {
			let re = new RegExp(search, 'i')
			$(item).html($(item).text().replace(re, '<high>'+re.exec($(item).text())+'</high>'))
		})


	})

	$('.searchbox').on('click','.sb-close',  function() {
		$('#search-by').val('').keyup()
		$('.sb-close').hide()
	})


	$('#list').on('click', 'li a', function() {
		changePage($(this))
		$('#sidebar').removeClass('toggled')
	})

	$('#navigation').on('click', 'a.nav-prev, a.nav-next', function() {
		let elem = $($("a[href='"+$(this).attr('href')+"']")).show()
		elem.parent().parent().collapse('show')
		changePage(elem)

	}).on('click','a.nav-menu', function () {
		$('#sidebar').addClass('toggled')
	})

});


var	create = {
	////////////// DROPS //////////////
	drop(list, value){
		let elem = $("#drop-"+value)

		$.each(list, function(i, item) { 
			let icon = ''
			
			if(item.default != undefined){
				icon = '<i class="fa fa-check"></i>'
			} 
				
			elem.append('<li><a href="#">'+item.title+' '+icon+'</a></li>')
		})
	},

	////////////// MENUITEM //////////////
	menuItem(i, page){
		if(page.items == undefined){
			return `<li><a href="#${page.file}" data-url="${page.file}" data-ftitle="${escape(page.title)}" class="menuitem">
						<span class="b-level1">${page.id}. </span><text>${page.title}</text>
					</a></li>`
		}

		let html = `<li>
					 <a href="#${i+1}/${page.folder}" data-url="${page.folder}/chapter.md" data-ftitle="${escape(page.title)}" data-toggle="collapse" class="menuitem">
						<span class="b-level1">${page.id}. </span><text>${page.title}</text>
					 </a>
						<ul id="${i+1}/${page.folder}" class="list-unstyled collapse">`

		$.each(page.items, function(j, item) { 
			let path = page.folder +'/'+item.file
			html += `<li><a href="#${path}" data-url="${path}" data-ftitle="${escape(page.title)}" data-title="${escape(item.title)}" class="menuitem">
						<span class="b-level2">${page.id}.${(j+1)} </span> <text>${item.title}</text>
					</a></li>`
		});
														
		return html + '</ul></li>'
	},


	////////////// NAVS //////////////
	navs(active){
		let prev = $($('.menuitem')[active-1])
		let next = $($('.menuitem')[active+1])

		let htmlPrev = `<a href="${prev.attr('href')}" class="nav nav-prev col-xs-4" data-url="${prev.data('url')}" data-ftitle="${prev.data('ftitle')}">
							<i class="fa fa-chevron-left"></i>
						</a>`
		
		let htmlMenu = `<a href="#" id="sidebar-toggle" class="nav nav-menu col-xs-4" data-sidebar-toggle><i class="fa fa-bars"></i></a>`


		let htmlNext = `<a href="${next.attr('href')}" class="nav nav-next col-xs-4" data-url="${next.data('url')}" data-ftitle="${next.data('ftitle')}">
							<i class="fa fa-chevron-right"></i>
						</a>`

		if(next.data('url') == undefined || !config.nav.next) htmlNext = ''
		if(prev.data('url') == undefined || !config.nav.prev) htmlPrev = ''

		$('#navigation').html(htmlPrev+htmlMenu+htmlNext);
	},

	////////////// BREADCRUMB //////////////
	breadcrumb(elem){
		let folder = splitUrl(elem.url)[0]
		
		$('#top-bar').remove()

		let html = `<div id="top-bar">
						<div id="top-bar-buttons">
							<a class="github-link" href="#"><i class="fa fa-pencil"></i></a>
						</div>
						<div id="breadcrumbs" itemscope="" itemtype="http://data-vocabulary.org/Breadcrumb">
							<span class="bc-folder" itemprop="title">${unescape(elem.ftitle)}</span>`
					
		if(elem.title !== undefined){
			html +=	`<i class="fa fa-angle-right bc-separator"></i>
						<span class="bc-file" itemprop="title">${unescape(elem.title)}</span>`
		  }

		return html + '</div></div>'
	}

}


function changePage(elem){
	// TODO: Return if la pagina a cambiar es la misma que se clickea

	let url = elem.data('url')
    
	$('#loading-body').show()

	$.get('pages/'+url, function(data) {
		$('#error-body').hide()
		
		if(url.endsWith('/chapter.md')){				
			if(!$('#chapter').length > 0){
				$('#body-inner').wrap('<div id="chapter"></div>')					
			}
			location.hash = elem.prop('hash')
			
		} else {
			$('#chapter').contents().unwrap()
		}
	
		$('#body-content').prepend(create.breadcrumb(elem.data()))

		if(url.endsWith('.md')){	
			let sd = new showdown.Converter(config.showdown)

			$('#body-inner').html(sd.makeHtml(data))
		}else{
			$('#body-inner').html(data)

		}
		
	}).fail(function(req, textStatus) {
		$('#body-inner').html('')
		$('#error-body').show().find('p').text('Error '+req.status)
	}).always(function() {
		$('#loading-body').hide()
	})


	$('#list li a').removeClass('active')	
	elem.addClass('active').blur()

	$('#list li ul').not(elem.parent().parent()).collapse('hide')
	


	$.each($('.menuitem'), function(i, menuitem) { 
		if($(menuitem).hasClass('active')) {
			create.navs(i)
			return false;
		}
	})

}

function splitUrl(url){
	return url.split('/#!/')[0].split('/');
}




/// ADENTRO DE READY
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