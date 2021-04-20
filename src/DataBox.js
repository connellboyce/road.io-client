import React from 'react';
import "./DataBox.css";
import logo from "./globe-png-9acqaaMTM.png";

const BACKEND_API_ENDPOINT = "https://roadio-backend.herokuapp.com/api";

class DataBox extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            disabled: false,
            carInfo: "",
            form: {
                origin: {},
                destination: {},
                currentCharge: {}
            },
            suggestions: {
                origin: {},
                destination: {}
            }
        }


        this.onSubmitForm = this.onSubmitForm.bind(this);
        this.changeFormValue = this.changeFormValue.bind(this);
        this.changeOrigin = this.changeOrigin.bind(this);
        this.changeDestination = this.changeDestination.bind(this);
        this.changeCharge = this.changeCharge.bind(this);
        this.toggleOriginSearch = this.toggleOriginSearch.bind(this);
        this.toggleDestinationSearch = this.toggleDestinationSearch.bind(this);
        this.autocomplete = this.autocomplete.bind(this);
    }


    HandleChange() {
        this.setState({disabled: !this.state.disabled})
    }


    toggleOriginSearch(value) {
        let originFragment = value;
        let originResponse = "";

        const ORIGIN_SEARCH_REQUEST = new XMLHttpRequest();
        ORIGIN_SEARCH_REQUEST.open("GET", BACKEND_API_ENDPOINT + "/autocomplete/" + originFragment.toString() + "/USA", false);
        ORIGIN_SEARCH_REQUEST.onload = function () {
            originResponse = JSON.parse(this.response);
        }
        ORIGIN_SEARCH_REQUEST.send();
        return originResponse;

    }

    toggleDestinationSearch(value) {
        let destinationFragment = value;
        let destinationResponse = "";

        const DESTINATION_SEARCH_REQUEST = new XMLHttpRequest();
        DESTINATION_SEARCH_REQUEST.open("GET", BACKEND_API_ENDPOINT + "/autocomplete/" + destinationFragment + "/USA", false);
        DESTINATION_SEARCH_REQUEST.onload = function () {
            destinationResponse = JSON.parse(this.response);
        }
        DESTINATION_SEARCH_REQUEST.send();
        return destinationResponse;
    }

    changeFormValue(e) {
        let {name, value} = e.target;
        this.setState({
            carInfo: value,

        });

    }

    changeOrigin(e) {
        let {name, value} = e.target;
        this.setState({
            form: {
                origin: value,
                destination: this.state.form.destination,
                currentCharge: this.state.form.currentCharge
            }
        });
        if (value != "" && value != null) {
            let currentOriginComplete = this.toggleOriginSearch(value);
            this.autocomplete(currentOriginComplete, true);
        }
    }

    changeDestination(e) {
        let {name, value} = e.target;
        this.setState({
            form: {
                origin: this.state.form.origin,
                destination: value,
                currentCharge: this.state.form.currentCharge
            }
        });
        if (value != "" && value != null) {
            let currentDestinationComplete = this.toggleDestinationSearch(value);
            this.autocomplete(currentDestinationComplete, false);
        }
    }

    changeCharge(e) {
        let {name, value} = e.target;
        this.setState({
            form: {
                origin: this.state.form.origin,
                destination: this.state.form.destination,
                currentCharge: value
            }
        });
    }

    /*function to test whether or not user input areas have valid values
returns an array of "errors" if there are invalid inputs, otherwise returns empty array*/
    handleValidation(origin, destination, currentCharge, dropdown) {
        let errors = [];
        if (origin == null || origin == "" || origin == "[object Object]") {
            errors.push(" Please enter a valid starting point ");
        }
        if ((this.state.disabled) && (destination == null || destination == "" || destination == "[object Object]")) {
            errors.push(" Please enter a valid ending point ");
        }
        if ((this.state.disabled) && (currentCharge == null || (!(currentCharge > 0 && currentCharge <= 100)) || currentCharge == "")) {
            errors.push(" Please enter a valid current charge ");
        }
        if (dropdown == null || dropdown == "") {
            errors.push("Please select a car type ");
        }
        return errors;
    }

    onSubmitForm() {

        let lclProps = this.props;
        var carInfo = this.state.carInfo.split("/");
        var origin = this.state.form.origin;

        var destination = this.state.form.destination;
        var outletType = carInfo[0];
        var speedTable = carInfo[1];
        var maxCharge = carInfo[2];
        var currentCharge = ((this.state.form.currentCharge / 100) * maxCharge);
        var chargingCurve = carInfo[3];
        var maxChargeAfterChargingStation = carInfo[4];
        var range = carInfo[5];
        var routeResponse;
        var originCoordResponse = "";
        var destinationCoordResponse = "";


        if ((this.handleValidation(this.state.form.origin, this.state.form.destination, this.state.form.currentCharge,
            document.getElementById("makeModel").value).length != 0)) //errors are present do not run requests
        {
            window.alert(this.handleValidation(this.state.form.origin, this.state.form.destination, this.state.form.currentCharge,
                document.getElementById("makeModel").value));
        } else { //run requests

            const ORIGIN_COORD_REQUEST = new XMLHttpRequest();
            ORIGIN_COORD_REQUEST.open("GET", BACKEND_API_ENDPOINT + "/autocomplete/" + origin + "/USA", false);
            ORIGIN_COORD_REQUEST.onload = function () {
                let response = JSON.parse(this.response);
                originCoordResponse = response.items[0].position.lat + "," + response.items[0].position.lng;
            }
            ORIGIN_COORD_REQUEST.send();

            if (this.state.disabled === true) {
                const DESTINATION_COORD_REQUEST = new XMLHttpRequest();
                DESTINATION_COORD_REQUEST.open("GET", BACKEND_API_ENDPOINT + "/autocomplete/" + destination + "/USA", false);
                DESTINATION_COORD_REQUEST.onload = function () {
                    let response = JSON.parse(this.response);
                    destinationCoordResponse = response.items[0].position.lat + "," + response.items[0].position.lng;
                }
                DESTINATION_COORD_REQUEST.send();
            }


            if (this.state.disabled === false) {
                var coordinates = originCoordResponse.split(",");
                const ROUTE_REQUEST = new XMLHttpRequest();                   // Search within 100 miles, but it will max out at 20 charging stations
                ROUTE_REQUEST.open("GET", BACKEND_API_ENDPOINT + "/stations/near/" + coordinates[0] + "/" + coordinates[1] + "/" + 100, true);
                ROUTE_REQUEST.onload = function () {
                    routeResponse = JSON.parse(this.response);
                    lclProps.getCgStations(coordinates, range, routeResponse);
                }
                ROUTE_REQUEST.send();
            } else if (this.state.disabled === true) {
                const ROUTE_REQUEST = new XMLHttpRequest();
                ROUTE_REQUEST.open("GET", BACKEND_API_ENDPOINT + "/stations/along/" + originCoordResponse + "/" + outletType + "/" + destinationCoordResponse + "/" + speedTable + "/" + currentCharge + "/" + maxCharge + "/" + chargingCurve + "/" + maxChargeAfterChargingStation, true);
                ROUTE_REQUEST.onload = function () {
                    routeResponse = JSON.parse(this.response);
                    lclProps.displayRoute(routeResponse);
                }
                ROUTE_REQUEST.send();
            }
        }
    }

    //From w3schools -> https://www.w3schools.com/howto/howto_js_autocomplete.asp
    autocomplete(returnObject, isOrigin) {
        let inp;
        if (isOrigin == true) {
            inp = document.getElementById("originInput");
        } else {
            inp = document.getElementById("destinationInput");
        }

        let arr = [];
        if (returnObject.items != null || returnObject.items != "") {
            for (let i = 0; i < returnObject.items.length; i++) {
                if (i > 5) {
                    i = returnObject.items.length;
                } else {
                    arr.push(returnObject.items[i].title);
                }
            }
        }

        /*the autocomplete function takes two arguments,
        the text field element and an array of possible autocompleted values:*/
        var currentFocus;
        /*execute a function when someone writes in the text field:*/
        inp.addEventListener("input", function (e) {
            var a, b, i, val = this.value;
            /*close any already open lists of autocompleted values*/
            closeAllLists();
            if (!val) {
                return false;
            }
            currentFocus = -1;
            /*create a DIV element that will contain the items (values):*/
            a = document.createElement("DIV");
            a.setAttribute("id", this.id + "autocomplete-list");
            a.setAttribute("class", "autocomplete-items");
            /*append the DIV element as a child of the autocomplete container:*/
            this.parentNode.appendChild(a);
            /*for each item in the array...*/
            for (i = 0; i < arr.length; i++) {
                /*check if the item starts with the same letters as the text field value:*/
                if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                    /*create a DIV element for each matching element:*/
                    b = document.createElement("DIV");
                    /*make the matching letters bold:*/
                    b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                    b.innerHTML += arr[i].substr(val.length);
                    /*insert a input field that will hold the current array item's value:*/
                    b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                    /*execute a function when someone clicks on the item value (DIV element):*/
                    b.addEventListener("click", function (e) {
                        /*insert the value for the autocomplete text field:*/
                        inp.value = this.getElementsByTagName("input")[0].value;
                        /*close the list of autocompleted values,
                        (or any other open lists of autocompleted values:*/
                        closeAllLists();
                    });
                    a.appendChild(b);
                }
            }
        });
        /*execute a function presses a key on the keyboard:*/
        inp.addEventListener("keydown", function (e) {
            var x = document.getElementById(this.id + "autocomplete-list");
            if (x) x = x.getElementsByTagName("div");
            if (e.keyCode === 40) {
                /*If the arrow DOWN key is pressed,
                increase the currentFocus variable:*/
                currentFocus++;
                /*and and make the current item more visible:*/
                addActive(x);
            } else if (e.keyCode === 38) { //up
                /*If the arrow UP key is pressed,
                decrease the currentFocus variable:*/
                currentFocus--;
                /*and and make the current item more visible:*/
                addActive(x);
            } else if (e.keyCode === 13) {
                /*If the ENTER key is pressed, prevent the form from being submitted,*/
                e.preventDefault();
                if (currentFocus > -1) {
                    /*and simulate a click on the "active" item:*/
                    if (x) x[currentFocus].click();
                }
            }
        });

        function addActive(x) {
            /*a function to classify an item as "active":*/
            if (!x) return false;
            /*start by removing the "active" class on all items:*/
            removeActive(x);
            if (currentFocus >= x.length) currentFocus = 0;
            if (currentFocus < 0) currentFocus = (x.length - 1);
            /*add class "autocomplete-active":*/
            x[currentFocus].classList.add("autocomplete-active");
        }

        function removeActive(x) {
            /*a function to remove the "active" class from all autocomplete items:*/
            for (var i = 0; i < x.length; i++) {
                x[i].classList.remove("autocomplete-active");
            }
        }

        function closeAllLists(elmnt) {
            /*close all autocomplete lists in the document,
            except the one passed as an argument:*/
            var x = document.getElementsByClassName("autocomplete-items");
            for (var i = 0; i < x.length; i++) {
                if (elmnt != x[i] && elmnt != inp) {
                    x[i].parentNode.removeChild(x[i]);
                }
            }
        }

        /*execute a function when someone clicks in the document:*/
        document.addEventListener("click", function (e) {
            closeAllLists(e.target);
        });
    }

    render() {

        return (
            <div className="DataBox">
                <form>
                    <div id="logo">
                        <h2 type="">road.i<img src={logo} className="DataBox-logo" alt="logo"/></h2>

                    </div>

                    <label htmlFor="">Starting point</label>
                    <br/>
                    <div className="autocomplete">
                        <input id="originInput" type="text" onChange={this.changeOrigin} name="startingPoint"
                               placeholder="Pollock Road, University Park, PA"/>
                    </div>
                    <br/>
                    <br/>

                    <label htmlFor="">Ending point</label>
                    <input type="checkbox" id="checkbox" onChange={this.HandleChange.bind(this)}/>
                    <br/>
                    <div className="autocomplete">
                        <input id="destinationInput" type="text" onChange={this.changeDestination} name="endingPoint"
                               placeholder="Tampa, FL" disabled={(!this.state.disabled)}/>
                    </div>
                    <br/>

                    <h4>EV Specs</h4>
                    <label htmlFor="">Current State of Charge</label>
                    <input type="text" name="currentCharge" id="currentCharge" placeholder="80"
                           onChange={this.changeCharge}
                           disabled={(!this.state.disabled)}/> <label>%</label>

                    <label id="makeLabel"> Make and Model </label>
                    <select className="box" id="makeModel" onChange={this.changeFormValue}>
                        <option value=""></option>
                        <option
                            value="iec62196Type1Combo/110,0.165/60/0,50,9,52,12,54,15,54,18,54,21,54,24,55,27,55,30,55,33,37,36,37,39,37,42,23,45,23,48,23,51,16,54,16,57,10,60,4/60/383023.9"> Chevy
                            Bolt 2017-2019
                        </option>
                        <option
                            value="tesla,iec62196Type1Combo/110,0.15/79/0,50,7.9,100,15.8,120,23.7,120,31.6,120,39.5,120,47.4,90,55.3,80,63.2,55,71.1,30,79,5/79/498896.6"> Tesla
                            Model 3 Long Range
                        </option>
                        <option
                            value="iec62196Type1Combo/110,0.131/28/0,40,2.8,43,5.6,44,8.4,45,11.2,45,14,46,16.8,47,19.6,48,22.4,45,25.2,23,28,5/28/199558.7"> Hyundai
                            Ioniq Electric
                        </option>
                        <option
                            value="iec62196Type1Combo/110,0.164/64/0,40,6.4,70,12.8,72,19.2,73,25.6,74,32,76,38.4,57,44.8,58,51.2,24,57.6,22,64,10/64/415210.8"> Hyundai
                            Kona Electric
                        </option>
                    </select>

                    <button type="button" id="submit" onClick={this.onSubmitForm}>Submit</button>

                </form>
            </div>
        );

    }
}

export default DataBox;
