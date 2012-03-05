/*
 Script: androidinterface.js
 
 Purpose:
 	Manage the interface of the android enabled Route Rise Calculator
 	Does not contain common functions, or Google map management code.
 	
 Author:
 	John Porra, October 2010, Copyright CBDWeb 2010
 */

var testchecks = null;

var display = {
	/*
	 Function: initialize()
	 
	 Purpose:
	 	Start up the screen management and event handling.
	 */
	initialize : function(){
		// lets start by handling the 3 main buttons.
		$('button1').getElement('a').addEvent('click', this.doEditTrip.bind(this));
		$('button2').getElement('a').addEvent('click', this.doSettings.bind(this));
		$('button3').getElement('a').addEvent('click', this.doResults.bind(this));
		
		this.summaryMorpher = new Fx.Morph('summary', {	duration: 750, transition: Fx.Transitions.Sine.easeOut});
		this.summaryMorpher.set({'opacity':0});  
		
		// setup the address bar scroll out.
		this.addressMorpher = new Fx.Morph('addressbar', {duration: 'short', transition: Fx.Transitions.Sine.easeOut});
		this.addressMorpher.set({'margin-top':0});
		this.addressMorpher.rolledIn = true;
		
		this.distancebarMorpher = new Fx.Morph('distancebar', {duration: 'short', transition: Fx.Transitions.Sine.easeOut});
		this.distancebarMorpher.set({'margin-top':-22});
		this.distancebarMorpher.rolledIn = true;

		this.contentMorpher = new Fx.Morph('content', {duration: 'normal', transition: Fx.Transitions.Sine.easeOut});
		this.contentMorpher.set({'margin-left':0});
		this.contentMorpher.dPosition = 0;

		// now lets attach events to the lots of buttons in the addressbar.
		$('start_cleaner').addEvent('click', this.clearAddress.bind(this));
		$('finish_cleaner').addEvent('click', this.clearAddress.bind(this));
		
		$('start').addEvent('focus', this.fieldFocus.bind(this));
		$('finish').addEvent('focus', this.fieldFocus.bind(this));
	
		$('start').addEvent('blur', this.fieldBlur.bind(this));
		$('finish').addEvent('blur', this.fieldBlur.bind(this));
		
		$('start').addEvent('keyup', this.checkEmpty.bind(this));
		$('finish').addEvent('keyup', this.checkEmpty.bind(this));
		
		// now the other smaller buttons.
		$('swapperb').addEvent('click', this.swapFields.bind(this));
		$('bike').addEvent('click', this.travelMode.bind(this));
		$('car').addEvent('click', this.travelMode.bind(this));
		
		$('done').addEvent('click', this.doDone.bind(this));
		$('summarycloser').addEvent('click', this.hideSummary.bind(this) );
		
		this.currents = $$('.current');
		this.currents.addEvent('click', this.setCurrentLocation.bind(this));
		
		this.radioButtons('#ridingStyle');
		this.radioButtons('#batteryType');
		// Radio button initialization:
		/*this.adioButtons("#activityChoices ", function(item){
			
		});*/
		
		if(Browser.Platform.ios){
			this.switches('input[type=checkbox]');	
		} else {
			testchecks = new IPhoneCheckboxes();
		}
		
		// this.switches('#headwind2');
		this.ss = -320;  // makes the multiply easier.
		this.screenSize = $(document.body).getSize();
		setTimeout(this.sizeScreen,500);
		
	},
	sizeScreen : function(){
		this.screenSize = window.getSize();
		scrollTo(0,0);
		$('clipper').setStyle('height', this.screenSize.y );
		$('content').setStyle('height', this.screenSize.y );
		$('map').setStyle('height', this.screenSize.y );
		$('settings').setStyle('height', this.screenSize.y );
		$('results').setStyle('height', this.screenSize.y );
	},
	fadeSplash : function(){
		// I want to delay 2 seconds for peple to get a read of the screen.
		 this.fadeTimeout = setTimeout(this.fadeSplashGo, 750);
	},
	fadeSplashGo : function(){
		var myEffects = new Fx.Morph('splash', {
			duration: 1000,
			transition: Fx.Transitions.Sine.easeOut,
			onComplete: function(){
				$('finish').focus();
			}
		});
		myEffects.start({
    		'opacity': 0
    	});

	},
	doEditTrip: function(event){
		event.stop();
		this.setActiveButton('button1');
		this.sizeScreen();
		
		var start = $('start').value.trim();
		var finish = $('finish').value.trim();
		if (start === "" || finish === "") {
			// this.distancebarMorpher.message = "";
		}
		
		if (this.contentMorpher.dPosition !== 0) {
			this.contentMorpher.cancel().start({
				'margin-left': [this.ss * this.contentMorpher.dPosition, this.ss * 0]
			});
			this.contentMorpher.dPosition = 0;
		}
		else {
			if(this.addressMorpher.rolledIn){
				this.addressMorpher.cancel().start({'margin-top' : [-115, 0]});
			} else {
				this.addressMorpher.cancel().start({'margin-top' : [0, -115]});
				this.doMapChange();
			}
			this.addressMorpher.rolledIn = !this.addressMorpher.rolledIn;
		}
		this._makesettingsresults(0);  // hide the showGraph options, if they exist...
	},
	doMapChange : function(){

		// because we're rolling this up, we need to do, whatever they changed.
		var start = $('start').value.trim();
		var finish = $('finish').value.trim();
		if (start === "" && finish === "") {
			mapController.goCurrentLocation();
		}
		else if (start === "" || finish === "") {
			mapController.goAddress(start + finish, (start === "" ? this.setFinishAddress : this.setStartAddress));
		} else {
			var id = $('travelstyle').getElement('a.up').id;
			var routetype =  (id === 'bike' ? 'car': 'bike');
			mapController.goRoute(start, finish, routetype, this.updateLocations.bind(this));
		}
	},
	setStartAddress : function(address){
		$('start').value = address.trim();
	},
	setFinishAddress : function(address){
		$('finish').value = address.trim();
	},
	updateLocations : function (start, finish){
		this.setStartAddress( start );
		this.setFinishAddress( finish );
	},
	doSettings: function(event){
		event.stop();
		this.setActiveButton('button2');
		this.sizeScreen();
		var ss = -320;  // makes the multiply easier.
		if(this.contentMorpher.dPosition !== 1){
			this.contentMorpher.cancel().start({'margin-left' : [this.ss * this.contentMorpher.dPosition, this.ss * 1]});
			this.contentMorpher.dPosition = 1;
		}
		this._makesettingsresults(0);  // hide the showGraph options, if they exist...
		
	
	},
	doResults: function(event){
		event.stop();
		this.setActiveButton('button3');
		this.sizeScreen();
		mapController.doResults();
		if(this.contentMorpher.dPosition !== 2){
			this.contentMorpher.cancel().start({'margin-left' : [this.ss * this.contentMorpher.dPosition, this.ss * 2]});
			this.contentMorpher.dPosition = 2;
		}
		
	},
	
	setActiveButton: function( id ){
		$('tabbar').getElements('li').removeClass('down');
		$(id).addClass('down');
		if(id !== 'button1'){
			if (!this.addressMorpher.rolledIn) {
				this.addressMorpher.cancel().start({
					'margin-top': [0, -115]
				});
				this.addressMorpher.rolledIn = true;
			}
			if(!this.distancebarMorpher.rolledIn || !this.distancebarMorpher.message ){
				if (!this.distancebarMorpher.rolledIn) {
					this.distancebarMorpher.cancel().start({
						'margin-top': [0, -22]
					});
				}
		 		this.distancebarMorpher.rolledIn = true;
			}
			$('triplink').set('text', 'View Trip');
		} else {
			if (this.distancebarMorpher.message) {
				this.distancebarMorpher.cancel().start({
					'margin-top': [-22, 0]
				});
				this.distancebarMorpher.rolledIn = false;
			} else {
				this.distancebarMorpher.cancel().set({
					'margin-top': -22
				});
				this.distancebarMorpher.rolledIn = true;
			}
			$('triplink').set('text', 'Edit Trip');
		}
		this.removeClearers();
	},
	clearAddress: function(event){
		event.stop();
		
		var element = event.target;
		if(element.tagName !== "A"){
			element = element.getParent("a");
		}
		var id = element.id;
		id = id.leftOf('_');
		if(this.blurTimer){
			clearTimeout( this.blurTimer);
			this.blurTimer = null;
		} 
		$(id).value='';
		$(id).focus();
	},
	fieldFocus: function(event){
		if(this.blurTimer){
			clearTimeout( this.blurTimer);
			this.blurTimer = null;
			if(this.activeFieldFocus){
				// this clears the old one, if it's there.
				$(this.activeFieldFocus+'_cleaner').addClass('remove');
			}

		} 
		var element = event.target;
		this.activeFieldFocus = element.id;
		
		$(element.id+'_cleaner').removeClass('remove');

		
	},
	fieldBlur: function(event){
		var element = event.target;
		// $(element.id+'_cleaner').addClass('remove');
		// ahh, lets be tricky.
		this.blurTimer = setTimeout(this.removeClearers, 200);
		
	},
	
	removeClearers : function(){
			$('entries').getElements('.clearer').addClass('remove');
		// $('start').value =(this.activeFieldFocus ?"Y":"N") +""+new Date();
		this.activeFieldFocus = null;
	},
	swapFields : function(){
		var sw = $('start').value;
		$('start').value = $('finish').value;
		$('finish').value = sw;
		// now should we refresh the map??
		this.doMapChange();
	},
	travelMode : function(event){
		event.stop();
		
		var element = event.target;
		if(element.tagName !== "A"){
			element = element.getParent("a");
		}
		var id = element.id;
		$('travelstyle').getElements('a').addClass('up');
		$(id).removeClass('up');
		// now should we refresh the map??
		this.doMapChange();
	},
	doDone : function(event){
		// needs to call the thing to update the map.
		this.doEditTrip(event);
	},
	
	doDistanceBar : function(visible, message){
		if(!this.distancebarMorpher){
			return true;
		}
		window.scrollTo(0, 1);
		$('distancebar').set('text',message);
		if(message===""){
			this.distancebarMorpher.set({'margin-top':-22});
			this.distancebarMorpher.rolledIn = true;
			this.distancebarMorpher.message = message;	
		} else {
			if( visible ){
				// roll the bar out.
				if (this.distancebarMorpher.rolledIn) {
					this.distancebarMorpher.start({
						'margin-top': [-22, 0]
					});
				}
			} else {
				// hide it.
				if (!this.distancebarMorpher.rolledIn) {
					this.distancebarMorpher.start({
						'margin-top': [0, -22]
					});
				} else {
					this.distancebarMorpher.set({'margin-top':-22});
					this.distancebarMorpher.rolledIn = true;
				}
				
			}
		
		this.distancebarMorpher.rolledIn = !visible;
		this.distancebarMorpher.message = message;	
		}
		
	},
	
	/**
*
* A method to initialize a list of radios buttons to present the user with a group of single choice options. It takes as the main argument, a unique selector identifying the view or section where the radio list resides.
*
* @method
*
* ### radioButtons
*
* syntax:
*
*  radioButtons(selector);
*
* arguments:
*
*  - string: string A valid selector for the parent of the tab control. By default the selector will target a class, id or tag of the radio list itself, so if you want to pass in a selector for a parent tag, such as an article, section or div tag, you'll need to make sure to put a trailing space on the end of the selector string.
*  - function: function A valid function as a callback. This is optional. The callback gets passed a reference to the clicked item, so you can access it in your callback function.
*
* example:
*
*  $.RadioButtons("#buyerOptions");
*  $.RadioButtons("#buyerOptions", function(choice) {
	   // Output the value of the radio button that was selected.
	   // Since the actual radio button is the last item in a radio
	   // button list, we can use the last() method to get its value.
	   console.log(choice.last().value);
   };
   
  Borrowed:
  	 This code was "borrowed" from 
  	 http://css3wizardry.com/2010/09/06/iphone-style-radios-buttons-with-html-css-javascript-2/
  	 Full thanks to Robert Biggs for his good work.
*
*/
	radioButtons : function( viewSelector, callback ) {
		var items = viewSelector + ".radioList li";
		var radioButtons = $$(items);
		radioButtons.forEach(function(item) {
			item.addEvent("click", function() {
				radioButtons.forEach(function(check) {
					check.removeClass("selected");
				});
				this.addClass("selected");
				this.getElement('input[type=radio]').checked = true;
				if (callback) {
					callback(item);
				}
			});
			if(item.getElement('input[type=radio]').checked){
				item.addClass('selected');
			}	
		});
	},
	
	// this must be bound to the element that is being switched.
	toggleSwitch : function( el ) {
		if (el.hasClass("switch")) {
			if (el.getElement('input[type=checkbox]').checked === true) {
				el.getElement('input[type=checkbox]').checked = false;
				//el.toggleClass("checked", "unchecked");
				el.toggleClass("checked").toggleClass("unchecked");
			} else {
				el.getElement('input[type=checkbox]').checked = true;
				el.toggleClass("checked").toggleClass("unchecked");
			}
		} else {
			return false;
		}
	},
	switches: function(viewSelector, callback){
		
			
		// var items = viewSelector + " .switch";
		var items = viewSelector;
		var switches = $$(items);
		switches.each(function(el){
			var checkbox = this.makeSwitch(el);
			checkbox.addEvent("click", function(){
				this.toggleSwitch(checkbox);
				
				if(callback){
					callback(this.getElement('input[type=checkbox]'));
				}
			}.bind(this));
			
			checkbox.addEvent("touchstart", function(e){
				e.preventDefault();
				this.toggleSwitch(checkbox);
				if(callback){
					callback(this.getElement('input[type=checkbox]'));
				}
			}.bind(this));
			
		},this);
	},
	makeSwitch : function(el){
		/*
		<div class="switch unchecked" id="headwindSwtich">
					<div class="on">ON</div>
					<div class="thumb"><span></span></div>
					<div class="off">OFF</div>
					<input type="checkbox" value="on" offvalue="off" name="headwind" checked="checked">
		</div>
		*/
		el.setStyle('display', 'none');  // hide the element, cause we don't want to see it any more.
		
		var parent = el.getParent('.switch');
		if(parent){
			return parent;
		}
		
		var wrapper = new Element('div', {
			'class' : 'switch'
		});
		wrapper.addClass(el.checked ? 'checked':'unchecked');
		
		wrapper.wraps(el);
		var onslider = new Element('div', {
			'class' : 'on',
			text: 'ON'
		});
		var thumbslider = new Element('div', {
			'class' : 'thumb',
			html : '<span></span>'
		});
		var offslider = new Element('div', {
			'class' : 'off',
			text: 'OFF'
		});
		onslider.inject(wrapper, 'top');
		thumbslider.inject(onslider, 'after');
		offslider.inject(thumbslider, 'after');
		return wrapper;
	},
	showGraph : function( chart ){
		// this chart is setup, all except for the sizings.
		chart.options.size='300x350';
		chart.render();
	},
	gerChartSize : function(){
		return {
			x: 214,
			y: 285
		};		
	},
	setInstructionsChart : function(){
		$('chart').set('src', "imgs/Instruct.png");
	},
	setLoadingChart : function(){
		$('chart').set('src', "imgs/please-wait.gif");
	},
	setServiceUnavailable : function(){
		$('chart').set('src',"imgs/SoSorry.png");
	},
	startMapDraw : function(){
		$('waiting').getElement('img').removeClass('remove');	
		$('waiting').removeClass('remove').setStyles({'height':'', 'line-height': ''});
		$('waitingmsg').set('text', 'Drawing map...');	
	},
	finishMapDraw : function(){
		$('waiting').addClass('remove');
		$('waitingmsg').set('text', '');
	},
	badAddress : function(id){
		$(id).addClass('badAddress');
	},
	goodAddress : function(id){
		$(id).removeClass('badAddress');
	},
	showAddresses : function(){
		this.doEditTrip();
	},
	startTooLong : function(){
		$('waiting').getElement('img').addClass('remove');	
		$('waiting').removeClass('remove').setStyles({'height':'auto', 'line-height': '45px'});
		$('waitingmsg').set('html', 'Can not show route.<br />Trip exceeds 200Km.');

	},
	finishTooLong : function(){
		$('waiting').addClass('remove');
		$('waitingmsg').set('text', '');
	},
	resetEmpty: function(){
		this.currents.each(function(el){
			var fakeEvent = {
				'target' : el
			};
			this.checkEmpty(fakeEvent);	
		}, this);
	},
	setCurrentLocation: function(event){
		event.stop();
		var element = event.target;
		element = element.getParent('span').getElement('input');
		element.value=mapController.currentLocation;
		this.checkEmpty(event);
		element.focus();
	},
	checkEmpty : function(event){
		// allow the event to continue, cause we don't care.
		var element = event.target;
		if(element.tagName !== "INPUT"){
			element = element.getParent('span').getElement('input');
		}
		if(element.name !== "start"){
			return true;
		}
		if(element.value.trim() === ""){
			element.addClass('empty');
			element.getParent('span').getElement('.current').removeClass('remove');
		} else {
			element.removeClass('empty');
			element.getParent('span').getElement('.current').addClass('remove');
		}
	},
	
	showSummary : function ( summary ){
		var story = $('summaryinfo');
		
		// summary contains the following:
		// tripDist - total distance in one direction. - always present.
		// forwardTripComplete - did they complete the forward trip???
		// forwardTripSummary - summary of the forward trip. - always present
		// forwardTripDist - distance of completed part of the forward trip. - always present.
		// returnTripSummary - summary of the forward trip.  - optional
		// returnTripDist - distance of completed part of the forward trip. - optional.
		
		var results = '<ul>';
		if(summary.forwardTripSummary){
			results += '<li>';
			if(summary.forwardTripComplete){
				results += 'You can complete the forward trip with ';
			} else {
				results += 'You can travel '+summary.forwardTripDist+' km toward your destination with help from the battery and have ';
			}
			 results += summary.forwardTripSummary + '</li>' ;
		}
		if(summary.returnTripSummary){
			results += '<li>';
			if(summary.returnTripComplete){
				results += 'You can complete the return trip with ';
			} else {
				results += 'You can travel '+summary.returnTripDist+' km back toward your starting point with help from the battery and have ';
			}
			 results += summary.returnTripSummary + '</li>' ;
		}
		
		if (summary.maxGrade.grade > 0) {
			results += '<li>';
			results += 'The steepest part of your trip has a grade of ' +summary.maxGrade.grade + '% and is '+(summary.maxGrade.distIn/1000).round(2) + ' km into your ' +summary.maxGrade.direction + ' trip.';
			// results += ' and goes for aproximately ' + (summary.maxGrade.dist/1000).round(2) +' km.';
			results += '</li>' ;
		}
			
		
		
		results += '</ul>';
		story.set('html', results);
			
	},
	hideSummary : function(){
		this.toggleSummary();
	},
	setResultsTitle : function(msg){
		$('button2link').set('text', msg);
	},
	toggleSummary : function(){
		// this function toggles the results/summary visibility, and changes the button title too.
		// this.summaryMorpher.cancel().start();
		var opCheck = $('summary').getStyle('opacity');
		if (this.contentMorpher.dPosition === 0 && mapController.doneRoute) {
			this._makeshowgraph(opCheck);
		} else if (opCheck === "0" && mapController.doneRoute ) {  // the op has to be 0, they have to have a route and they have to be on the 2nd tab.
			this._makeshowgraph(opCheck);
		}
		else if (opCheck !== "0") {
			this._makesettingsresults(opCheck);
		}
		
		
	},
	_makesettingsresults : function(opCheck){
		this.summaryMorpher.cancel().start({
				'opacity': [opCheck, 0]
			});
			$('button3link').set('text','Results');
	},
	_makeshowgraph : function(opCheck){
		this.summaryMorpher.cancel().start({
				'opacity': [opCheck, 0.9]
			});
			$('button3link').set('text','Show graph');
	}




};




window.addEvent('load', function(){ 
	display.initialize();
	// testchecks = new IPhoneCheckboxes();
	
});