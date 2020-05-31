"use strict"

var config, active = { lang: null, version: null, path: '/' }

$(function () {
	////////////// LOAD CONFIG //////////////
	$.get('./config.yaml', function (file) {
		config = jsyaml.load(file)
		$('head').append('<link rel="stylesheet" href="themes/' + config.theme + '/css/style.css"/>')

		NProgress.configure(config.nprogress)
		NProgress.start()

		$('.logo').html(config.content.logo)
		$('#h-title').html(config.content.title)
		$('.searchbox input').attr("placeholder", config.search.text);
		if (!config.search.active) $('.searchbox').hide()

		change.paths(config.paths)

		create.drop('lang')
		create.drop('version')
		NProgress.set(0.4);

	}).fail(function (req, status) {
		utils.show.sidebarError('ERROR: config.yaml')
	}).always(function () {
		$('body').fadeIn(1000)

		////////////// LOAD ROUTES //////////////		
		$.get(active.path + 'routes.yaml', function (file) {
			NProgress.set(0.8);
			$.each(jsyaml.load(file), function (i, item) {
				$('#list').append(create.menuItem(i, item))
			})

			if (location.hash.length > 0) {
				if (config.lang.active) {
					let elemVersion = $('[data-type="lang"][data-path="' + utils.splitUrl(location.hash)[1] + '"]')
					if (!elemVersion.find('i').length) change.active(elemVersion)
				}

				if (config.version.active && !config.lang.active) {
					let elemLang = $('[data-type="lang"][data-path="' + utils.splitUrl(location.hash)[2] + '"]')
					if (!elemLang.find('i').length) change.active(elemLang)
				}

				change.page($("#list li a[href='" + location.hash + "']"))
				$('.active').closest('ul').collapse('show')
			} else {
				change.home()
			}

		}).fail(function (req, status) {
			utils.show.sidebarError('ERROR: routes.yaml')
		}).always(function () {
			NProgress.done()
			new PerfectScrollbar('#scroll', config.perfectscrollbar);
			$('#loading-sidebar').hide()
		})
	})

	$('#search-by').on('keyup', function () {		
		let search = $(this).val()

		$('.sb-close').show()

		$('#list li').filter(function () {
			$(this).toggle($(this).text().toLowerCase().indexOf(search.toLowerCase()) > -1)
		})

		if ($(this).val().length == 0) {
			$('#list li ul').not($('.active').parent().parent()).collapse('hide')
		} else {
			$('#list li ul').collapse('show')
		}

		$('text').each(function (i, item) {
			let re = new RegExp(search, 'i')
			$(item).html($(item).text().replace(re, '<high>' + re.exec($(item).text()) + '</high>'))
		})

		console.log($('#list li:visible').length)
		if ($('#list li:visible').length == 0) {
			// Esta vacia la lista mostrar un mensaje
			console.log("Vacia")
		}
	})

	$('.searchbox').on('click', '.sb-close', function () {
		$('#search-by').val('').keyup()
		$('.sb-close').hide()
	})


	$('#list').on('click', 'li a', function () {
		if (!$(this).hasClass('active')) change.page($(this))
		$('#sidebar').removeClass('toggled')
	})

	$('.dropdown').on('click', 'li a', function () {
		if (!$(this).find('i').length) {
			change.active($(this))
			change.home()
		}
		$('#sidebar').removeClass('toggled')
	})

	$('#navigation').on('click', 'a.nav-prev, a.nav-next', function () {
		let elem = $($("a[href='" + $(this).attr('href') + "']")).show()
		elem.parent().parent().collapse('show')
		change.page(elem)

	}).on('click', 'a.nav-menu', function () {
		$('#sidebar').addClass('toggled')
	})

	$('#footer').on('click', function () {
		$(this).find('a')[0].click()
	})

	$("body").keypress(function (e) {

		if (config.nav.keypress && !$(e.target).is('input,select,button')) {
			switch (e.key) {
				case 'j':
				case 'ArrowLeft':
					$('a.nav-prev').click()
					break;
	
				case 'k':
				case 'ArrowRight':
					$('a.nav-next').click()
					break;
				default:
					return; // exit this handler for other keys
			}
			e.preventDefault();
		}

	})

})


var create = {

	////////////// DROPS //////////////
	drop(type) {
		if (!config[type].active) return $('#menu-' + type).parent('.dropdown').hide()
		if (config[type].hide) $('#menu-' + type).parent('.dropdown').hide()

		let elem = $("#drop-" + type)
		let paths

		if (type == 'version') {
			paths = config.lang.active ? active.lang.versions : config.paths
		} else {
			paths = config.paths
		}

		$.each(paths, function (i, item) {
			let icon = ''
			if (item.default != undefined) {
				icon = '<i id="check-' + type + '" class="fa fa-check"></i>'
				elem.parent().find('text').text(item.title)
			}

			elem.append('<li><a href="#" data-path="' + item.path + '" data-type="' + type + '">' + item.title + ' ' + icon + '</a></li>')
		})
	},


	////////////// MENUITEM //////////////
	menuItem(i, page) {
		let html

		if (page.items == undefined) {
			let href = active.path + utils.removeExt(page.file),
				url = active.path + config.pages.folder + '/' + page.file;

			html = `<li><a href="#${href}" data-url="${url}" data-ftitle="${escape(page.title)}" class="menuitem">`
			html += config.bullet.level1 ? `<span class="b-level1">${page.id}. </span>` : ''
			return html + `<text>${page.title}</text></a></li>`
		}

		let href2 = active.path + page.folder,
			folder = active.path + config.pages.folder + '/' + page.folder;

		html = `<li><a href="#${href2}" data-target="#${i + 1}-${page.folder}" data-url="${folder}/${config.pages.chapter}" data-ftitle="${escape(page.title)}" data-toggle="collapse" class="menuitem">`
		html += config.bullet.level1 ? `<span class="b-level1">${page.id}. </span>` : ''
		html += `<text>${page.title}</text>`
		html += `</a><ul id="${i + 1}-${page.folder}" class="list-unstyled collapse">`

		$.each(page.items, function (j, item) {
			let path = active.path + config.pages.folder + '/' + page.folder + '/' + item.file,
				href3 = active.path + page.folder + '/' + utils.removeExt(item.file);

			html += `<li><a href="#${href3}" data-url="${path}" data-ftitle="${escape(page.title)}" data-title="${escape(item.title)}" class="menuitem">`
			html += config.bullet.level2 ? `<span class="b-level2">${page.id}.${(j + 1)} </span> ` : ''
			html += `<text>${item.title}</text></a></li>`
		});

		return html + '</ul></li>'
	},


	////////////// NAVS //////////////
	navs(active) {
		let prev = $($('.menuitem')[active - 1])
		let next = $($('.menuitem')[active + 1])

		let htmlPrev = `<a href="${prev.attr('href')}" class="nav nav-prev col-xs-4" data-url="${prev.data('url')}" data-ftitle="${prev.data('ftitle')}">
						<i class="fa fa-chevron-left"></i>
						</a>`

		let htmlMenu = `<a href="#" id="sidebar-toggle" class="nav nav-menu col-xs-4" data-sidebar-toggle><i class="fa fa-bars"></i></a>`


		let htmlNext = `<a href="${next.attr('href')}" class="nav nav-next col-xs-4" data-url="${next.data('url')}" data-ftitle="${next.data('ftitle')}">
						<i class="fa fa-chevron-right"></i>
						</a>`

		if (next.data('url') == undefined || !config.nav.next) htmlNext = ''
		if (prev.data('url') == undefined || !config.nav.prev) htmlPrev = ''

		$('#navigation').html(htmlPrev + htmlMenu + htmlNext)
	},


	////////////// BREADCRUMB //////////////
	breadcrumb(elem) {
		let folder = utils.splitUrl(elem.url)[0]

		$('#top-bar').remove()

		let html = `<div id="top-bar">
					<div id="top-bar-buttons">
					<a class="github-link" href="#"><i class="fa fa-pencil"></i></a>
					</div>
					<div id="breadcrumbs" itemscope="" itemtype="http://data-vocabulary.org/Breadcrumb">
					<span class="bc-folder" itemprop="title">${unescape(elem.ftitle)}</span>`

		if (elem.title !== undefined) {
			html += `<i class="fa fa-angle-right bc-separator"></i>
			<span class="bc-file" itemprop="title">${unescape(elem.title)}</span>`
		}

		return html + '</div></div>'
	}

}


var change = {

	home() {
		location.hash = ''
		$('#top-bar').remove()

		if (!config.pages.home) return $('.menuitem').first().click()

		let url = active.path + config.pages.folder + '/' + config.pages.home
		$('#body-inner').html('')

		$.get(url, function (data) {
			$('#error-body').hide()

			if (!$('#chapter').length) {
				$('#body-inner').wrap('<div id="chapter"></div>')
			}

			$('#body-inner').html(url.endsWith('.md') ? new showdown.Converter(config.showdown).makeHtml(data) : data)

		}).fail(function (req, textStatus) { utils.show.bodyError(req) })

		create.navs(-1)

	},

	page(elem) {
		if (!elem.data('url')) return utils.show.bodyError({ status: '404' })

		let url = elem.data('url'),
			isChapter = url.endsWith('/' + config.pages.chapter)

		if (isChapter && !config.pages.chapter) return elem.next('ul').find('.menuitem')[0].click()

		NProgress.start()

		$.get(url, function (data) {
			NProgress.set(0.4)
			$('#error-body').hide()

			if (isChapter) {
				if (!$('#chapter').length) {
					$('#body-inner').wrap('<div id="chapter"></div>')
				}
				location.hash = elem.prop('hash')

			} else {
				$('#chapter').contents().unwrap()
			}

			if (config.breadcrumb.active) $('#body-content').prepend(create.breadcrumb(elem.data()))

			$('#body-inner').html(url.endsWith('.md') ? new showdown.Converter(config.showdown).makeHtml(data) : data)

			$('pre code').each(function (i, block) {
				hljs.highlightBlock(block);
			})

		}).fail(function (req, textStatus) {
			utils.show.bodyError(req)
		}).always(function () {
			NProgress.done()
		})


		$('#list li a').removeClass('active')
		elem.addClass('active').blur()

		$('#list li ul').not(elem.parent().parent()).collapse('hide')


		$.each($('.menuitem'), function (i, menuitem) {
			if ($(menuitem).hasClass('active')) return create.navs(i)
		})

	},

	active(elem) {
		let type = elem.data('type'),
			path = elem.data('path'),
			text = elem.text(),
			paths;

		$('#check-' + type).remove()
		$('#menu-' + type + ' text').text(text)

		elem.append('<i id="check-' + type + '" class="fa fa-check"></i>')

		if (config.lang.active && config.version.active) {
			if (type == 'lang') {
				paths = [{
					path: path,
					title: text,
					default: true,
					versions: [{
						path: active.version.path,
						title: active.version.title,
						default: true
					}]
				}]
			}

			if (type == 'version') {
				paths = [{
					path: active.lang.path,
					title: active.lang.title,
					default: true,
					versions: [{ path: path, title: text, default: true }]
				}]
			}

		} else {
			if (config.lang.active || config.version.active) {
				paths = [{
					path: path,
					title: text,
					default: true
				}]
			}

		}

		active.path = '/'
		change.paths(paths)
		change.menuitems()
		// change.home()
	},


	paths(paths) {
		if (config.lang.active) {
			$.each(paths, function (i, lang) {
				if (lang.default) {
					active.lang = lang
					active.path += lang.path + '/'
					return false
				}
			})
		}

		if (config.version.active) {
			let items = active.lang ? active.lang.versions : paths

			$.each(items, function (i, version) {
				if (version.default) {
					active.version = version
					active.path += version.path + '/'
					return false
				}
			})
		}
	},

	menuitems() {
		$('#list').html('')
		$('#loading-sidebar').show()

		$.get(active.path + 'routes.yaml', function (file) {
			$.each(jsyaml.load(file), function (i, item) {
				$('#list').append(create.menuItem(i, item))
			})

			if (location.hash.length > 0) {
				let elem = $("#list li a[href='" + location.hash + "']")

				change.page(elem)
				$('.active').closest('ul').collapse('show')
			}

		}).fail(function (req, status) {
			utils.show.sidebarError('ERROR: routes.yaml (Menuitems)')
		}).always(function () {
			$('#loading-sidebar').hide()
		})

	}

}

var utils = {

	splitUrl(url) {
		return url.split('/#!/')[0].split('/')
	},

	removeExt(file) {
		return file.replace(new RegExp(/(\.md$|\.html?$)/i), '')
	},

	show: {
		sidebarError(msj) {
			$('#error-sidebar').show().css('display', 'block')
			//$('.dropdown').hide()
			console.log(msj)
			NProgress.done()
		},

		bodyError(msj) {
			$('#body-inner').html('')
			//$('#error-body').show().find('p').text('Error ' + msj.status);
			$('#error-body').show()
			$('#error-body p').text('Error ' + msj.status)
			console.log(msj)
			NProgress.done()
		}
	}
}

