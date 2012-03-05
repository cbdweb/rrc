package net.elektrica;


import java.io.*;
import java.util.Iterator;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.json.simple.parser.*;
import org.json.simple.*;

import net.cbdweb.*;

/**
 * Servlet implementation class routecalc
 * Purpose of this servlet is to take a google maps route (in JSON format)
 * and calculate the data needed to do stuff with it. 
 * 
 */
public class routecalc extends HttpServlet {
	private static final long serialVersionUID = 1L;
	

	/**
	 * @see Servlet#init(ServletConfig)
	 */
	public void init(ServletConfig config) throws ServletException {
		
		// Ok, we're starting our servlet, so lets populate our "db" variable.
		// I'm hoping like hell, that this will let me do what I want it to do...

		
	}

	public void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		// Use "request" to read incoming HTTP headers (e.g. cookies)
		// and HTML form data (e.g. data the user entered and submitted)

		// Use "response" to specify the HTTP response line and headers
		// (e.g. specifying the content type, setting cookies).

		PrintWriter out = response.getWriter();
		// Use "out" to send content to browser
		HttpSession session = request.getSession(true);
		
		
		// Ok, the servlet now can accept arguments.
		// [?action=X][&weight=Y][&headwind=Z]
		//		where action=X is one of:
		//			json	- 	returns the JSON version of the data.
		//			csv		- 	returns the CSV version of the data
		//		weight=Y, where Y is a number of KG.
		//		headwind=Z	where Z is true or false.
		// if weight or headwind are not present, then the current values are used.
		
		// if no arguments are provided, the servlet just returns the status.
		// if action is not provided, then it is assumed that weight and headwind are meaningless.
		// and the servlet just returns the status.
		
		String value = request.getParameter("action");
		boolean doStatus = true;
		if(value == null){
			doStatus = true;
		} else if("".equals(value)){
			doStatus = true;
		} else if("csv".equals(value) || "json".equals(value)){
			doStatus = false;
		}  // if it's something else, ignore it, and do the status version.
		
		if(doStatus){
			// just do the status, cause action is either not present, or empty.
			response.setContentType("application/json");
			Object progress = session.getAttribute("progress");
			if(progress == null){
				progress = "{\"status\":\"Loading...\"}";
				session.setAttribute("progress", progress);
			
			}
			out.print(progress);
		
		} else {
			// ok, we need to do a recalc (maybe).
			String sWeight = request.getParameter("weight");
			double weight = 0;
			String sHeadwind = request.getParameter("headwind");
			boolean headwind = false;
			boolean doCalc = false;
			
			if(sWeight == null){
				doCalc = doCalc || false;
			} else if("".equals(sWeight)){
				doCalc = doCalc || false;
			} else {
				doCalc = doCalc || true;
				weight = Double.parseDouble( sWeight);
				session.setAttribute("weight", weight);
				// out.println("weight = " + weight);
			}  
			
			if(sHeadwind == null){
				doCalc = doCalc || false;
			} else if("".equals(sHeadwind)){
				doCalc = doCalc || false;
			} else {
				doCalc = doCalc || true;
				headwind = "true".equals(sHeadwind); 
				session.setAttribute("headwind", headwind);
				// out.println("headwind = " + headwind);
			}
			
			// ok, if we're supposed to do a calc (i.e. we have a weight or headwind), do it.
			if(doCalc){ 
				// out.println("doing calcs...");
				double distortionFactor = Double.parseDouble( session.getAttribute("distortionFactor").toString());;
				
				this.doCalcs( session , distortionFactor );
			}
			if( "csv".equals(value)){
				this.makeCSV(response, out, session);
			} else {
				this.makeJSON(response, out, session);
			}
			
		}
		out.close();
	}


	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		/**
		 * Purpose.  to create and maintain a session for a user, and calculate the points in the path.
		 */
		HttpSession session = request.getSession(true);
		
		PrintWriter out = response.getWriter();

		// out.println("<title>Example</title>" + "<body bgcolor=FFFFFF>");
		session.setAttribute("progress", "{\"status\":\"Starting...\"}");
		// session.setMaxInactiveInterval(1 * 60); // set the timeout for 5 min. 
		String route = request.getParameter("route");
		JSONObject result = new JSONObject();
		Map<String, JSONObject> pts = new HashMap<String, JSONObject>();
		List<String> ptsIndex = new ArrayList<String>();
		JSONArray jaSteps = null;
		double energyReq = 0;
		long travelDist = 0;
		double travelTIme = 0;
		boolean makecsv = false;

		if( route != null ){
			// out.println( route );

			JSONParser parser = new JSONParser();

			try{
				Object obj = parser.parse(route);
				// out.println( obj );
				JSONObject joRoute = (JSONObject)obj;
				// Ok, the jRoute contains distance (obj), duration (obj), start & end_geocode (objs), steps (array)
				// we're Really only interested in steps.
				// each point in the step contains wh which is the latitude amd xh which is the longitude.

				jaSteps = (JSONArray)(joRoute.get("steps"));
				
				// ok, now we know how many raw points we have to deal with...
				session.setAttribute("progress", "{\"status\":\"Calculating route (  " + jaSteps.size() + " raw points)\"}");
				boolean headwind = (joRoute.get("headwind").toString() == "true");
				double weight = Double.parseDouble(joRoute.get("weight").toString());
				
				long xSize = Long.parseLong(joRoute.get("xsize").toString());
				long ySize = Long.parseLong(joRoute.get("ysize").toString());
				long tripM = Long.parseLong(joRoute.get("tripm").toString());
				
				session.setAttribute("headwind", headwind);
				session.setAttribute("weight", weight);
				
				/*
				 * This is the new section for the Google Elevations...
				 */
				GoogleElevations gElevations = new GoogleElevations();
				
				jaSteps = gElevations.getJSONPath(jaSteps, jaSteps.size());
				long maxAlt = gElevations.maxAlt;
				long minAlt = gElevations.minAlt;
				long altDif = maxAlt - minAlt;
				if(altDif == 0){
					altDif = 1;
				}
				if(xSize == 0){
					xSize = 1;
				}
				
				double distortionFactor = (ySize * tripM) / (altDif * xSize);
				distortionFactor = distortionFactor * distortionFactor;
				
				session.setAttribute("distortionFactor",distortionFactor);
				
				// record the data inmmto the http session.  things will use data from here.
				session.setAttribute("datapts", jaSteps);
				
				// ok, back to our regularly scheduled program...

				// figure out if we need a CSV or JSON result.
				makecsv = (joRoute.get("makecsv").toString() == "true");
				
				// do the calculations on those altitude points.
				this.doCalcs( session , distortionFactor);


			}
			catch(ParseException pe){
				out.println("position: " + pe.getPosition());
				out.println(pe);
			}

			// ok, so now we've got out path, so lets build it back into a JSON object, and send it back.
			
			if( makecsv ){
				// Make CSV gets it's data from the HTTP session.
				this.makeCSV(response, out, session);
			} else {
				this.makeJSON(response, out, session);
			}

		} else {
			response.setContentType("text/html");
			out.println("<h2>No route supplied.</h2>");
		}

		out.close();
	}

	private double pMax = 350.0;

	private long dist( JSONObject start, JSONObject fin){
		if( start == null){
			return 0;
		}
		double p1Lat = Double.parseDouble(start.get("lat").toString());
		double p1Lng = Double.parseDouble(start.get("lng").toString());
		double p2Lat = Double.parseDouble(fin.get("lat").toString());
		double p2Lng = Double.parseDouble(fin.get("lng").toString());

		double latdif = (p1Lat-p2Lat);
		double lngdif = (p1Lng-p2Lng);

		double coslat = Math.cos( p1Lat * 3.14159 / 180);
		double distance = Math.sqrt( (latdif*latdif) + (lngdif * lngdif) * (coslat * coslat) );
		distance = distance * 111000;
		return (long)Math.ceil(distance);
	}

	private void getPtData( double weight, boolean headwind, JSONObject prev, JSONObject pt, long distsofar, double distortionFactor){

		// JP - Change in algorithm, for saving requests to google.
		// going to calculate ALL the options, in one go, and save needing to revisit the servlet for data. 
		
		// lets start by getting the distance between the points.
		// long dist = this.dist( prev, pt );
		// calculate distance OUTSIDE this routine, so that we can split the big distances up.
		long dist = this.dist( prev, pt ); 
		 pt.put("distprev", dist);
		// double dist = Double.parseDouble(pt.get("distprev") + "");

		// now, lets get the altitude of the latest point.
		int height = 0;

		height = Integer.parseInt(pt.get("alt").toString());

		// now we need the diff in height, as it's part of the triangle.
		if(prev == null){
			pt.put("altdiff", 0);
			pt.put("gradient", 0);
			pt.put("grade", 0);
			pt.put("energy", 0);
			pt.put("time", 0.0);
			pt.put("theta", 0.0);
			pt.put("time", 0.0);
			pt.put("power", 0.0);
			pt.put("velocity", 0.0);
			pt.put("kP", 0.0);
			pt.put("kC", 0.0);
			pt.put("dDist", 0.0);
			pt.put("tDist", 0);
			
			pt.put("hwtruew100", 0.0);
			pt.put("hwtruew80", 0.0);
			pt.put("hwtruew60", 0.0);
			pt.put("hwfalsew100", 0.0);
			pt.put("hwfalsew80", 0.0);
			pt.put("hwfalsew60", 0.0);

		} else {
			pt.put("tDist", distsofar + dist);
			int difHeight = (Integer.parseInt(prev.get("alt").toString()) - height) * -1 ;
			double gradient = 0;
			if( dist != 0 ){
				// supposed to be multiplied by 60 degrees?????
				gradient = (double)difHeight/(double)dist*60.0;
			}
			
			double dDist = Math.sqrt((double)((difHeight * difHeight * distortionFactor) + ( dist * dist)) );
			pt.put("dDist", dDist);
			pt.put("altdiff", difHeight );
			pt.put("gradient", gradient );
			pt.put("grade", Math.round( (gradient/60.0*10000.0))/100.0 );  // turn out "gradient" back into a grade, but to 2 decimal places...
			
			double kC = 50;
			if(headwind){
				kC = 100;
			}
			
			pt.put("kC", kC );

			double kP = 60;
			if( weight >= 70 && weight <=90){
				kP = 80;
			}
			if( weight > 90){
				kP = 100;
			}

			pt.put("kP", kP );
			

			// double theta = Math.toDegrees( (this.pMax - kC)/kP );
			double theta = (this.pMax - kC)/kP ;
			pt.put("theta", theta );

			double velocity = limitVelocity(gradient, theta);
			pt.put("velocity", velocity );
			
			
			double power = limitPower(kP, kC, gradient);
			pt.put("power", power );
			

			double time = ((double)dist/velocity)/1000;
			pt.put("time", time );
			
			
			double energy = power * time;
			pt.put("energy", energy );
			
			
			// we only realy care about energy used.  nothing else.
			
			pt.put("hwtruew100", calcPower(100, 100, gradient, dist));
			pt.put("hwtruew80", calcPower(100, 80, gradient, dist));
			pt.put("hwtruew60", calcPower(100, 60, gradient, dist));
			
			pt.put("hwfalsew100", calcPower(50, 100, gradient, dist));
			pt.put("hwfalsew80", calcPower(50, 80, gradient, dist));
			pt.put("hwfalsew60", calcPower(50, 60, gradient, dist));

		}

	}
	
	private double calcPower(double kC, double kP, double gradient, long dist){
		double theta = (this.pMax - kC)/kP ;
		double velocity = limitVelocity(gradient, theta);
		double power = limitPower(kP, kC, gradient);
		double time = ((double)dist/velocity)/1000;
		double energy = power * time;
		return energy;
		
	}
	
	private double limitVelocity(double gradient, double theta){
		double velocity = 18;
		if(gradient >= theta){
			velocity = (velocity*theta)/gradient;
		}
		return velocity;
	}
	
	private  double limitPower(double kP, double kC, double gradient){
		double power = kP * gradient  +kC;
		if(power < 0){
			power = 0;
		}
		if(power>this.pMax){
			power = this.pMax;
		}
		return power;
	}

	private void makeCSV(HttpServletResponse response, PrintWriter out,  HttpSession session ){
		
		
		JSONArray jaSteps =(JSONArray)session.getAttribute("datapts");
		JSONArray jaReturn =(JSONArray)session.getAttribute("dataptsRet");
		
		double energyReq = Double.parseDouble( session.getAttribute("energyReq").toString());
		long travelDist = Long.parseLong(session.getAttribute("travelDist").toString());
		double travelTime = Double.parseDouble(session.getAttribute("travelTime").toString());

		double energyReqRet = Double.parseDouble( session.getAttribute("energyReqRet").toString());
		long travelDistRet = Long.parseLong(session.getAttribute("travelDistRet").toString());
		double travelTimeRet = Double.parseDouble(session.getAttribute("travelTimeRet").toString());
		
		Iterator iptsIndex = jaSteps.iterator();
		
		if(jaSteps == null){
			response.setContentType("text/html");
			out.println("<h2>No CSV available at this time.</h2>");
			out.println("<script type=\"javascript\">alert(\"Sorry, we can not create a CSV file at this time.  Please refresh your route, and try again.\");</script>");
		}
		
		response.setContentType("text/csv");
		response.addHeader("Content-Disposition", "attachment;filename=route.csv");
		out.println("lat, lng, alt, distprev, time, altdiff, energy, theta, kP, kC, velocity, power, gradient,Added Pts");
		// make the csv file...  Hmm...
		while (iptsIndex.hasNext()){
			JSONObject pt = (JSONObject)iptsIndex.next();
			String line = pt.get("lat").toString() + ", " +
			pt.get("lng").toString() + ", " +
			pt.get("alt").toString() +", " +
			pt.get("distprev").toString() +", " +
			pt.get("time").toString() +", " +
			pt.get("altdiff").toString() +", " +
			pt.get("energy").toString() +", " +
			
			pt.get("theta").toString() +", " +
			pt.get("kP").toString() +", " +
			pt.get("kC").toString() +", " +
			pt.get("velocity").toString() +", " +
			pt.get("power").toString() +", " +
			pt.get("gradient").toString();
			// don't need sp any more, as we're getting ALL the points from the browser.
			out.println(line);

		}
		out.println("");  // blank line for the stuff.
		out.println("totalenergy, " + energyReq + ", total distance, " + travelDist + ", total time" + travelTime);

		out.println("");  // blank line for the stuff.
		out.println("Return trip");  // blank line for the stuff.
		out.println("");  // blank line for the stuff.
		
		Iterator iptsIndex2 = jaReturn.iterator();
		out.println("lat, lng, alt, distprev, time, altdiff, energy, theta, kP, kC, velocity, power, gradient,Added Pts");
		// make the csv file...  Hmm...
		while (iptsIndex2.hasNext()){
			JSONObject pt = (JSONObject)iptsIndex2.next();
			String line = pt.get("lat").toString() + ", " +
			pt.get("lng").toString() + ", " +
			pt.get("alt").toString() +", " +
			pt.get("distprev").toString() +", " +
			pt.get("time").toString() +", " +
			pt.get("altdiff").toString() +", " +
			pt.get("energy").toString() +", " +
			
			pt.get("theta").toString() +", " +
			pt.get("kP").toString() +", " +
			pt.get("kC").toString() +", " +
			pt.get("velocity").toString() +", " +
			pt.get("power").toString() +", " +
			pt.get("gradient").toString();
			// don't need sp any more, as we're getting ALL the points from the browser.
			out.println(line);

		}
		out.println("");  // blank line for the stuff.
		out.println("totalenergy, " + energyReqRet + ", total distance, " + travelDistRet + ", total time" + travelTimeRet);
		
		
	}
	
	private void makeJSON(HttpServletResponse response, PrintWriter out,  HttpSession session ){
		JSONArray jaSteps =(JSONArray)session.getAttribute("datapts");
		double energyReq = Double.parseDouble( session.getAttribute("energyReq").toString());
		long travelDist = Long.parseLong(session.getAttribute("travelDist").toString());
		double travelTIme = Double.parseDouble(session.getAttribute("travelTime").toString());

		JSONArray jaReturn =(JSONArray)session.getAttribute("dataptsRet");
		double energyReqRet = Double.parseDouble( session.getAttribute("energyReqRet").toString());
		long travelDistRet = Long.parseLong(session.getAttribute("travelDistRet").toString());
		double travelTimeRet = Double.parseDouble(session.getAttribute("travelTimeRet").toString());
		
		long amin = Long.parseLong(session.getAttribute("altmin").toString());
		long amax = Long.parseLong(session.getAttribute("altmax").toString());
		
		// alts is needed by the Chart feature.
		JSONArray alts =(JSONArray)session.getAttribute("alts");
		
		response.setContentType("application/json");
		
		JSONObject result = new JSONObject();
		
		result.put("totenergy", energyReq);
		result.put("totdist", travelDist);
		result.put("tottime", travelTIme);

		result.put("totenergyRet", energyReqRet);
		result.put("totdistRet", travelDistRet);
		result.put("tottimeRet", travelTimeRet);

		//JSONArray steps = new JSONArray();
		//while (iptsIndex.hasNext()){
		//	String indx = (String)iptsIndex.next();
		//	steps.add( pts.get( indx));
		//}
		result.put("steps", jaSteps);
		result.put("stepsreturn", jaReturn);
		result.put("alts", alts);
		result.put("altmin", amin);
		result.put("altmax", amax);
		
		
		out.println( result );
		
	}
	private void doCalcs( HttpSession session, double distortionFactor ){
		
		JSONArray jaSteps =(JSONArray)session.getAttribute("datapts");
		boolean headwind = 	( session.getAttribute("headwind").toString() == "true");
		double weight =		Double.parseDouble(session.getAttribute("weight").toString());
		
		Iterator iter = jaSteps.iterator();

		// Ok, to collect up the points, we're going to use 2 structures.
		// pts, which is a MAP, indexed by a string
		// ptsIndex which is a LIST (i.e. array) of strings (which are the indexes of pts)

		
		// small diff here, we're gunna do all 3 power/headwind useage combo's in teh one.  no need to recalc in JS then.
		
		double energyReq = 0;
		long travelDist = 0;
		double travelTime = 0;
		
		JSONObject joLastPt = null;
		
		long processed = 0;
		long stepsize = (long) jaSteps.size();
		JSONObject[] reverser = new JSONObject[jaSteps.size() ];
		JSONArray alts = new JSONArray();
		long amin = 999999;
		long amax = -999999;
		long alt;
		int pos =0; 
	
		while(iter.hasNext()){
			// the javascript in (routerise.js) has already simplified the array down.
			JSONObject joPt = (JSONObject)iter.next();
			reverser[pos] = new JSONObject();
			reverser[pos].put("lat", joPt.get("lat") );
			reverser[pos].put("lng", joPt.get("lng") );
			reverser[pos].put("alt", joPt.get("alt") );
			alt = ((Long) joPt.get("alt")).longValue();
			alts.add(joPt.get("alt"));
			
			if(alt > amax){
				amax = alt;
			}
			if(alt < amin){
				amin = alt;
			}
			pos ++;
			
			// ok, we don't have this pt already, so add it in.
			// String index = joPt.get("wh").toString() + "=>" + joPt.get("xh").toString();

			// first, see how long between here and previous pt.  if bigger than maxsegment, break it into smaller units.
			// if( (double)dist > maxsegment){
			// split the pts into smaller pieces.
		/*	splitSegment(webService, weight, headwind, joLastPt, joPt , pts, ptsIndex , maxsegment, dist); */
			getPtData( weight, headwind,  joLastPt,  joPt, travelDist, distortionFactor);
			
		/*	energyReq = energyReq + Double.parseDouble( joPt.get("energyReq")+"");
			travelDist = travelDist + Long.parseLong( joPt.get("travelDist")+"");
			travelTIme = travelTIme + Double.parseDouble( joPt.get("travelTIme")+"");
		*/
			energyReq = energyReq + Double.parseDouble( joPt.get("energy")+"");
			travelDist = travelDist + Long.parseLong( joPt.get("distprev")+"");
			travelTime = travelTime + Double.parseDouble( joPt.get("time")+"");
			processed ++;
			session.setAttribute("progress", "{\"status\":\"Calculating\",\"count\":" + processed + " ,\"size\":"+stepsize+"}");

			joLastPt = joPt;
		}		
		// ok, store all that lovely calculated data BACK into the session (just in case, it didn't update it properly.
		session.setAttribute("datapts", jaSteps);
		session.setAttribute("energyReq", energyReq);
		session.setAttribute("travelDist", travelDist);
		session.setAttribute("travelTime", travelTime);
		session.setAttribute("alts", alts);
		session.setAttribute("altmin", amin);
		session.setAttribute("altmax", amax);
		
		JSONArray jaReverse = new JSONArray();
		// ok, now we have the data in reverse, lets put it all back together, in the oposite order.
		for( int i = reverser.length-1; i >= 0; i--){
			jaReverse.add(reverser[i]);
		}
		
		// now we have our reversed jaReverse, lets calculat the path for it now.
		Iterator iter2 = jaReverse.iterator();
		
		joLastPt = null; // reset the last point to null, so it starts calculating again.
		energyReq = 0;
		travelDist = 0;
		travelTime = 0;
		processed = 0;
		while(iter2.hasNext()){
			// the javascript in (routerise.js) has already simplified the array down.
			JSONObject joPt = (JSONObject)iter2.next();
			// ok, we don't have this pt already, so add it in.
			// String index = joPt.get("wh").toString() + "=>" + joPt.get("xh").toString();

			// first, see how long between here and previous pt.  if bigger than maxsegment, break it into smaller units.
			// if( (double)dist > maxsegment){
			// split the pts into smaller pieces.
		/*	splitSegment(webService, weight, headwind, joLastPt, joPt , pts, ptsIndex , maxsegment, dist); */
			getPtData( weight, headwind,  joLastPt,  joPt, travelDist, distortionFactor);
		/*	energyReq = energyReq + Double.parseDouble( joPt.get("energyReq")+"");
			travelDist = travelDist + Long.parseLong( joPt.get("travelDist")+"");
			travelTIme = travelTIme + Double.parseDouble( joPt.get("travelTIme")+"");
		*/
			energyReq = energyReq + Double.parseDouble( joPt.get("energy")+"");
			travelDist = travelDist + Long.parseLong( joPt.get("distprev")+"");
			travelTime = travelTime + Double.parseDouble( joPt.get("time")+"");
			processed ++;
			session.setAttribute("progress", "{\"status\":\"Calculating\",\"count\":" + processed + " ,\"size\":"+stepsize+"}");
			joLastPt = joPt;
		}		
		session.setAttribute("dataptsRet", jaReverse);
		session.setAttribute("energyReqRet", energyReq);
		session.setAttribute("travelDistRet", travelDist);
		session.setAttribute("travelTimeRet", travelTime);
		
	}
}
