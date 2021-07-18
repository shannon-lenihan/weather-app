//some givens for use throughout

var DateTime = luxon.DateTime;
let windSpeed = null;
let mainTemperature = null;

let daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

let monthsofYear = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "Septemper",
  "October",
  "November",
  "December",
];

//get rid of the 24-hour clock because the coder is an American

function hourConversion(hour) {
  if (hour > 12) {
    return `${(hour - 12 < 10 ? "0" : "") + (hour - 12)}`;
  } else if (hour < 10) {
    return `0${hour}`;
  } else if (hour === 0) {
    return `12`;
  } else {
    return hour;
  }
}

//calculate day and time for a given location (default is user's local time)

function calculatedTime(givenTime, timezone) {
  let dt = DateTime.local(givenTime).setZone(timezone);
  let hour = hourConversion(dt.hour);
  let ampm = dt.hour >= 12 ? "PM" : "AM";

  let minutes = dt.minute;
  if (minutes < 10) {
    minutes = `0${minutes}`;
  }

  return `${hour}:${minutes} ${ampm}`;
}

function calculatedDate(givenDay, timezone) {
  let dt = DateTime.local(givenDay).setZone(timezone);

  let dayOfWeek = daysOfWeek[dt.weekday - 1];
  let month = monthsofYear[dt.month - 1];
  let day = dt.day;

  return `${dayOfWeek}, ${month} ${day}`;
}

//current time and date

let today = DateTime.now();
let userTimeZone = today.zoneName;

let currentDate = document.querySelector(".date");
currentDate.innerHTML = `${calculatedDate(today, userTimeZone)}`;

let currentTime = document.querySelector("#current-time");
currentTime.innerHTML = `${calculatedTime(today, userTimeZone)}`;

//change units (temp, wind speed) from imperial to metric with the metric switch at top right

function changeTemp() {
  let temperatureDisplay = document.querySelectorAll(".temperature");
  let displayUnit = document.querySelectorAll(".temp-unit");
  let tempArray = Array.from(temperatureDisplay);

  tempArray.forEach(function (temp, index) {
    temp = tempArray[index].innerText;
    if (unitSwitcher.checked) {
      let convertedTemp = Math.round((temp - 32) / 1.8);
      temperatureDisplay[index].innerHTML = `${convertedTemp}`;
      displayUnit[index].innerHTML = "°C";
    } else {
      let convertedTemp = Math.round(temp * 1.8 + 32);
      temperatureDisplay[index].innerHTML = `${convertedTemp}`;
      displayUnit[index].innerHTML = "°F";
    }
  });
}

function changeWindSpeed() {
  let windSpeedDisplay = document.querySelector(".wind-speed");
  let mph = windSpeed;
  let kmph = mph * 1.609344;
  if (unitSwitcher.checked) {
    windSpeedDisplay.innerHTML = `${Math.round(kmph)} km/h`;
  } else {
    windSpeedDisplay.innerHTML = `${Math.round(mph)} mph`;
  }
}

//the trigger code for hitting the metric switch

function changeUnit() {
  changeTemp();
  changeWindSpeed();
}

let unitSwitcher = document.querySelector(".unit-switcher");
unitSwitcher.addEventListener("change", changeTemp);

//convert UV Index value from number to description

function uvIndexValue(uvi) {
  if (uvi <= 2) {
    return "Low";
  } else if (3 <= uvi <= 5) {
    return "Moderate";
  } else if (6 <= uvi <= 7) {
    return "High";
  } else {
    return "Very High";
  }
}

//convert moon phase value from number to description

function getMoonPhase(mpValue) {
  if (mpValue === 0 || mpValue === 1) {
    return "New Moon";
  } else if (0 < mpValue < 0.25) {
    return "Waxing Crescent";
  } else if (mpValue === 0.25) {
    return "First Quarter";
  } else if (0.25 < mpValue < 0.5) {
    return "Waxing Gibous";
  } else if (mpValue === 0.5) {
    return "Full Moon";
  } else if (0.5 < mpValue < 0.75) {
    return "Waning Gibous";
  } else if (mpValue === 0.75) {
    return "Last Quarter";
  } else {
    return "Waning Crescent";
  }
}

//get the sunrise and sunset time from One Call API and return a normal time format

function sunTime(timestamp, timezone) {
  let sunTimeVanilla = DateTime.fromSeconds(timestamp).setZone(timezone);

  let sunHour = hourConversion(sunTimeVanilla.hour);

  let sunMinute = sunTimeVanilla.minute;
  if (sunMinute < 10) {
    sunMinute = `0${sunMinute}`;
  }
  let sunTimeConverted = `${sunHour}:${sunMinute}`;
  return sunTimeConverted;
}

//math and innerHTML transforms from One Call API

function getForecast(response) {
  let precipitation = Math.round(response.data.daily[0].pop * 100);
  let precipField = document.querySelector(".precip-percent");
  precipField.innerHTML = `${precipitation}`;

  let uvIndex = Math.round(response.data.current.uvi);
  let uviField = document.querySelector(".uv-index");
  uviField.innerHTML = `${uvIndexValue(uvIndex)}`;

  let localTimeZone = response.data.timezone;
  let localTimeField = document.querySelector("#local-time");
  localTimeField.innerHTML = `${calculatedTime(today, localTimeZone)}`;

  let sunriseTime = response.data.current.sunrise;
  let sunriseField = document.querySelector(".sunrise");
  sunriseField.innerHTML = `${sunTime(sunriseTime, localTimeZone)}`;

  let sunsetTime = response.data.current.sunset;
  let sunsetField = document.querySelector(".sunset");
  sunsetField.innerHTML = `${sunTime(sunsetTime, localTimeZone)}`;

  let nightTemp = Math.round(response.data.daily[0].temp.night);
  let tonightDisplay = document.querySelector(".tonight-temp");
  tonightDisplay.innerHTML = `${nightTemp}`;

  let moonPhase = response.data.daily[0].moon_phase;
  let moonDisplay = document.querySelector(".moon-phase");
  moonDisplay.innerHTML = `${getMoonPhase(moonPhase)}`;
}

//call One Call API from coordinates given by Current Weather API

function getMore(coordinates) {
  let cityLat = coordinates.lat;
  let cityLon = coordinates.lon;
  let coordApiKey = "2169a2396100786663a70310dd79fcc1";
  let coordApi = `https://api.openweathermap.org/data/2.5/onecall?lat=${cityLat}&lon=${cityLon}&exclude=minutely,hourly,alerts&appid=${coordApiKey}&units=imperial`;
  axios.get(coordApi).then(getForecast);
}

//math and innerHTML transforms from Current Weather API

function showWeather(response) {
  mainTemperature = Math.round(response.data.main.temp);
  let currentTemperature = document.querySelector(".real-temp");
  currentTemperature.innerHTML = `${mainTemperature}`;

  let realFeel = Math.round(response.data.main.feels_like);
  let rfTemperature = document.querySelector(".real-feel-temp");
  rfTemperature.innerHTML = `${realFeel}`;

  let tempMin = Math.round(response.data.main.temp_min);
  let todayLow = document.querySelector(".temp-low");
  todayLow.innerHTML = `${tempMin}`;

  let tempMax = Math.round(response.data.main.temp_max);
  let todayHigh = document.querySelector(".temp-high");
  todayHigh.innerHTML = `${tempMax}`;

  windSpeed = Math.round(response.data.wind.speed);
  let windSpeedDisplay = document.querySelector(".wind-speed");
  windSpeedDisplay.innerHTML = `${windSpeed} mph`;

  let humidity = Math.round(response.data.main.humidity);
  let humidityField = document.querySelector(".humidity");
  humidityField.innerHTML = `${humidity}`;

  getMore(response.data.coord);
}

//update city name from geolocator feature

function locateCityName(response) {
  let cityName = response.data.name;
  let cityField = document.querySelector("h1");
  cityField.innerHTML = `${cityName}`;
  showWeather(response);
}

//find where user is and call weather data based on coordinates

function handlePosition(position) {
  let positionLat = position.coords.latitude.toFixed(2);
  let positionLon = position.coords.longitude.toFixed(2);
  let apiLocationKey = "7e66edd0a4a9f61d32c3d08912327042";
  let apiLocation = `https://api.openweathermap.org/data/2.5/weather?lat=${positionLat}&lon=${positionLon}&appid=${apiLocationKey}&units=imperial`;
  axios.get(apiLocation).then(locateCityName);
}

//what happens if you click the geolocation button

function searchLocation(event) {
  event.preventDefault();
  navigator.geolocation.getCurrentPosition(handlePosition);
}

let geoButton = document.querySelector(".locator-field");
geoButton.addEventListener("click", searchLocation);

//just your basic get weather from whatever city you searched

function getWeather(searchedCity) {
  let cityName = searchedCity;
  let apiKey = "7e66edd0a4a9f61d32c3d08912327042";
  let apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=imperial`;
  axios.get(apiUrl).then(showWeather);
}

//what happens if you search for a city

function searchCity(event) {
  event.preventDefault();
  let searchInput = document.querySelector(".search-bar").value;
  searchInput = searchInput.toLowerCase().trim();

  let cityDisplay = document.querySelector("h1");
  cityDisplay.innerHTML = `${searchInput}`;

  getWeather(searchInput);
  searchButton.reset();
}

let searchButton = document.querySelector(".search-field");
searchButton.addEventListener("submit", searchCity);
