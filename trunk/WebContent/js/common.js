String.implement({
    /*
     Function: String.fmtmap
     Putpose:
     Take a given string, and apply a uppercase/lower case mapping.
     for example  "john".map("Aaaa") will turn "john" to "John"
     "john".map("AaaA") will turn "john" to "JohN"
     "john".map("Ax") will turn "john" to "John"
     Arguments:
     str - String.  defines the mini format map.
     */
    fmtmap: function(str){
        // this functionmaps a string to a format string.
        // for example  "john".map("Aaaa") will turn "john" to "John"
        // "john".map("AaaA") will turn "john" to "JohN"
        // "john".map("Ax") will turn "john" to "John"
        
        var result = '';
        for (var i = 0; i < str.length; i++) {
            var fmt = str.substr(i, 1);
            var nextchar = this.substr(i, 1);
            
            if (fmt === "A") {
                // maje this letter capital.
                result = result + nextchar.toUpperCase();
            }
            else 
                if (fmt === "a") {
                    // make this letter lowercare
                    result = result + nextchar.toLowerCase();
                }
                else 
                    if (fmt === "x") {
                        // give me everything else.
                        result = result + this.substr(i);
                    }
                    else 
                        if (fmt === "#") {
                            // just treat this as an integer
                            return ("" + parseInt(this, 10)); // treat this as a decvimal value.
                        }
        }
        return result;
    },
    /*
     Function:  String.left
     Purpose:
     Returns the n leftmost characters of the string.
     If less characters in this string, it gives all that are available.
     Arguments:
     n - int - the number of characters to return.
     */
    left: function(n){
        if (n <= 0) {
            return "";
        }
        else 
            if (n > this.length) {
                return this;
            }
            else {
                return this.substring(0, n);
            }
    },
    /*
     Function: String.right
     Purpose:
     Returns the n rightmost characters of the string.
     If less characters in this string, it gives all that are available.
     Arguments:
     n - int - the number of rightmost characters to return.
     */
    right: function(n){
        if (n <= 0) {
            return "";
        }
        else 
            if (n > this.length) {
                return this;
            }
            else {
                var iLen = this.length;
                return this.substring(iLen, iLen - n);
            }
    },
    /*
     Function: String.leftOf
     Purpose:
     Returns all of the characters to the left of the first occurance of the given string.
     If the given string is not present, it returns ""
     Arguments:
     str - return everything to the left of this string.
     */
    leftOf: function(str){
        var pos = this.indexOf(str);
        return pos <= 0 ? "" : this.left(pos);
    },
    /*
     Function: String.rightOf
     Purpose:
     Returns all of the characters to the right of the first occurance of the given string.
     If the given string is not present, it returns ""
     
     Arguments:
     str - return everything to the right of this string.
     
     */
    rightOf: function(str){
        var pos = this.indexOf(str);
        return (pos < 0) | (pos + str.length >= this.length) ? "" : this.substring(pos + str.length);
    },
    /*
     Function: String.leftOfLast
     Purpose:
     Returns all of the characters to the left of the last occurance of the given string.
     If the given string is not present, it returns ""
     Arguments:
     str - return everything to the left of the last orrurance of this string.
     */
    leftOfLast: function(str){
        var pos = this.lastIndexOf(str);
        return pos <= 0 ? "" : this.left(pos);
    },
    /*
     Function: String.rightOfLast
     
     Purpose:
     Returns all of the characters to the left of the last occurance of the given string.
     If the given string is not present, it returns ""
     
     Arguments:
     str - return everything to the left of the last orrurance of this string.
     */
    rightOfLast: function(str){
        var pos = this.lastIndexOf(str);
        return (pos < 0) | (pos + str.length >= this.length) ? "" : this.substring(pos + str.length);
    },
    /*
     oSubstitute
     Purpose :
     This function acts like the MooTools String.substitute.
     HOWEVER, it allows the processing of objects with sub objects.
     For example.
     var o={
     a: {aa:'abcd', ab : 'were'},
     b: {d:123, e : 'asd123'},
     c : 'whisper'
     };
     
     var s = " a.aa = {a.aa}, a.ab= {a.ab}, b.d = {b.d}, b.e = {b.e}, c = {c} ";
     var t = " aa = {aa}, ab= {ab}, b.d = {b.d}, b.e = {b.e}, c = {c} ";
     s.oSubstitute(o);
     gives " a.aa = abcd, a.ab= were, b.d = 123, b.e = asd123, c = whisper "
     t.oSubstitute(o.a);
     gives " aa = abcd, ab= were, b.d = , b.e = , c = "
     
     Arguments:
     object - Object- the source object that will be replaced.
     regexp - Regular expression to be evaluated to match the elements.
     */
    oSubstitute: function(object, regexp){
        return this.replace(regexp || (/\\?\{([^{}]+)\}/g), function(match, name){
            if (match.charAt(0) === "\\") {
                return match.slice(1);
            }
            var obj = object;
            if (name.indexOf('.') > -1) {
                // deal with names like a.b.c in case the object is nested.
                name = name.split('.');
                name.every(function(seg){
                    //if(obj){
                    if (obj[seg]) {
                        obj = obj[seg];
                        return true;
                    }
                    else {
                        obj = '';
                        return false;
                    }
                    //}
                });
                return (obj != undefined) ? obj : '';
            }
            return (object[name] != undefined) ? object[name] : '';
        });
    },
    basicNumber: function(){
        return this.replace(/[$%,]/g, '').toFloat();
    }
});

/*
 Object : mapControler
 
 Purpose:
 Handles all of the map functionality.
 Dosent concearn itself with any additional processing, just communication with the google maps API
 */
var mapController = {
    map: null,
    directionsDisplay: null,
    geocoder: null,
    directionsService: null,
    marker: null,
    oldEndpoints: {
        start: '',
        finish: '',
        waypoints: null,
        headwind: null,
        ridingstyle: null, // this is the value for relaxed.
        lastroute: null
    },
    
    /*
     Function: mapControler.initialize
     
     Purpose:
     Initialises the Google Map, and "finds" the current location.
     */
    initialize: function(){
		
        if (!display) {
            this.initTimeout = setTimeout(this.initialise, 500);
			alert("no display object just yet, try again.");
        }
        else {
            if (this.initTimeout) {
                clearTimeout(this.initTimeout);
                this.initTimeout = null;
            }
			if (display.sizeScreen) {
				display.sizeScreen();
			}
        }
		
        // this routine EXPECTS a div called map to exist.
        this.directionsService = new google.maps.DirectionsService();
		this.directionsDisplay = new google.maps.DirectionsRenderer({
            draggable: true
        });
		this.geocoder = new google.maps.Geocoder();
		this.goCurrentLocation();
        this.maxSegment = 250;
		this.graphsize = display.gerChartSize();
		this.bCalcCraphs = this.calcCraphs.bind(this);
		this.bFailure = this.reqFailed.bind(this);
		this.chart = new GChart($('chart'),{});  // make a single chart, not multiple ones.
		/*
		 get device current location and display on map - useful for route finding in the field
		*/		
		this.watchId = navigator.geolocation.watchPosition(this.updatePointer.bind(this), this.removePointer.bind(this))
    },
    /*
     Function: mapControler.gpsBaseMap
     
     Purpose:
     Uses the GPS to locate the current position
     */
    gpsBaseMap: function(position){
        this.loadingMap = true;
        latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        var myOptions = {
            center: latlng
        };
        this.doBaseMap(myOptions);
    },
    /*
     Function: mapControler.ipBaseMap
     
     Purpose:
     Uses the ip address to "locate" the current position
     */
    ipBaseMap: function(){
        // If ClientLocation was filled in by the loader, use that info instead
        this.loadingMap = true;
        var latlng = new google.maps.LatLng(37.4419, -100.1419);
        if (google.loader.ClientLocation) {
            zoom = 13;
            latlng = new google.maps.LatLng(google.loader.ClientLocation.latitude, google.loader.ClientLocation.longitude);
            
        }
        var myOptions = {
            center: latlng
        };
        
        this.doBaseMap(myOptions);
    },
    /*
     Function: mapControler.doBaseMap
     
     Purpose:
     the GPS and IP Basemap functions call this to draw the map, and
     locate the center point.
     */
    doBaseMap: function(myOptions){
        if (this.geocoder) {
            this.geocoder.geocode({
                'latLng': myOptions.center
            }, function(results, status){
                if (status == google.maps.GeocoderStatus.OK) {
                    // I REALLY DONT WANT THIS HERE...
                    display.setStartAddress(results[0].formatted_address);
					this.currentLocation = results[0].formatted_address;
					// display.fadeSplash();
					if(display.resetEmpty){
						display.resetEmpty();
					}
                }
            }.bind(this));
        }
        myOptions.streetViewControl = false;
        myOptions.zoom = 18;
        myOptions.mapTypeId = google.maps.MapTypeId.ROADMAP;
        // myoptions.mapTypeControl = false;
        myOptions.mapTypeControlOptions = {
            mapTypeIds: [google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.HYBRID],
            position: google.maps.ControlPosition.BOTTOM_RIGHT,
            style: google.maps.MapTypeControlStyle.DEFAULT
        };
        if (!this.map) {
            this.map = new google.maps.Map(document.getElementById("map"), myOptions);
            this.directionsDisplay.setMap(this.map); // woo hoo, draw that map.
        }
        else {
            this.map.setCenter(myOptions.center);
            this.directionsDisplay.setMap(null);
        }
    },
	
	doResults : function(){
		// lets figure out what we should be doing.
		// because we're rolling this up, we need to do, whatever they changed.
		var start = $('start').value.trim();
		var finish = $('finish').value.trim();
		if (start === "" && finish === "") {
			this.goCurrentLocation();
		} else if (start === "" || finish === "") {
			this.goAddress(start + finish, (start === "" ? display.setFinishAddress : display.setStartAddress));
		} else {
			if(this.doneRoute){
				this.doRequest();	
			} else {
				display.setInstructionsChart();
			}
			
			
		}
	},
	
    /*
     Function: mapControler.goCurrentLocation
     
     Purpose:
     locates the map to the current location.
     Determines the best location service available, and uses that.
     */
    goCurrentLocation: function(){
        if (this.marker) {
            this.marker.setMap(null);
            delete this.marker;
        }
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this.gpsBaseMap.bind(this), this.ipBaseMap.bind(this));
        }
        else {
            this.ipBaseMap();
        }
        if (!this.loadingMap) {
            this.ipBaseMap();
        }
        display.doDistanceBar(false, '');
		this.doneRoute = false;
    },
    
    goAddress: function(address, updateAddress){
    
        // this removes any routing already there.
        if (this.directionsDisplay) {
            this.directionsDisplay.setMap(null);
        }
        if (this.marker) {
            this.marker.setMap(null);
            delete this.marker;
        }
		// change the chart back to the instructions.
        display.setInstructionsChart();
		this.doneRoute = false;
		
        this.geocoder.geocode({
            'address': address
        }, function(results, status){
            if (status == google.maps.GeocoderStatus.OK) {
                this.map.setCenter(results[0].geometry.location);
                this.marker = new google.maps.Marker({
                    map: this.map,
                    position: results[0].geometry.location,
                    draggable: true
                });
                this.markerEvent = google.maps.event.addListener(this.marker, 'dragend', function(event){
                    this.geocoder.geocode({
                        'latLng': event.latLng
                    }, function(results, status){
                        if (status == google.maps.GeocoderStatus.OK) {
                            if (results[0]) {
                                if (updateAddress) {
                                    updateAddress(results[0].formatted_address);
                                }
                            }
                        }
                    });
                }.bind(this));
                
            }
            else {
                alert("Geocode was not successful for the following reason: " + status);
            }
        }.bind(this));
        display.doDistanceBar(false, '');
        
    },
    goRoute: function(start, finish, routetype, changedRoute){
    	
        if (this.marker) {
            this.marker.setMap(null);
            delete this.marker;
        }
        var byMode = null;
        if (routetype == "car") {
            byMode = google.maps.DirectionsTravelMode.DRIVING;
        }
        else {
            byMode = google.maps.DirectionsTravelMode.WALKING;
        }
        
		// lets see if we've changed out start/end locations.
        if (this.oldEndpoints.start === start && this.oldEndpoints.finish === finish) {
            // this is the same path, although we might be traveling by car/bike now...
			if(this.oldEndpoints.byMode === byMode){
				// it's VERY likely, that we don't have to request this map, so don't
				display.finishMapDraw();
				this.doneRoute = true;
				return true;
			}else {
				this.oldEndpoints.byMode = byMode;
			}
        }
		
        display.startMapDraw();
		
		// one of the points can't be found.  Lets try to figure out which one.
		// check to see if the address is OK.
		this.addressChecked = {
			start: false,
			startMsg : '',
			startAddr : start,
			finish: false,
			finishMsg : '',
			finishAddr : finish,
			byMode : byMode,
			changedRoute : changedRoute
						
		};
		var badAddressMsg = "";
		
		var geocoder1 = new google.maps.Geocoder();
		var verifyAddress = this.verifyAddress.bind(this);  // just to make sure it gets the right thing.
		geocoder1.geocode({'address': start, 'region':'au'}, function(results, status){
			verifyAddress(results, status, 'start', start);
		});
		
		var geocoder2 = new google.maps.Geocoder();
		
		geocoder2.geocode({'address': finish}, function(results, status){
			verifyAddress(results, status, 'finish', finish);
		});
		
	},
		
    finishRoute : function(start, finish, byMode, changedRoute){
		    
        var request = {
            origin: start,
            destination: finish,
            travelMode: byMode,
			region : 'au'
        };
		// because we've got through the pre filtering, it means we're doing a real route.  remember how we are traveling.
        this.oldEndpoints.byMode = byMode;
        // lets see if we've changed out start/end locations.
        if (this.oldEndpoints.start === start && this.oldEndpoints.finish === finish) {
            // this is the same path, although we might be traveling by car/bike now...  make sure to remember the waypoints.
            if (this.oldEndpoints.waypoints) {
                request.waypoints = this.oldEndpoints.waypoints;
            }
        }
	
        
        this.directionsService.route(request, (function(result, status){
            if (status == google.maps.DirectionsStatus.OK) {
                this.directionsDisplay.setDirections(result);
                
            }
			
        }).bind(this));
        // make sure that we can draw the route on the map.
        this.directionsDisplay.setMap(this.map);
        
		display.setLoadingChart();
		
        this.routeEvent = google.maps.event.addListener(this.directionsDisplay, 'directions_changed', function(){
			
            var directions = this.directionsDisplay.getDirections();
            // we're not doing waypoints in the traditional sense, so 
            // our start and finish points are in the 
            // directions.routes[0].legs[0].start_address   and
            // directions.routes[0].legs[0].end_address
            
            // lets see if we've changed out start/end locations.
            this.oldEndpoints.start = directions.routes[0].legs[0].start_address;
            this.oldEndpoints.finish = directions.routes[0].legs[0].end_address;
            // just recording the waypoints, breaks things, so lets do it different.
            // this.oldEndpoints.waypoints = directions.routes[0].legs[0].via_waypoint;
            var wps = directions.routes[0].legs[0].via_waypoint;
            if (wps && wps.length) {
                if (this.oldEndpoints.waypoints) {
                    this.oldEndpoints.waypoints.empty();
                }
                else {
                    this.oldEndpoints.waypoints = [];
                }
                
                wps.each(function(wp){
                    this.oldEndpoints.waypoints.push({
                        location: new google.maps.LatLng(wp.location.lat(), wp.location.lng()),
                        stopover: false
                    });
                }, this);
                
            }
            else {
                this.oldEndpoints.waypoints = null;
            }
            
            display.finishMapDraw();
            if (changedRoute) {
                changedRoute(directions.routes[0].legs[0].start_address, directions.routes[0].legs[0].end_address);
                display.doDistanceBar(true, "Trip distance : " + directions.routes[0].legs[0].distance.text);
                var simpleroute = this.calcPathSteps(directions.routes[0]);
				this.oldEndpoints.steps = simpleroute;
				this.oldEndpoints.tripM = directions.routes[0].legs[0].distance.value;
				this.doneRoute = true;
				this.pathChanged = true;
				// don't request this, if the graph has changed, cause it's expensive. wait til we're asked to see the results.
                // this.doRequest(simpleroute,directions.routes[0].legs[0].distance.value );
            }
            
        }.bind(this));
        
    },
	
	verifyAddress: function(results, status, id, value){
		
			
			if (status !== google.maps.GeocoderStatus.OK) {
				 this.addressChecked[id+"Msg"]= "Can't locate: " + value;
				addressOK = false;
			} else {
				if(results[0].partial_match){
					// the address is OK, as long as there is one of the address components has a type with "route" in it (street name)
					var hasRoute = results[0].address_components.some(function(item){
						return item.types.contains('route');
					});
					if(!hasRoute){
						this.addressChecked[id+"Msg"]= "Can't exactly locate: " + value;
						addressOK = false;	
					}
				}
			}
			this.addressChecked[id] = true;
			this.addressChecked[id+'latlng'] = results[0].geometry.location;
			
			if(this.addressChecked.start && this.addressChecked.finish){
				// ok, we've done both addresses.
				var badAddress = '';
				if(this.addressChecked.startMsg){
					display.badAddress('start');
					badAddress = (badAddress?badAddress+"\n":"") +this.addressChecked.startMsg;
				}
				if(this.addressChecked.finishMsg){
					display.badAddress('finish');
					badAddress = (badAddress?badAddress+"\n":"") +this.addressChecked.finishMsg;
				}
				if(badAddress){
					display.finishMapDraw();
					display.showAddresses();
					alert(badAddress);
				} else {
					// continue with the route...
					
					// first, lets do a point to point check of the distance.
					var all = this.addressChecked.startlatlng;
					var bll = this.addressChecked.finishlatlng;
					
					var apt = {
                    'lat': all.lat(),
                    'lng': all.lng()
                	};
					var bpt = {
                    'lat': bll.lat(),
                    'lng': bll.lng()
                	};
               		var dist = (this.latlngDist(apt, bpt)/1000).round(0);
					if (dist > 200) {
						if (this.directionsDisplay) {
         				   // this.directionsDisplay.setMap(null);
						   // this.directionsDisplay.setMap(this.map);
        				}
        				if (this.marker) {
            				this.marker.setMap(null);
            				delete this.marker;
        				}
					   display.startTooLong();
					   
					} else {
						// this.directionsDisplay.setMap(this.map);
						this.finishRoute(this.addressChecked.startAddr, this.addressChecked.finishAddr, this.addressChecked.byMode, this.addressChecked.changedRoute);
					}	
				}
			}
	},
	
    calcPathSteps: function(route){
    
        var pts = {}; // this is the structure to see if we already have a pt.
        var order = []; // the order collection of points.
        // ok, now that we have waypoints, a trip is made up of routes...
        var lastpt = null;
        
        
        var mNo = 0;
        var routedist = 0;
        var droppedPt = false;
        var firstpt = true;
        var legdist = 0;
        var leghalfway = 0;
        var steps = route.legs[0].steps;
        steps.each(function(step, sindex){
            var latlngs = step.lat_lngs;
            latlngs.each(function(pt, index){
                if (sindex > 0) {
                    if (index == 0) {
                        // don't count the first point, cause it's the same as the last point of the one before
                        return;
                    }
                }
                
                var cpt = {
                    'lat': pt.lat(),
                    'lng': pt.lng()
                };
                var dist = this.latlngDist(lastpt, cpt);
                if (lastpt == null) {
                    lastpt = {};
                    lastpt.lat = cpt.lat + 1 - 1;
                    lastpt.lng = cpt.lng + 1 - 1;
                }
                
				if(dist<220 ){
					return;  // break out of this one, we're not interested in small distances. Un;less it's the VERY last one.
				}
				
               // var numsegments = Math.ceil(dist / this.maxSegment);
                 var numsegments = Math.round(dist / this.maxSegment);  // homefully, this will allow small increases, to squeese through.
                var dff = 0;
                if (numsegments == 0) {
                    // to stop divide by zero...
                    numsegments = 1;
                    dff = 0;
                }
                var segdist = (dist / numsegments);
                var latdelta = (cpt.lat - lastpt.lat) / numsegments;
                var lngdelta = (cpt.lng - lastpt.lng) / numsegments;
                var tpt = {
                    'lat': lastpt.lat + 1 - 1,
                    'lng': lastpt.lng + 1 - 1
                };
                
                for (var i = 0; i < numsegments - dff; i++) {
                    lastpt.lat = tpt.lat + 1 - 1;
                    lastpt.lng = tpt.lng + 1 - 1;
                    tpt = {};
                    tpt.lat = lastpt.lat + latdelta;
                    tpt.lng = lastpt.lng + lngdelta;
                    // var ind = indexer.substitute( tpt );
                    // pts[ind] = true;
                    order.push(tpt);
                    lastpt.lat = tpt.lat + 1 - 1;
                    lastpt.lng = tpt.lng + 1 - 1;
                    
                }
            }, this);
        }, this);
		
		// ok, now we need to check to see if the last point in order is the same as the last point in the steps.
		var olp = order[order.length-1];
		var laststep =  steps[steps.length-1];
		var slp = laststep.lat_lngs[laststep.lat_lngs.length-1];
		if( (olp.lat !== slp.lat()) && (olp.lng !== slp.lng()) ){
			tpt = {
				lat: slp.lat(),
				lng : slp.lng()
			}
			order.push(tpt);
		}
        
		// so the first one isn't crazy.
		lastpt = order[0];
        order.each(function(pt){
            pt.dist = this.latlngDist(lastpt, pt);
            lastpt = pt;
        }, this);
        return order;
    },
    
    /*
     Function: latlngDist( pt1, pt2 )
     calculate the distance betwen two latlng points.
     Parameters:
     pt1 - the first latlng point
     pt2 - the second latlng point
     Returns:
     The distance between the two points in meters.
     */
    latlngDist: function(pt1, pt2){
        // returns the distance in meters
        if (!pt1) {
            return 0;
        }
        var R = 6371; // km
        var dLat = (pt1.lat - pt2.lat).toRad();
        var dLon = (pt1.lng - pt2.lng).toRad();
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(pt1.lat.toRad()) * Math.cos(pt2.lat.toRad()) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c * 1000;
        return Math.ceil(d);
    },
    
    doRequest: function(steps, tripM){
		
		// make sure we have something to make a request from...
        var ridingstyle = $$('input[name=ridingStyle]:checked')[0].get('value');
        var headwind = ($('headwind').checked === true);
        
        var sameData = (this.oldEndpoints.ridingstyle === ridingstyle) && (this.oldEndpoints.headwind === headwind);
        
		if(steps){
			this.oldEndpoints.steps = steps;
			samedata = false;
		} else {
			steps = this.oldEndpoints.steps;
		}
		if(tripM){
			this.oldEndpoints.tripM = tripM;
			samedata = false;
		} else {
			tripM = this.oldEndpoints.tripM;
			
		}
		
       /* if (sameData) {
            // Not much to do here, move along.
			var battery = $$('input[name=batteryType]:checked')[0].get('value');
			if(battery != this.oldEndpoints.battery){
				this.oldEndpoints.battery = battery;
				this.calcCraphs();
				return true;	
			}
			return; 
            
        }
        */
		// check to see if the path has changed.  if it hasn't then just redraw the graph
		
		if(!this.pathChanged){
			this.calcCraphs();
			return true;
		}
		
		// otherwise, go off and get new data...
		
		
		
		// construct the data object for the request.
		if(!steps){
			return;
		}
		var data = {};
		data.steps = steps;
        
        var doGetMethod = this.oldEndpoints.collected || false;
        
        var getArgs = "";
        if (doGetMethod) {
            if (headwind != lastRoute.headwind) {
                getArgs += '&headwind=' + headwind;
            }
            if (ridingstyle != lastRoute.ridingstyle) {
                getArgs += '&weight=' + ridingstyle; // yes, I know, but the servlet says weight for now.
            }
        }
        
        this.oldEndpoints.headwind = headwind;
        this.oldEndpoints.ridingstyle = ridingstyle;
        
        
        data.headwind = headwind;
        data.weight = ridingstyle;  // yes, the data that needs to go is marked as weight.  needs java refactoring.
        data.makecsv = false;		// we don't do that any more.
        data.xsize = this.graphsize.x;
		data.ysize = this.graphsize.y;
		data.tripm = tripM;
						// the length of the trip in meters.
        // make a request to the get service, to initialise the Session.
		/*
        var req = new Request.JSON({
            'url': '/RRC/routecalc',
            'noCache': true,
            'method': 'get',
            'async': false
        });
        req.send();
		*/

        var json = new Request.JSON({
            'url': 'routecalc',  
            'data': {
                'route': JSON.encode(data)
            },
            'noCache': false,
            'onSuccess': this.bCalcCraphs,
			'onFailure' : this.bFailure
        });
        if (doGetMethod) {
            json.options.url = '/RRC/routecalc?action=json' + getArgs;
            json.options.method = 'get';
            json.options.data = '';
            
        }
		display.setLoadingChart();
        json.send();
		
        return false;
        // and that's it, out marker is now included in the waypoints.
    },
	
	reqFailed : function(){
		// the request failed, usualy because we've reached out location limit.
		display.setServiceUnavailable();
	},
	calcCraphs : function( json, txt){
		// record that we've got data, and the path is now old.
		this.pathChanged = false;
		
		var bigbattery = 160;
		var littlebattery = 80;
		
		if (!json) {
			json = this.oldEndpoints.json;
		}
		
		if (json) {
			this.oldEndpoints.json = json;
			// Ok, we've got a set of results, so lets process them.
			
			var ridingstyle = $$('input[name=ridingStyle]:checked')[0].get('value');
        	var headwind = ($('headwind').checked === true);
		
			var energyUsed = 0;
			var travDist = 0;
			
			
			var bbExpiredPoint = -1;
			var bbExpiredLeg = "";
			
			var lbExpiredPoint = -1;
			var lbExpiredLeg = "";
			
			
			var fullBattery = []; 		// these are the full battery percentages.
			fullBattery.markers = [];
			
			var fullDistances = []; 	// these are the full battery distances.
			
			var middleBattery = []; 	// these are the middle battery percentages.
			middleBattery.markers = [];
			var middleDistances = []; 	// these are the middle battery distances.

			var emptyBattery = []; 		// these are the empty battery percentages.
			emptyBattery.markers = [];
			var emptyDistances = []; 	// these are the empty battery distances.
	
			var batterytype = $$('input[name=batteryType]:checked')[0].get('value');
			var battery = (batterytype === 'big' ? bigbattery : littlebattery);
			
			var perc50 = ( battery * 50 ) / 100;
			var perc80 = ( battery *80 ) / 100;
			
			
			var lPerc = null;
			var bPerc = null;
			
			// find the max and min pts.
			var aMin = json.altmin;
			var aMax = json.altmax; // start at a TINY ammount, and it will get pulled up..
			
			
			var aDif = aMax - aMin;
			
			var mag = 1;
			var check = aDif / 10;
			while (check >= 10){
				// for every 10 we divide check by, we multiply mag by 10.
				check = check / 10;
				mag = mag * 10;
			}
			
			var altcutoff = ((aDif/mag)/4).round(0);			
			aMin = Math.round((aMin - mag )/mag) *mag;
			aMax = Math.round((aMax + mag )/mag) *mag;
			
			// ok, for my self curiosity.  after adjusting the range, lets see what dif we've got now.
			aDif = (aMax - aMin);
			altcutoff = aDif/30;  // this is +- 15% of the distance.
			 altcutoff = 0;
			
			if (aDif < 100) {
				if (aMin > 10) {
					aMax = aMin + 100;
				} else {
					aMin = 0;
					aMax = 100;
				}
			}
			
			// the first step distance is ALWAYS wrong.
			json.steps[0].dist=0;
			
			var lastsigalt = -99999;
			var keeppt = false;
			var alts = [];
			var xpoints = json.steps.length -1;  // this is the index we stop doing our triplet calcs.

			// pass 1, we look at the dDist values for 2 points, and this defines the value for our triplet.			
			json.steps.each( function(step, index){
				if (index > 0 && index < xpoints) {
					// the Java calculates a value called dDist which is the Sqrt(x^2 + y^2)
					// so, to figure out the "distance" in the triplet, we add the dDist with this point, and the next pt.
					step.kDist = step.dDist + json.steps[index+1].dDist; 
				} else {
					step.kDist = -999;
				}
			});
			
			
			 
			var sSteps = Array.clone(json.steps);
			var pointsToKeep = (215/3).round(0);  // cause I can.  (215 pixels / 4)
			var calcDist = 0;
			var maxGrade = {
				grade : -9999,
				distIn  : -1,
				dist    : 0,
				firstindex :-1,
				lastindex : -1
			};	
			// ok, now we sort these by their kDist value.
			// so that we can look at the most significant ones.
			// where the significant ones float to the start of the array.			
			sSteps.sort(function(a,b){
				//if(!a.kDist || !b.kDist){
				//	alert("a="+JSON.encode(a) + " and b ="+JSON.encode(b));
				//	return -1;
				//}
				return b.kDist - a.kDist;
			});
			
			sSteps.map( function( item, index) {
					calcDist += item.dist;
					item.keeppt = (index <= pointsToKeep);
			});
			
			// now we can re-sort this out, based on the tDist
			sSteps.sort(function(a,b){
				return a.tDist - b.tDist;
			});
			// keep the first and last points, always.
			sSteps[0].keeppt = true;
			sSteps.getLast().keeppt = true;
			
			var tdists = [];
			
			// now we set up where out data is going to be logged to.
			var targetBattery = fullBattery; 		// as we progress through out route, these target values will be moved to the different arrays..
			var targetDistances = fullDistances;   // as we progress through out route, these target values will be moved to the different arrays..
			
			var forwardDist = [];  // this keeps the distasnces in one direction.
			var eLabel = "hw" + headwind + "w" + ridingstyle;
			
			// build the summary:
			var summary = {
				tripDist :calcDist
			};
			
			json.steps.each( function(step, index){
				keeppt = false;
				energyUsed += step[eLabel];
				travDist += step.dist;
			
				tdists.push(step.dist);
				
				if (sSteps[index].keeppt) {
					keeppt = true;
					// lastsigalt = step.alt;
					alts.push(step.alt);
					forwardDist.push(step.tDist);
					
					
					
				}
				
				if(maxGrade.grade < step.grade){
					maxGrade.direction = "forward";
					maxGrade.grade = step.grade;
					maxGrade.distIn  =step.tDist;
					maxGrade.dist    = step.dist;
					maxGrade.firstindex = index;
					maxGrade.lastindex = index;
				} else if(maxGrade.grade === step.grade){
					// if the next point is also the same grade, then keep this run...
					if(index == maxGrade.lastindex +1 ){
						maxGrade.dist    += step.dist;
						maxGrade.lastindex = index;
					}
					
				} 
				
				
				if(battery !== -1){
					bPerc = (((battery - energyUsed)/battery) * 100).round(2);
					bPerc = bPerc > 0? bPerc : 0;
						
				} else {
					keeppt = false;
				}
				
				if(energyUsed > perc50 && perc50 !== -1 ){
					perc50 = -1;  // this is so we don't re-record this 50% marker.
					keeppt = true;
					targetBattery.push(bPerc);
					targetDistances.push(step.tDist);
					targetBattery = middleBattery;   	// now swap over to the middle battery figures.
					targetDistances = middleDistances;  // now swap over to the middle battery figures.
				}
				if(energyUsed > perc80 && perc80 !== -1){
					perc80 = -1;  // this is so we don't re-record this 50% marker.
					keeppt = true;
					targetBattery.push(bPerc);
					targetDistances.push(step.tDist);
					targetBattery = emptyBattery;   	// now swap over to the middle battery figures.
					targetDistances = emptyDistances;  // now swap over to the middle battery figures.
				}
				if(energyUsed >= battery && battery !== -1){
					keeppt = true;
					battery = -1;
					targetBattery.push(bPerc);
					targetDistances.push(step.tDist);
					targetBattery.markers.push({'pt': targetBattery.length-1, 'msg' : ( ((calcDist - step.tDist)/1000).round(1)) + 'km without help.' });
					summary.forwardTripComplete = false;
					summary.forwardTripSummary = ( ((calcDist - step.tDist)/1000).round(1) + 'km left to go without help.' );
					summary.forwardTripDist = ((step.tDist)/1000).round(1);
				}
				
				// we always want to calculate the battery used.
				 
				if( keeppt){
						targetBattery.push(bPerc);
						targetDistances.push(step.tDist);	
				}
							
			});
			
			
			// ok, we got to the end, so lets see if we have any battery left.
			if( battery !== -1){
				targetBattery.markers.push({'pt': targetBattery.length-1, 'msg' : 'Arr: '+bPerc.round(0)+'%' });
				summary.forwardTripComplete = true;
				summary.forwardTripSummary = bPerc.round(0)+'% of the battery remaining.'
				summary.forwardTripDist = ((calcDist)/1000).round(1);
			}
			
			json.stepsreturn.each( function(step, index){
				// seeing we've already done the alts, we don't need to do any more alt things, just battery useage.
				keeppt = false;
				energyUsed += step[eLabel];
				// travDist += step.dist;
				if (sSteps[index].keeppt) {
					keeppt = true;
				}
				
				if(maxGrade.grade < step.grade){
					maxGrade.direction = "return";
					maxGrade.grade = step.grade;
					maxGrade.distIn  =step.tDist;
					maxGrade.dist    = step.distprev;
					maxGrade.firstindex = index;
					maxGrade.lastindex = index;
				} else if(maxGrade.grade === step.grade){
					// if the next point is also the same grade, then keep this run...
					if(index == maxGrade.lastindex +1 ){
						maxGrade.dist    += step.distprev;
						maxGrade.lastindex = index;
					}
					
				}
				
				if(battery !== -1){
					bPerc = (((battery - energyUsed)/battery) * 100).round(2);
					bPerc = bPerc > 0? bPerc : 0;
				} else {
					keeppt = false;
				}
				
				if(energyUsed > perc50 && perc50 !== -1 ){
					perc50 = -1;  // this is so we don't re-record this 50% marker.
					keeppt = true;
					targetBattery.push(bPerc);
					targetDistances.push(calcDist - step.tDist);
					targetBattery = middleBattery;   	// now swap over to the middle battery figures.
					targetDistances = middleDistances;  // now swap over to the middle battery figures.
				}
				if(energyUsed > perc80 && perc80 !== -1){
					perc80 = -1;  // this is so we don't re-record this 50% marker.
					keeppt = true;
					targetBattery.push(bPerc);
					targetDistances.push(calcDist - step.tDist);
					targetBattery = emptyBattery;   	// now swap over to the middle battery figures.
					targetDistances = emptyDistances;  // now swap over to the middle battery figures.
				}
				if(energyUsed >= battery && battery !== -1){
					keeppt = true;
					battery = -1;
					targetBattery.push(bPerc);
					targetDistances.push(calcDist - step.tDist);
					targetBattery.markers.push({'pt': targetBattery.length-1, 'msg' : ( ((calcDist - step.tDist)/1000).round(1)) + 'km without help.' });
					summary.returnTripComplete = false;
					summary.returnTripSummary = ( ((calcDist - step.tDist)/1000).round(1) + 'km without help.' );
					summary.returnTripDist = ((step.tDist)/1000).round(1);
				}
				
				// we always want to calculate the battery used.
				 
				if( keeppt){
						targetBattery.push(bPerc);
						targetDistances.push(calcDist - step.tDist);	
				}
			});
			
			if( battery !== -1){
				targetBattery.markers.push({'pt': targetBattery.length-1, 'msg' : 'Round trip: '+bPerc.round(0)+'% remaining.' });
				summary.returnTripComplete = true;
				summary.returnTripSummary = bPerc.round(0)+'% of the battery remaining.'
				summary.returnTripDist = ((calcDist)/1000).round(1);
			}
						
			// ok, we've got the max and min heights.  lets figure out the padding factor;.
			// start by figuring out the difference between the 2 .
			
			summary.maxGrade = maxGrade;
			
			var tickDist = Math.round((100/(aMax / mag))*100)/100;
			
			var distance = (calcDist < 1000? calcDist : (calcDist/1000).round(1))
			
			this.chart.setOptions({
				// 'size': '300x350',   // this value gets set by the display, not by this code. 
				'encoding': 'e',					
				'tt': 'Trip Elevation and '+(batterytype === 'big' ? 'Extended Range' : 'Standard')+' Battery Usage',
				'type': 'lxy',
				'xt': 'x,y,r,x',
				'f' : 'c,s,C3D9FF',
				// 'xl':'2:|Empty|100%25+Full|50%25+Full|3:|Distance+%28'+(json.totdist < 1000?'m':'Km' )+'%29',
				'xl':'2:|Empty|100%25+Full|50%25+Full|3:|Distance+%28'+(json.totdist < 1000?'m':'Km' )+'%29',
				'xp': '2,0,100,50|3,50',
				'xr': '0,0,'+distance+'|1,'+aMin+','+aMax,
				'xs' : '0,000000,10,1,lt,000000|1,000000,11.5,0.5,t,000000|2,000000,11.5,0.5,lt,000000|3,000000,11.5,0,l,000000',
				// 'co':'150B0B,00AE00',  ///,00AE00,FF9900,FF0000',
				'co' : '492C01B4,00AE00',
				'ds':'0,'+calcDist+','+aMin+','+aMax,
				'g':'10,10,2,4',
				// 'ls':'0|3|3|3|3,6,2',
				'ls':'2|3',
				// 'ma':'|0,515',					
				// 'm':'f20Km+to+go+unassisted,FF0000,4,1,10,1|B,875406,0,0,0|fForward+trip,000000,1,5,10|fReturn+trip,000000,2,2,10|f80%25,000000,1,1000,10|fElevation+%28m%29,000000,0,0.5,10'
				// 'm' : 'B,875406,0,0,0'
				'm' : 'B,4C3004B4,0,0,0,-1'					
			});
			this.chart.clearDatasets();
			
			// add the altitude components.
			this.chart.addDataset(forwardDist, calcDist );
			// chart.addDataset(tdists, 300);
			this.chart.addDataset(alts, aMax);
			
			// always have a full battery set.
			this.chart.addDataset(fullDistances, calcDist );
			this.chart.addDataset( fullBattery , 100 );  // battery always starts out as 100%
			
			if(fullBattery.markers.length > 0){
					fullBattery.markers.each(function(marker){
						this.chart.options.m = this.chart.options.m + '|f'+marker.msg+',000000,1,'+marker.pt+',12,1';
					}, this);
				}
			
			if( middleBattery.length > 0){
				this.chart.addDataset(middleDistances, calcDist );
				this.chart.addDataset( middleBattery , 100 );  // battery always starts out as 100%
				this.chart.options.co =this.chart.options.co + ",FF9900";  // make sure to get the Orange line next... 
				this.chart.options.ls =this.chart.options.ls + "|3";  // make sure to get the solid line next...
				if(middleBattery.markers.length > 0){
					middleBattery.markers.each(function(marker){
						this.chart.options.m = this.chart.options.m + '|f'+marker.msg+',000000,2,'+marker.pt+',12,1';
					}, this);
				}
			}
			
			if( emptyBattery.length > 0){
				this.chart.addDataset(emptyDistances, calcDist );
				this.chart.addDataset( emptyBattery , 100 );  // battery always starts out as 100%
				this.chart.options.co =this.chart.options.co + ",FF0000";  // make sure to get the Red line next... 
				this.chart.options.ls =this.chart.options.ls + "|3,6,2";  // make sure to get the Dashed line next...
				if(emptyBattery.markers.length > 0){
					emptyBattery.markers.each(function(marker){
						this.chart.options.m = this.chart.options.m + '|f'+marker.msg+',000000,3,'+marker.pt+',12,1';
					},this);
				}
			}
			
			
			// now add the crazy other graphs...
			display.showSummary( summary );
			display.showGraph( this.chart );
			
			
			
			
		} else {
			alert('Sorry, there was an error calculating the path.');
		}
	},
	updatePointer : function(position) {
		var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude)
		if(this.whereiam) {
			this.whereiam.setPosition(pos);
			this.whereiam.setVisible(true);
		} else {
			var mi = new google.maps.MarkerImage('imgs/bikepointer.png')
			this.whereiam = new google.maps.Marker({'clickable':false, 'position':pos, 'map':this.map, 'visible':true, 'icon':mi});
		};
//		this.map.setCenter(pos)
	},
	removePointer : function(error) {
		if(this.whereiam) {
			this.whereiam.setVisible(false);
		}
	}
};


var IPhoneCheckboxes = new Class({ // this is actually for everything except the iPhone

    //implements
    Implements: [Options],
    
    //options
    options: {
        checkedLabel: 'ON',
        uncheckedLabel: 'OFF',
        background: '#fff',
        containerClass: 'iPhoneCheckContainer',
        labelOnClass: 'iPhoneCheckLabelOn',
        labelOffClass: 'iPhoneCheckLabelOff',
        handleClass: 'iPhoneCheckHandle',
        handleBGClass: 'iPhoneCheckHandleBG',
        handleSliderClass: 'iPhoneCheckHandleSlider',
        elements: 'input[type=checkbox]',
		callback: $empty
    },
    
    //initialization
    initialize: function(options){
        //set options
        this.setOptions(options);
        //elements
        this.elements = $$(this.options.elements);
        //observe checkboxes
        this.elements.each(function(el){
            this.observe(el, this.options.callback);
        }, this);
    },
    
    //a method that does whatever you want
    observe: function(el, callback){
        //turn off opacity
        el.set('opacity', 0);
        //create wrapper div
        var wrap = new Element('div', {
            'class': this.options.containerClass
        }).inject(el.getParent());
        //inject this checkbox into it
        el.inject(wrap);
        //now create subsquent divs and labels
		var offLabel = new Element('label', {
            'class': this.options.labelOffClass,
            text: this.options.uncheckedLabel
        }).inject(wrap);
        var onLabel = new Element('label', {
            'class': this.options.labelOnClass,
            text: this.options.checkedLabel
        }).inject(wrap);
        var handle = new Element('div', {
            'class': this.options.handleClass
        }).inject(wrap);
        var handlebg = new Element('div', {
            'class': this.options.handleBGClass,
            'style': this.options.background
        }).inject(handle);
        var handleSlider = new Element('div', {
            'class': this.options.handleSliderClass
        }).inject(handle);

        var rightSide = wrap.getSize().x - 39;
        //fx instances
        el.offFx = new Fx.Tween(offLabel, {
            'property': 'opacity',
            'duration': 200
        });
        el.onFx = new Fx.Tween(onLabel, {
            'property': 'opacity',
            'duration': 200
        });
        //mouseup / event listening
        wrap.addEvent('mouseup', function(){
            var is_onstate = !el.checked; //originally 0
            var new_left = (is_onstate ? rightSide : 0);
            var bg_left = (is_onstate ? 34 : 0);
            //handlebg.hide();
			handlebg.setStyle('display' , 'none');
            new Fx.Tween(handle, {
                duration: 100,
                'property': 'left',
                onComplete: function(){
                    handlebg.setStyle('left', bg_left).setStyle('display' , 'block');
					callback(el);
                }
            }).start(new_left);
            //label animations
            if (is_onstate) {
                el.offFx.start(0);
                el.onFx.start(1);
            }
            else {
                el.offFx.start(1);
                el.onFx.start(0);
            }
            //set checked
            el.set('checked', is_onstate);
			// call the callback...
			
        });
        //initial load
        if (el.checked) {
            offLabel.set('opacity', 0);
            onLabel.set('opacity', 1);
            handle.setStyle('left', rightSide);
            handlebg.setStyle('left', 34);
        }
        else {
            onLabel.set('opacity', 0);
            handlebg.setStyle('left', 0);
        }
    }

});

/*
 Script: gChart.js
 
  Purpose:
  	A wrapper to manage drawing charts with Google Charts API.
  	
 */

var GChart = new Class({
	
	data : [],
	defaultOptions:{
		encoding : 't'
	},
	
	/*
	 Function: gChart.initialize(target, options)
	 
	 Purpose:
	 	sets up a new gChart object
	 	
	 Returns:
	 	the new gChart object;
	 */
	initialize : function( target, options ){
		this.target = target;
		this.options = $extend( this.defaultOptions, options );
		
		this.encoding = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		if(this.options.encoding === 'e'){
			this.encoding += '-.';
		} 	
		this.EXTENDED_MAP_LENGTH = this.EXTENDED_MAP.length;
		return this;
	},
	
	setOptions: function(options){
		this.options = $extend( this.options||this.defaultOptions, options );
	},
	/*
	 Function: gChart.clearDatasets
	 
	 Purpose:
	 	Clears out any OLD datasets.
	 */
	clearDatasets : function(){
		this.data.empty();
	},
	
	simpleEncoding : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',

	// This function scales the submitted values so that
	// maxVal becomes the highest value.
	simpleEncode : function(valueArray,maxValue) {
		var chartData = [];
		for (var i = 0; i < valueArray.length; i++) {
		  var currentValue = valueArray[i];
		  if (!isNaN(currentValue) && currentValue >= 0) {
		  	chartData.push(this.simpleEncoding.charAt(Math.round((this.simpleEncoding.length-1) * 
		    	currentValue / maxValue)));
		  } else {
		    	chartData.push('_');
			}
		}
		return chartData.join('');
	},

// Same as simple encoding, but for extended encoding.
	EXTENDED_MAP : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-.',
	extendedEncode : function(arrVals, maxVal) {
  		var chartData = '';
		for(i = 0, len = arrVals.length; i < len; i++) {
		// In case the array vals were translated to strings.
			var numericVal = new Number(arrVals[i]);
			// Scale the value to maxVal.
			var scaledVal = Math.floor(this.EXTENDED_MAP_LENGTH * 
        		this.EXTENDED_MAP_LENGTH * numericVal / maxVal);

    		if(scaledVal > (this.EXTENDED_MAP_LENGTH * this.EXTENDED_MAP_LENGTH) - 1) {
      			chartData += "..";
    		} else if (scaledVal < 0) {
      			chartData += '__';
    		} else {
      			// Calculate first and second digits and add them to the output.
      			var quotient = Math.floor(scaledVal / this.EXTENDED_MAP_LENGTH);
      			var remainder = scaledVal - this.EXTENDED_MAP_LENGTH * quotient;
      			chartData += this.EXTENDED_MAP.charAt(quotient) + this.EXTENDED_MAP.charAt(remainder);
    		}
  		}

  		return chartData;
	},

	
	/*
	 Function: gChart.addDataset
	 
	 Purpose:
	 	adds a dataset to the Dataset List
	 */
	
	getEncodedData : function(d){
			d = d || this.data;						
			var str = '';	
			switch(this.options.encoding){
				default: case 'e': case 's':					
					if(d.length && typeof d[0] === 'object'){
						for(var i = 0, dln = d.length; i < dln; i++){
							str += ',' + this.getEncodedData(d[i]);
						}
						return str.substring(1);
					}else{
						if (typeof d === 'string') {
							return d;
						}
								
						var constant = (this.encoding.length - 1) / (this.options.max || (this.encoding.length - 1));					
					/*	for(var i = 0, dln = d.length; i < dln; i++){							
							if(this.options.encoding === 's'){
								str += ((!isNaN(d[i]) && d[i] >= 0) ? this.encoding.charAt(Math.round(constant * d[i])) : '_');
							}else if (this.options.encoding === 'e'){
								str += ((!isNaN(d[i]) && d[i] >= 0) ? this.encoding.charAt(Math.round(Math.floor(constant * d[i] / 64))) + this.encoding.charAt(Math.round(constant * (d[i] % 64))) : '__');
							}
						}
					*/
						if(this.options.encoding === 'e'){
							str = this.extendedEncode( d , d.top);
						} else {
							str = this.simpleEncode( d , d.top);
						}	
						return str;
					}
					break;
				case 't':
					if (typeof d === 'string') {
						return d;
					}
					if (d.length && typeof d[0] === 'object') {
						for(var i = 0, dln = d.length; i < dln; i++){
							str += '|' + (d[i]).join(',');
						}
						return str.substring(1);
					}
					return d.join(',');
			}			
		},
		
		getUrl : function(){
			var url = 'http://chart.apis.google.com/chart?';
			url += 'chs=' + this.options.size;
			url += '&chd=' + this.options.encoding + ':' + this.getEncodedData(this.data);
			url += '&cht=' + this.options.type;
			url += this.urlhelper('f');
			url += this.urlhelper('tt');
			url += this.urlhelper('dl', '|');
			url += this.urlhelper('xl', '|');
			url += this.urlhelper('xp', '|');
			url += this.urlhelper('xr', '|');
			url += this.urlhelper('xs', '|');
			url += this.urlhelper('xt');
			url += this.urlhelper('co');
			url += this.urlhelper('ds', '|');
			url += this.urlhelper('g');
			url += this.urlhelper('ls', '|');
			url += this.urlhelper('ma', '|');
			url += this.urlhelper('m', '|');
			url += this.urlhelper('ts');
			return url.replace(' ', '+');
		},
		
		render : function(){
			var url = this.getUrl();
			var img = this.target;
			
			if( url === this.lastURL){
				// if it's the same URL, don't draw it.  save the trees.
				return true;
			}
			// record this new URL.
			this.lastURL = url;
			
			if((img.tagName === "IMG"  )){
				img.src = url;
			}else{
				/*
				img = new Element('img', {
					src : url + "&rnd="+Math.random(),
					alt : this.options.alt
				});
				
				if(this.target){				
					img.inject(this.target, 'top');						
				}
				this.target = img;
				*/
				// $('chart').setStyle('background','url('+url+')');
												
			}
			
			// this is so we can see what's going on.
			var logthis = new Request({
				url : 'Logger',
				'data': {
                	'url': url
            	}
			});
			logthis.send();
			
			return img;
			
		},
		
		urlhelper : function(key, ch){
			o = this.options[key];
			if(!$defined(o)){
				return '';
			}
			var type = ($type(o) === 'string'? 'string' : 'object');
			return ('&ch' + key + '=' + ((type === 'object') ? o.join(ch || ',') : o));
		},

		addDataset : function (d, top) {
			d.top = top;
			this.data.push(d);
		}

	
});


/*
 Function: Number.prototype.toRad
 introduce teh roRad function to all numbers.
 Calculates this number from degrees to radians.  very useful
 when calculating distances.
 */
Number.prototype.toRad = function(){ // convert degrees to radians
    return this * Math.PI / 180;
};

window.addEvent('load', function(){
    mapController.initialize();
});


