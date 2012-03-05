/**
 * 
 */
package net.cbdweb;

import org.json.simple.parser.*;
import org.json.simple.*;

/* Imports to support the HTTP request...
 * see http://home.eekie.net/node/1271 */
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URL;
import java.util.HashMap;
import java.util.Iterator;

/*
 * to represent the path a a string of points, we'll break the URL length for even moderaely small paths.
 * To overcome this, I'm using the Encoded PolyLine code from here...
 * http://facstaff.unca.edu/mcmcclur/googlemaps/encodepolyline/pitfalls.html
 * to implement paths, as described here.
 * http://code.google.com/apis/maps/documentation/elevation/#Paths
 */
import it.rambow.master.javautils.*;

/**
 * @author John Porra
 * 
 * A wrapper class to contact the Google Elevation service, and given an 
 *
 */
public class GoogleElevations {

	
	
	public GoogleElevations(){
	/**
	 * Create a google elevation object.	
	 */
		
	}
	
	public long maxAlt;
	public long minAlt;
	
	public JSONArray getJSONPath( JSONArray json, int steps ){
		/**
		 * Take an array of JSONObjects (i.e. the path) and 
		 */
		// JSONObject results = new JSONObject();

		// do the real work here...
		String requestUrl = "http://maps.google.com/maps/api/elevation/json?sensor=false&samples=" + steps + "&path=enc:";
		
		// now we have to build the rest of the url parameters...
		Track trk = new Track();
		Double lat;
		Double lng;
		
		Iterator piter = json.iterator();
		
		while( piter.hasNext()){
			JSONObject joPt = (JSONObject)piter.next();
			lat = Double.parseDouble(joPt.get("lat").toString());
			lng = Double.parseDouble(joPt.get("lng").toString());
			trk.addTrackpoint(new Trackpoint(lat, lng));
			
		}

		// Ok, we've now built our track, lets convert the sucker.
		PolylineEncoder ple = new PolylineEncoder();
		HashMap<String, String> pleh = ple.createEncodings(trk, 17, 1); 
		requestUrl += pleh.get("encodedPoints").toString();
		
		String resultStr = "";
		/*
		 * The following HTTP get, was taken from http://home.eekie.net/node/1271
		 */
        try {
            URL url = new URL(requestUrl.toString());
            BufferedReader in = new BufferedReader(new InputStreamReader(url.openStream()));
            String inputLine;
            System.out.println("-----RESPONSE START-----");
            while ((inputLine = in.readLine()) != null) {
                // System.out.println(inputLine);
            	resultStr += inputLine.trim();
            }
            in.close();
            System.out.println(resultStr);
            System.out.println("-----RESPONSE END-----");
            
        } catch (IOException e) {
            e.printStackTrace();
        }

        JSONParser parser = new JSONParser();
        
        this.maxAlt = -999999;
        this.minAlt =  999999;
        
        try{
        	Object obj = parser.parse(resultStr);
			// out.println( obj );
			JSONObject jObj = (JSONObject)obj;
			// stick the altitude features BACK into the original json.
			
			JSONArray positions = (JSONArray)(jObj.get("results"));
			JSONObject posPt = null;
			JSONObject joPt = null;
			
			piter = json.iterator();
			int offset = 0;
			while( piter.hasNext()){
				posPt = (JSONObject)positions.get(offset);
				joPt = (JSONObject)piter.next();
				long alt = (long)Math.round(Double.parseDouble(posPt.get("elevation").toString()));
				joPt.put("alt", alt );
				if(alt > maxAlt){
					maxAlt = alt;
				}
				if(alt < minAlt){
					minAlt = alt;
				}
				offset ++;
				
				
			}
			
        	
        } catch(ParseException pe){
        	System.out.println("position: " + pe.getPosition());
        	System.out.println(pe);
		}
		
		
		return json;
	}

}
