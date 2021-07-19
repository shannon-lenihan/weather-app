//some variables for use throughout

let measurementUnit = "imperial";
var DateTime = luxon.DateTime;
let mainTemperature = null;
let windSpeed = null;

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
  "September",
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
      let convertedTemp = (temp - 32) / 1.8;
      temperatureDisplay[index].innerHTML = `${Math.round(convertedTemp)}`;
      displayUnit[index].innerHTML = "°C";
    } else {
      let convertedTemp = temp * 1.8 + 32;
      temperatureDisplay[index].innerHTML = `${Math.round(convertedTemp)}`;
      displayUnit[index].innerHTML = "°F";
    }
  });
}

function changeWindSpeed() {
  let windSpeedField = document.querySelector(".wind-speed");
  let windSpeedUnit = document.querySelector(".wind-unit");
  let windSpeedText = windSpeedField.innerText;

  if (unitSwitcher.checked) {
    let metersPerSec = windSpeedText * 1.609;
    windSpeedField.innerHTML = `${Math.round(metersPerSec)}`;
    windSpeedUnit.innerHTML = ` km/h`;
  } else {
    let mph = windSpeedText / 1.609;
    windSpeedField.innerHTML = `${Math.round(mph)}`;
    windSpeedUnit.innerHTML = ` mph`;
  }
}

//the trigger code for hitting the metric switch

function changeUnit() {
  if (unitSwitcher.checked) {
    measurementUnit = "metric";
  } else {
    measurementUnit = "imperial";
  }

  changeTemp();
  changeWindSpeed();
}

let unitSwitcher = document.querySelector(".unit-switcher");
unitSwitcher.addEventListener("change", changeUnit);

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
  let ampm = sunTimeVanilla.hour >= 12 ? "PM" : "AM";

  let sunHour = hourConversion(sunTimeVanilla.hour);

  let sunMinute = sunTimeVanilla.minute;
  if (sunMinute < 10) {
    sunMinute = `0${sunMinute}`;
  }
  let sunTimeConverted = `${sunHour}:${sunMinute} ${ampm}`;
  return sunTimeConverted;
}

//math and innerHTML transforms from One Call API

function getForecast(response) {
  let precipitation = response.data.daily[0].pop * 100;
  let precipField = document.querySelector(".precip-percent");
  precipField.innerHTML = `${Math.round(precipitation)}`;

  let uvIndex = response.data.current.uvi;
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

  let nightTemp = response.data.daily[0].temp.night;
  let tonightDisplay = document.querySelector(".tonight-temp");
  tonightDisplay.innerHTML = `${Math.round(nightTemp)}`;

  let moonPhase = response.data.daily[0].moon_phase;
  let moonDisplay = document.querySelector(".moon-phase");
  moonDisplay.innerHTML = `${getMoonPhase(moonPhase)}`;
}

//call One Call API from coordinates given by Current Weather API

function getMore(coordinates) {
  let cityLat = coordinates.lat;
  let cityLon = coordinates.lon;
  let coordApiKey = "2169a2396100786663a70310dd79fcc1";
  let coordApi = `https://api.openweathermap.org/data/2.5/onecall?lat=${cityLat}&lon=${cityLon}&exclude=minutely,hourly,alerts&appid=${coordApiKey}&units=${measurementUnit}`;
  axios.get(coordApi).then(getForecast);
}

//translate the weather condition info from the API to Bootstrap icons

function iconChange(code, main) {
  if (main === "Thunderstorm") {
    return "bi bi-cloud-lightning-rain";
  }

  if (main === "Drizzle") {
    return "bi bi-cloud-drizzle";
  }

  if (main === "Rain") {
    if (500 <= code <= 501) {
      return "bi bi-cloud-rain";
    } else if (code === 511) {
      return "bi bi-cloud-hail";
    } else {
      return "bi bi-cloud-rain-heavy";
    }
  }

  if (main === "Snow") {
    if (611 <= code <= 616) {
      return "bi bi-cloud-sleet";
    } else if (600 <= code <= 602) {
      return "bi bi-cloud-snow";
    } else {
      return "bi bi-snow";
    }
  }

  if (main === "Tornado") {
    return "bi bi-tornado";
  }

  if (main === "Clear" && code === 800) {
    return "bi bi-brightness-high";
  }

  if (main === "Clouds") {
    if (code === 801) {
      return "bi bi-cloud-sun";
    } else if (code === 802) {
      return "bi bi-cloudy";
    } else {
      return "bi bi-clouds";
    }
  }

  if (701 <= code <= 771) {
    return "bi bi-cloud-haze";
  }
}

//math and innerHTML transforms from Current Weather API

function showWeather(response) {
  mainTemperature = response.data.main.temp;
  let currentTemperature = document.querySelector(".real-temp");
  currentTemperature.innerHTML = `${Math.round(mainTemperature)}`;

  let realFeel = response.data.main.feels_like;
  let rfTemperature = document.querySelector(".real-feel-temp");
  rfTemperature.innerHTML = `${Math.round(realFeel)}`;

  let tempMin = response.data.main.temp_min;
  let todayLow = document.querySelector(".temp-low");
  todayLow.innerHTML = `${Math.round(tempMin)}`;

  let tempMax = response.data.main.temp_max;
  let todayHigh = document.querySelector(".temp-high");
  todayHigh.innerHTML = `${Math.round(tempMax)}`;

  windSpeed = response.data.wind.speed;
  if (measurementUnit === "metric") {
    windSpeed = windSpeed * 3.6;
  }
  let windSpeedDisplay = document.querySelector(".wind-speed");
  windSpeedDisplay.innerHTML = `${Math.round(windSpeed)}`;

  let humidity = response.data.main.humidity;
  let humidityField = document.querySelector(".humidity");
  humidityField.innerHTML = `${Math.round(humidity)}`;

  let descriptionElement = response.data.weather[0].description;
  let descriptionField = document.querySelector(".current-description");
  descriptionField.innerHTML = `${descriptionElement}`;

  let iconCode = response.data.weather[0].id;
  let iconMain = response.data.weather[0].main;
  let iconElement = document.querySelector(".current-img");
  iconElement.setAttribute(
    "class",
    `${iconChange(iconCode, iconMain)} current-img`
  );

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
  let apiLocation = `https://api.openweathermap.org/data/2.5/weather?lat=${positionLat}&lon=${positionLon}&appid=${apiLocationKey}&units=${measurementUnit}`;
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
  let apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=${measurementUnit}`;
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

getWeather("washington d.c.");
