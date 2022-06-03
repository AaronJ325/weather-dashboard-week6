var userFormEl = document.querySelector("#form");
var userInputEl = document.querySelector("#input-location");
var currentCityDivEl = document.querySelector("#current-city-div");
var cityHeaderEl = document.querySelector("#city-header");
var cityListEl = document.querySelector("#city-list");
var previousCitiesDiv = document.querySelector("#previous-cities-div");
var previousSearchesArray = [];

const myWeatherApiKey = "&appid=db5c0fd2b45b6f4bb5fa58e25f4eec1d";

Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

async function repeatSearchAndDisplay(e){
    let array = e.target.innerText.split(',').map(string => string.trim());
    let locationObject = await getLocationWeatherObject(array);
    let weatherData = await getCurrentAndForecastWeather(locationObject);
    displayWeather(weatherData, locationObject.locationString);
}

function addToPreviousCitiesDiv(locationString){
    var locationBtn = document.createElement("button");
    locationBtn.innerText = locationString;
    locationBtn.addEventListener("click", repeatSearchAndDisplay);
    previousCitiesDiv.append(locationBtn);
}

var checkSyntaxAndReturnArray = function (location) {

    var hasComma = location.includes(',');

    if (hasComma) {
        let array = location.split(',').map(string => string.trim());
        return array;
    } else {
        return false;
    }
}

async function getLocationWeatherObject(locationArray) {
    const weatherUrl = "https://api.openweathermap.org/data/2.5/weather";
    const limit = "&limit=3";
    const locationString = locationArray.join(', ');
    const apiUrl = weatherUrl + "?q=" + locationString + limit + myWeatherApiKey;
    try {
        let response = await fetch(apiUrl);
        let data = await response.json();
        if (data.cod === "404") {
            return;
        }
        return { data, locationString };
    } catch (error) {
        console.log(error);
    }
}

async function getCurrentAndForecastWeather(locationObj) {
    const lon = "&lon=" + locationObj.data.coord.lon;
    const lat = "lat=" + locationObj.data.coord.lat;
    const baseUrl = "https://api.openweathermap.org/data/2.5/onecall";
    const myUnits = "&units=imperial";
    const exclude = "&exclude=minutely,hourly,alerts";
    const apiUrl = baseUrl + "?" + lat + lon + exclude + myWeatherApiKey + myUnits;

    try {
        let response = await fetch(apiUrl);
        let data = await response.json();
        return data;
    } catch (error) {
        console.log(error);

    }
};

async function formSubmitHandler(event) {
    event.preventDefault();
    const location = userInputEl.value.trim();
    var locationObject = {};
    if (!location) {
        alert("Please enter a location.");
    } else {
        userInputEl.value = "";
        var inputSplitArray = checkSyntaxAndReturnArray(location);
        if (!inputSplitArray) {
            alert("Please enter the information as required."
                + "\nEnter the city, state, and country separating them as in the example."
                + "\nExample: Houston, Texas, USA");
        } else {
            locationObject = await getLocationWeatherObject(inputSplitArray);
            console.log('locationObject is', locationObject);
            if(!locationObject) {
                alert("It appears there was a problem in the process of carrying out the search."
                    + "\nThis is likely an Error 404: resource not found. Please try your search again.");
            } else {
                previousSearchesArray.push(locationObject.locationString);
                localStorage.setItem("storedCities", JSON.stringify(previousSearchesArray));
                weatherData = await getCurrentAndForecastWeather(locationObject);
                displayWeather(weatherData, locationObject.locationString);
                addToPreviousCitiesDiv(locationObject.locationString);
                console.log(weatherData);
            }  
        }
    }
}

function loadCities(){
    var previousSearches = localStorage.getItem("storedCities");
    if(!previousSearches) {
        console.log("previousSearches is falsy; jumping out of loadCities().");
        return;
    }else{
        previousSearchesArray = JSON.parse(previousSearches).slice(-5);
        for(let i = 0; i < previousSearchesArray.length; i++){
            var locationBtn = document.createElement("button");
            locationBtn.innerText = previousSearchesArray[i];
            locationBtn.addEventListener("click", repeatSearchAndDisplay);
            previousCitiesDiv.append(locationBtn);
        }
    }
}

userFormEl.addEventListener("submit", formSubmitHandler);
loadCities();
function displayWeather(weatherObj, inputLocation) {
    const today = new Date();
    const t0 = today.toDateString().split(' ').slice(1).join(' ');
    const t1 = today.addDays(1).toDateString().split(' ').slice(1, 3).join(' ');
    const t2 = today.addDays(2).toDateString().split(' ').slice(1, 3).join(' ');
    const t3 = today.addDays(3).toDateString().split(' ').slice(1, 3).join(' ');
    const t4 = today.addDays(4).toDateString().split(' ').slice(1, 3).join(' ');
    const t5 = today.addDays(5).toDateString().split(' ').slice(1, 3).join(' ');

    const details = `
        <p class="" id="city-header">
            ${inputLocation} (approx. lat/long: ${Math.round(weatherObj.lat)}/${Math.round(weatherObj.lon)}) ${t0}
        </p>
        <hr>
        <div class="d-flex flex-column flex-sm-row">
            
            <ul class="col" id="city-list">
                <li>Temperature: ${Math.round(weatherObj.current.temp)}°F (feels like ${Math.round(weatherObj.current.feels_like)} °F)</li>
                <li>Humidity: ${weatherObj.current.humidity}%</li>
                <li>Wind speed: ${weatherObj.current.wind_speed}mph (gusting ${weatherObj.current.wind_gust ? Math.round(weatherObj.current.wind_gust) : 0})</li>
                <li>UV index: ${weatherObj.current.uvi}</li>
                <li>Visibility: ${weatherObj.current.visibility}ft</li>
            </ul>

            <img class="col align-self-center border" src="http://openweathermap.org/img/wn/${weatherObj.current.weather[0].icon}@2x.png">
        </div>
        <hr>
        <div>
        <p class="text-center my-3" id="id-forecast-header">
            5-Day Forecast As Follows
        <p>
        <div class="row justify-content-center">

            <div class="card col-10 col-sm-5 col-lg-3 mx-sm-1 my-sm-2 class-card">
                <div class="card-header class-card-header">
                    ${t1}
                </div>
                <img class="" src="http://openweathermap.org/img/wn/${weatherObj.daily[0].weather[0].icon}@2x.png">
                <div class="card-body class-card-body d-flex justify-content-center justify-content-md-start">
                    <ul>
                        <li>Temp max/min: ${Math.round(weatherObj.daily[0].temp.max)}/${Math.round(weatherObj.daily[0].temp.min)}°F</li>
                        <li>Humidity: ${weatherObj.daily[0].humidity}%</li>
                        <li>Wind: ${Math.round(weatherObj.daily[0].wind_speed)}mph</li>
                    </ul>
                </div>
            </div>

            <div class="card col-10 col-sm-5 col-lg-3 mx-sm-1 my-sm-2 class-card">
                <div class="card-header class-card-header">
                    ${t2}
                </div>
                <img class="" src="http://openweathermap.org/img/wn/${weatherObj.daily[1].weather[0].icon}@2x.png">
                <div class="card-body class-card-body d-flex justify-content-center justify-content-md-start">
                    <ul>
                        <li>Temp max/min: ${Math.round(weatherObj.daily[1].temp.max)}/${Math.round(weatherObj.daily[1].temp.min)}°F</li>
                        <li>Humidity: ${weatherObj.daily[1].humidity}%</li>
                        <li>Wind: ${Math.round(weatherObj.daily[1].wind_speed)}mph</li>
                    </ul>
                </div>
            </div>

            <div class="card col-10 col-sm-5 col-lg-3 mx-sm-1 my-sm-2 class-card">
                <div class="card-header class-card-header">
                    ${t3}
                </div>
                <img class="" src="http://openweathermap.org/img/wn/${weatherObj.daily[2].weather[0].icon}@2x.png">
                <div class="card-body class-card-body d-flex justify-content-center justify-content-md-start">
                    <ul>
                        <li>Temp max/min: ${Math.round(weatherObj.daily[2].temp.max)}/${Math.round(weatherObj.daily[2].temp.min)}°F</li>
                        <li>Humidity: ${weatherObj.daily[2].humidity}%</li>
                        <li>Wind: ${Math.round(weatherObj.daily[2].wind_speed)}mph</li>
                    </ul>
                </div>
            </div>

            <div class="card col-10 col-sm-5 col-lg-3 mx-sm-1 my-sm-2 class-card">
                <div class="card-header class-card-header">
                    ${t4}
                </div>
                <img class="" src="http://openweathermap.org/img/wn/${weatherObj.daily[3].weather[0].icon}@2x.png">
                <div class="card-body class-card-body d-flex justify-content-center justify-content-md-start">
                    <ul>
                        <li>Temp max/min: ${Math.round(weatherObj.daily[3].temp.max)}/${Math.round(weatherObj.daily[3].temp.min)}°F</li>
                        <li>Humidity: ${weatherObj.daily[3].humidity}%</li>
                        <li>Wind: ${Math.round(weatherObj.daily[3].wind_speed)}mph</li>
                    </ul>
                </div>
            </div>

            <div class="card col-10 col-sm-5 col-lg-3 mx-md-1 my-md-2 class-card">
            <div class="card-header class-card-header">
                ${t5}
            </div>
            <img class="" src="http://openweathermap.org/img/wn/${weatherObj.daily[4].weather[0].icon}@2x.png">
            <div class="card-body class-card-body d-flex justify-content-center justify-content-md-start">
                <ul>
                    <li>Temp max/min: ${Math.round(weatherObj.daily[3].temp.max)}/${Math.round(weatherObj.daily[3].temp.min)}°F</li>
                    <li>Humidity: ${weatherObj.daily[3].humidity}%</li>
                    <li>Wind: ${Math.round(weatherObj.daily[3].wind_speed)}mph</li>
                </ul>
            </div>
        </div>

        `
    currentCityDivEl.innerHTML = details;
}