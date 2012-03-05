<%
  
  String ua = request.getHeader( "User-Agent" );
	boolean isFirefox = ( ua != null && ua.indexOf( "Firefox/" ) != -1 );
	boolean isMSIE = ( ua != null && ua.indexOf( "MSIE" ) != -1 );
	boolean isIPhone = ( ua != null && ua.toLowerCase().indexOf( "iphone" ) != -1 );
	boolean isIPad = ( ua != null && ua.toLowerCase().indexOf( "ipad" ) != -1 );
	boolean isAndroid = ( ua != null && ua.toLowerCase().indexOf( "android" ) != -1 );
	
	boolean isMobile = isIPhone || isAndroid;

	
	
%>

<?xml version="1.0" encoding="ISO-8859-1" ?>
<%@ page language="java" contentType="text/html; charset=ISO-8859-1"
    pageEncoding="ISO-8859-1"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no"/>
<meta name="apple-mobile-web-app-capable" content="yes" />
<link rel="apple-touch-icon-precomposed" href="Preview1_ForReviewOnly.png" />
<%  if( isIPad ){ %>
<link rel="apple-touch-startup-image" href="./startup.png" />
<% } else { %>   
<link rel="apple-touch-startup-image" href="startupimage.png" />
<% } %>

<title>Nanocycle</title>


<%  if( isMobile ){ %>
	<style type="text/css" media="screen">@import "css/iphone.css";</style>
<% } else { %>  
   <style type="text/css" media="screen">@import "css/browser.css";</style>
<% } %>

</head>
<body onload="setTimeout(function() { window.scrollTo(0, 1) }, 100);">
<div id="wrap" >
<div id="waiting" class= "waiting remove"><span><img src="imgs/waiting.gif" /></span><span id="waitingmsg">Drawing map...</span></div>
<div id="tabbar">
	<ul>
		<li id="button1" class="down"><a href="#" id="triplink">Edit Trip</a></li>
		<li id="button2"><a href="#" id="button2link" >Settings</a></li>
		<li id="button3"><a href="#" id="button3link" >Results</a></li>
	</ul>
</div>
<div id="addressbar">
	<div id="swapper"><br /><a href="#" id="swapperb"><img id="swapperpic" src="imgs/swapper.png" /></a></div>
	<div id="entries">
		<span><input type="text" value="" id="start" name="start"  autocorrect="off" autocapitalize="off" placeholder="Start&nbsp;:" /><a class="current remove" href="#" id="start_current"><img  src="imgs/currentlocation.png" alt="Current location" title="Current location"/></a><a class="clearer remove" href="#" id="start_cleaner"><img  src="imgs/clearer.png" alt="clear" title="Clear"/></a></span><br />
		<span><input type="text" value="" id="finish" name="finish" autocorrect="off" autocapitalize="off" placeholder="Finish:" /><a class="current remove" href="#" id="finish_current"><img  src="imgs/currentlocation.png" alt="Current location" title="Current location"/></a><a class="clearer remove" href="#" id="finish_cleaner"><img  src="imgs/clearer.png" alt="clear" title="Clear"/></a></span>

		<div id="travelstyle">
		<a id="bike"  href="#"></a>
		<a id="car" class="up" href="#"></a>
		<a id="done" href="#" ></a><br />
		</div>		
	</div>
</div>
<div id="distancebar"></div>
<div id="clipper">
	<div id="content">
		<div id="map"></div>
		<div id="settings">
		<%  if( !(isIPhone || isAndroid) ){ %>
			<div class="column">
		<% } %>		
			<h2>Cyclist's weight</h2>
			<ul id="ridingStyle" class="radioList">
				<li>
					<span class="check">&#x2713;</span>
					<span> < 75Kg</span>
					<input type="radio" name="ridingStyle" value="60" />
				</li>
				<li>
					<span class="check">&#x2713;</span>
					<span>75 to 95 Kg</span>
					<input type="radio" name="ridingStyle" value="80" checked="checked"/>
				</li>
				<li>
					<span class="check">&#x2713;</span>
					<span> > 95Kg </span>
					<input type="radio" name="ridingStyle" value="100" />
				</li>
			</ul>
		
			 <div id="switch1" class="rounded switchBase">
				<span class="label">Headwind mode</span>
				<!--  <div class="switch unchecked" id="headwindSwtich">
					<div class="on">ON</div>
					<div class="thumb"><span></span></div>
					<div class="off">OFF</div>-->
					<input id="headwind" type="checkbox" value="on" offvalue="off" name="headwind" />
				<!-- </div> -->
			</div>
		<%  if( !(isIPhone || isAndroid) ){ %>
			</div>
			<div class="column right">
		<% } %>		

	
			<h2>Battery type...</h2>
			<ul id="batteryType" class="radioList">
				<li>
					<span class="check">&#x2713;</span>
					<span>Standard</span>
					<input type="radio" name="batteryType" value="little" checked="checked"/>
				</li>
				<li>
					<span class="check">&#x2713;</span>
					<span>Extended Range</span>
					<input type="radio" name="batteryType" value="big" />
				</li>
			</ul>
		<%  if( !(isIPhone || isAndroid) ){ %>
			</div>
		<% } %>		
		
<%  if( isIPhone || isAndroid ){ %>
		</div>
		<div id="results">
				<div id="summary">
					<a id="summarycloser" class="cross" title="close" href="#">#</a>
					<h2>Your trip summary:</h2>
					<div id="summaryinfo"></div>
				</div>
				<img id="chart" src="imgs/Instruct.png" />
			<!-- <div id="chart"></div>  -->
		</div>
<% } else {%>
		<div id="bDetails" class="cleared rounded switchBase reled">
				<div id="summary">
					<a id="summarycloser" class="cross" title="close" href="#">#</a>
					<h2>Your trip summary:</h2>
					<div id="summaryinfo"></div>
				</div>
				<img id="chart" src="imgs/Instruct.png" />
			</div>
		</div>	
<% } %>		
</div>
</div>
<div id="splash" style="position:absolute; top:0px; left:0px;z-index:50000;background:#FFFFFF; display:none;">
	<img src="imgs/nanocycle_logo.png" />
	<h2>The way to get from A to B...</h2>
	<p>This is an example Splash screen/message.</p>
	<p>Once we know what to put here, we can change it out for something more meaningful.  For the time being tho, it will just be a placeholder, whilst we wait for Steve to let us know what he wants to say.</p>
	<p>In the mean time, please admire this screen, until it fades away.......<p/>
</div>
</div>
<script type="text/javascript" src="js/mootools-core-1.3.js"></script>
<script type="text/javascript" src="js/mootools-more-1.3.js"></script> 
<script type="text/javascript" src="js/common.js"></script>
<script type="text/javascript" src="http://www.google.com/jsapi"></script>
<script type="text/javascript" src="http://maps.google.com.au/maps/api/js?v3.1&sensor=<%out.print( isMobile?"true":"false");%>&region=AU"></script>
 

 
<%  if( isIPhone ){ %>  
	<script type="text/javascript" src="js/iphoneinterface.js"></script>
<% } else if(isAndroid){ %>  
	<script type="text/javascript" src="js/androidinterface.js"></script>
<% } else {
	// treat everything elsse as a Big Screen device...
%>
	<script type="text/javascript" src="js/browserinterface.js"></script>  <!--  Cause this one works so far. -->	
<% }%>

 <%  if( isIPhone || isIPad){ %>
  	<script type="text/javascript" src="js/bookmark_bubble.js"></script>
 	<script type="text/javascript" src="js/iphonebubble.js"></script>

 <% }%>
</body>

</html>