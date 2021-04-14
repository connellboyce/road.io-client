import React, {Component} from 'react';
import DataBox from './DataBox';
import "./Map.css";

class Map extends Component {
    mapRef = React.createRef();

    constructor(props) {
        super(props);
        this.state = {
            error: null,
            isLoaded: false,
            hereKey: null,
            map: null,
            H: null,
            ui: null
        };
        this.displayRoute = this.displayRoute.bind(this);
        this.getCgStations = this.getCgStations.bind(this);
    }

    componentDidMount() {
        /*Synchronous GET request to Spring Boot backend
        Requires the Spring Boot app to be running!*/
        var data = "";
        const REQUEST = new XMLHttpRequest();
        REQUEST.open("GET", "https://roadio-backend.herokuapp.com/secrets/here",false);
        REQUEST.onload = function() {
            //Parse JSON
            data = this.response;
        }
        REQUEST.send();

        //Initial HERE connection with requested API key
        const H = window.H;

        const platform = new H.service.Platform({
            apikey: data
        });

        const defaultLayers = platform.createDefaultLayers();

        //Create an instance of the map
        const map = new H.Map(
            this.mapRef.current,
            defaultLayers.vector.normal.map,
            {
                // Center map over eastern U.S.
                center: {lat: 40, lng: -77},
                zoom: 4,
                pixelRatio: window.devicePixelRatio || 1,
            }
        );

        //Enable moving the map and zooming
        const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
        /*Create the default UI components to allow the user to interact with them
         Important for Info bubbles */
        const ui = H.ui.UI.createDefault(map, defaultLayers);

        this.setState({ui});
        this.setState({map});
        this.setState({H});
    }

    displayRoute(result) {
        //Clear routes
        this.state.map.removeObjects(this.state.map.getObjects());
        // Ensure that at least one route was found
        if (result.routes !== undefined) {
            if (result.routes.length) {
                //Info Bubble for charging stations
                var group = new this.state.H.map.Group();
                this.state.map.addObject(group);
                //Make them interactive
                let lclState = this.state;
                group.addEventListener('tap', function (evt) {

                    var bubble = new lclState.H.ui.InfoBubble(evt.target.getGeometry(), {
                        content: evt.target.getData()
                    });
                    lclState.ui.addBubble(bubble);
                }, false);

                result.routes[0].sections.forEach((section) => {
                    // Create a linestring to use as a point source for the route line
                    let linestring = lclState.H.geo.LineString.fromFlexiblePolyline(section.polyline);

                    // Create a polyline to display the route:
                    let routeLine = new lclState.H.map.Polyline(linestring, {
                        style: {strokeColor: 'blue', lineWidth: 3}
                    });

                    // Create a marker for the start point:
                    let startMarker = new lclState.H.map.Marker(section.departure.place.location);

                    //Edit charging station pop up
                    if (section.departure.place.type == "chargingStation") {

                        let stationName = "";
                        let tempStationName = section.departure.place.name;
                        if (tempStationName == undefined) {
                            stationName = "Charging Station";
                        } else {
                            stationName = tempStationName;
                        }
                        let stationLocation = section.departure.place.location.lat + ", " +
                            section.departure.place.location.lng;

                        let htmlMsg = document.createElement("div");
                        htmlMsg.id = "htmlMsg";
                        let header = document.createElement('h2');
                        header.innerText = stationName;
                        header.id = "header";
                        htmlMsg.appendChild(header);
                        let textNode = document.createTextNode(stationLocation);
                        htmlMsg.appendChild(textNode);

                        startMarker.setData(htmlMsg);
                    } else {
                        let htmlMsg = document.createElement("div");
                        htmlMsg.id = "htmlMsg";
                        let header = document.createElement('h2');
                        header.innerText = "Start";
                        header.id = "header";
                        htmlMsg.appendChild(header);
                        startMarker.setData(htmlMsg);
                    }

                    group.addObject(startMarker);

                    /*Create a marker for the end point:
                    This process has to be done for both the section.departure and section.arrival, or the 1st charging station will be missing.*/
                    let endMarker = new lclState.H.map.Marker(section.arrival.place.location);

                    if (section.arrival.place.type == "chargingStation") {
                        let stationName = "";
                        let tempStationName = section.arrival.place.name;
                        if (tempStationName == undefined) {
                            stationName = "Charging Station";
                        } else {
                            stationName = tempStationName;
                        }
                        let stationLocation = section.arrival.place.location.lat + ", " +
                            section.arrival.place.location.lng;

                        let htmlMsg = document.createElement("div");
                        htmlMsg.id = "htmlMsg";
                        let header = document.createElement('h2');
                        header.innerText = stationName;
                        header.id = "header";
                        htmlMsg.appendChild(header);
                        let textNode = document.createTextNode(stationLocation);
                        htmlMsg.appendChild(textNode);
                        endMarker.setData(htmlMsg);
                    } else {
                        let htmlMsg = document.createElement("div");
                        htmlMsg.id = "htmlMsg";
                        let header = document.createElement('h2');
                        header.innerText = "End";
                        header.id = "header";
                        htmlMsg.appendChild(header);
                        endMarker.setData(htmlMsg);
                    }

                    group.addObject(endMarker);

                    lclState.map.addObject(routeLine);

                    // Set the map's viewport to zoom into the route:
                    lclState.map.getViewModel().setLookAtData({bounds: routeLine.getBoundingBox()});
                });
            } else {
                alert("There is no possible routing for these parameters!");
            }
        } else {
            alert("There is no possible routing for these parameters!");
        }
    };

    getCgStations(location, range, result) {

        let lat = location[0];
        let lon = location[1];
        //Scale back the range by 30%, since we can't drive in a straight line
        //This gives a reasonable estimation
        let cirRadius = (range * 0.70);

        let lclState = this.state;
        //Clear map of existing objects
        this.state.map.removeObjects(this.state.map.getObjects());

        //Place a range circle
        let circle = this.state.map.addObject(new this.state.H.map.Circle(
            {lat: lat, lng: lon},
            cirRadius
        ));

        //Place charging stations
        var group = new this.state.H.map.Group();
        this.state.map.addObject(group);
        group.addEventListener('tap', function (evt) {

            var bubble = new lclState.H.ui.InfoBubble(evt.target.getGeometry(), {
                content: evt.target.getData()
            });
            lclState.ui.addBubble(bubble);
        }, false);

        result.fuel_stations.forEach((station) => {

            let HERElocation = {
                "lat": station.latitude,
                "lng": station.longitude,
            }

            let stationMarker = new lclState.H.map.Marker(HERElocation);
            let stationName = station.station_name;
            let address = station.street_address;
            let city = station.city;
            let state = station.state;

            let stationPhone = station.station_phone;
            let accessDetail = station.access_days_time;
            let connectorTypes = station.ev_connector_types;
            let pricing = station.ev_pricing;
            if (!pricing) {
                pricing = "N/A";
            }
            let lastConfirmed = station.date_last_confirmed;

            let htmlMsg = document.createElement("div");
            htmlMsg.id = "htmlMsg";

            let header = document.createElement('h2');
            header.innerText = stationName;
            header.id = "header";
            htmlMsg.appendChild(header);

            let textNode = document.createTextNode(address + " " + city + ", " + state);
            htmlMsg.appendChild(textNode);

            let paragraph = document.createElement("p");
            paragraph.id = "paragraph";
            paragraph.innerText = "Phone: " + stationPhone + "\nAccess: " + accessDetail + "\nConnector(s): " + connectorTypes + "\nPricing: " + pricing + "\nLast Confirmed: " + lastConfirmed;
            htmlMsg.appendChild(paragraph);

            stationMarker.setData(htmlMsg);
            group.addObject(stationMarker);

        });
        this.state.map.getViewModel().setLookAtData({bounds: group.getBoundingBox()});
    }

    componentWillUnmount() {
        if (this.state.map) {
            this.state.map.dispose();
        }
    }

    render() {
        const {error, isLoaded, hereKey} = this.state;
        return (
            <div ref={this.mapRef} style={{height: window.innerHeight}}>
                <DataBox displayRoute={this.displayRoute} getCgStations={this.getCgStations}/>
            </div>
        );
    }

}

export default Map;