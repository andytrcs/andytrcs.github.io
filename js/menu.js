function loadApp() {

 	$('#canvas').fadeIn(1000);

 	var flipbook = $('.menu');

 	// Check if the CSS was already loaded
	
	if (flipbook.width()==0 || flipbook.height()==0) {
		setTimeout(loadApp, 10);
		return;
	}
	
	// Create the flipbook

	flipbook.turn({
			
			// menu width

			width: 900,

			// menu height

			height: 550,

			// Duration in millisecond

			duration: 1000,

			// Hardware acceleration

			acceleration: !isChrome(),

			// Enables gradients

			gradients: true,
			
			// Auto center this flipbook

			autoCenter: true,

			// Elevation from the edge of the flipbook when turning a page

			elevation: 20,

			// The number of pages

			pages: 6,

			// Events

			when: {
				turning: function(event, page, view) {
					
					var menu_book = $(this),
					currentPage = menu_book.turn('page'),
					pages = menu_book.turn('pages');
			
					// Update the current URI

					Hash.go('page/' + page).update();

					// Show and hide navigation buttons

					disableControls(page);
					

					$('.thumbnails .page-'+currentPage).
						parent().
						removeClass('current');

					$('.thumbnails .page-'+page).
						parent().
						addClass('current');



				},

				turned: function(event, page, view) {

					disableControls(page);

					$(this).turn('center');

					if (page==1) { 
						$(this).turn('peel', 'br');
					}

				},

				missing: function (event, pages) {

					// Add pages that aren't in the menu

					for (var i = 0; i < pages.length; i++)
						addPage(pages[i], $(this));

				}
			}

	});

	// Zoom.js

	$('.menu-viewport').zoom({
		flipbook: $('.menu'),

		max: function() { 
			
			return largeMenuWidth()/$('.menu').width();

		}, 

		when: {

			swipeLeft: function() {

				$(this).zoom('flipbook').turn('next');

			},

			swipeRight: function() {
				
				$(this).zoom('flipbook').turn('previous');

			},

			resize: function(event, scale, page, pageElement) {

				if (scale==1)
					loadSmallPage(page, pageElement);
				else
					loadLargePage(page, pageElement);

			},

			zoomIn: function () {

				$('.thumbnails').hide();
				$('.made').hide();
				$('.menu').removeClass('animated').addClass('zoom-in');
				$('.zoom-icon').removeClass('zoom-icon-in').addClass('zoom-icon-out');
				
				if (!window.escTip && !$.isTouch) {
					escTip = true;

					$('<div />', {'class': 'exit-message'}).
						html('<div>Press ESC to exit</div>').
							appendTo($('body')).
							delay(2000).
							animate({opacity:0}, 500, function() {
								$(this).remove();
							});
				}
			},

			zoomOut: function () {

				$('.exit-message').hide();
				$('.thumbnails').fadeIn();
				$('.made').fadeIn();
				$('.zoom-icon').removeClass('zoom-icon-out').addClass('zoom-icon-in');

				setTimeout(function(){
					$('.menu').addClass('animated').removeClass('zoom-in');
					resizeViewport();
				}, 0);

			}
		}
	});

	// Zoom event

	if ($.isTouch)
		$('.menu-viewport').bind('zoom.doubleTap', zoomTo);
	else
		$('.menu-viewport').bind('zoom.tap', zoomTo);


	// Using arrow keys to turn the page

	$(document).keydown(function(e){

		var previous = 37, next = 39, esc = 27;

		switch (e.keyCode) {
			case previous:

				// left arrow
				$('.menu').turn('previous');
				e.preventDefault();

			break;
			case next:

				//right arrow
				$('.menu').turn('next');
				e.preventDefault();

			break;
			case esc:
				
				$('.menu-viewport').zoom('zoomOut');	
				e.preventDefault();

			break;
		}
	});


	// URIs - Format #/page/1 

	Hash.on('^page\/([0-9]*)$', {
		yep: function(path, parts) {
			var page = parts[1];

			if (page!==undefined) {
				if ($('.menu').turn('is'))
					$('.menu').turn('page', page);
			}

		},
		nop: function(path) {

			if ($('.menu').turn('is'))
				$('.menu').turn('page', 1);
		}
	});


	$(window).resize(function() {
		resizeViewport();
	}).bind('orientationchange', function() {
		resizeViewport();
	});

	// Events for thumbnails

	$('.thumbnails').click(function(event) {
		
		var page;

		if (event.target && (page=/page-([0-9]+)/.exec($(event.target).attr('class'))) ) {
		
			$('.menu').turn('page', page[1]);
		}
	});

	$('.thumbnails li').
		bind($.mouseEvents.over, function() {
			
			$(this).addClass('thumb-hover');

		}).bind($.mouseEvents.out, function() {
			
			$(this).removeClass('thumb-hover');

		});

	if ($.isTouch) {
	
		$('.thumbnails').
			addClass('thumbanils-touch').
			bind($.mouseEvents.move, function(event) {
				event.preventDefault();
			});

	} else {

		$('.thumbnails ul').mouseover(function() {

			$('.thumbnails').addClass('thumbnails-hover');

		}).mousedown(function() {

			return false;

		}).mouseout(function() {

			$('.thumbnails').removeClass('thumbnails-hover');

		});

	}


	// Regions

	if ($.isTouch) {
		$('.menu').bind('touchstart', regionClick);
	} else {
		$('.menu').click(regionClick);
	}

	// Events for the next button

	$('.go-next-button').bind($.mouseEvents.over, function() {
		
		$(this).addClass('go-next-button-hover');

	}).bind($.mouseEvents.out, function() {
		
		$(this).removeClass('go-next-button-hover');

	}).bind($.mouseEvents.down, function() {
		
		$(this).addClass('go-next-button-down');

	}).bind($.mouseEvents.up, function() {
		
		$(this).removeClass('go-next-button-down');

	}).click(function() {
		
		$('.menu').turn('next');

	});

	// Events for the next button
	
	$('.go-back-button').bind($.mouseEvents.over, function() {
		
		$(this).addClass('go-back-button-hover');

	}).bind($.mouseEvents.out, function() {
		
		$(this).removeClass('go-back-button-hover');

	}).bind($.mouseEvents.down, function() {
		
		$(this).addClass('go-back-button-down');

	}).bind($.mouseEvents.up, function() {
		
		$(this).removeClass('go-back-button-down');

	}).click(function() {
		
		$('.menu').turn('previous');

	});


	resizeViewport();

	$('.menu').addClass('animated');

}

// Zoom icon

 $('.zoom-icon').bind('mouseover', function() { 
 	
 	if ($(this).hasClass('zoom-icon-in'))
 		$(this).addClass('zoom-icon-in-hover');

 	if ($(this).hasClass('zoom-icon-out'))
 		$(this).addClass('zoom-icon-out-hover');
 
 }).bind('mouseout', function() { 
 	
 	 if ($(this).hasClass('zoom-icon-in'))
 		$(this).removeClass('zoom-icon-in-hover');
 	
 	if ($(this).hasClass('zoom-icon-out'))
 		$(this).removeClass('zoom-icon-out-hover');

 }).bind('click', function() {

 	if ($(this).hasClass('zoom-icon-in'))
 		$('.menu-viewport').zoom('zoomIn');
 	else if ($(this).hasClass('zoom-icon-out'))	
		$('.menu-viewport').zoom('zoomOut');

 });

 $('#canvas').hide();


// Load the HTML4 version if there's not CSS transform

yepnope({
	test : Modernizr.csstransforms,
	yep: ['js/turn.min.js'],
	nope: ['js/turn.html4.min.js'],
	both: ['js/zoom.min.js', 'js/menu_book.js', 'css/menu_book.css'],
	complete: loadApp
});