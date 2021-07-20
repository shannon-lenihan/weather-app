//some variables for use throughout

let measurementUnit = "imperial";
var DateTime = luxon.DateTime;
let mainTemperature = null;
let windSpeed = null;
let usedUnit = null;

let temperatures = [];

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

//toggle dark mode

function setColor() {
  if (colorSwitcher.checked) {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.setAttribute("data-theme", "light");
  }
}

let colorSwitcher = document.querySelector(".dark-switch");
colorSwitcher.addEventListener("change", setColor);

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

//translate the weather condition info from the API to Bootstrap icons

function iconChange(code, main) {
  if (main === "Thunderstorm") {
    return "bi-cloud-lightning-rain";
  }

  if (main === "Drizzle") {
    return "bi-cloud-drizzle";
  }

  if (main === "Rain") {
    if (500 <= code <= 501) {
      return "bi-cloud-rain";
    } else if (code === 511) {
      return "bi-cloud-hail";
    } else {
      return "bi-cloud-rain-heavy";
    }
  }

  if (main === "Snow") {
    if (611 <= code <= 616) {
      return "bi-cloud-sleet";
    } else if (600 <= code <= 602) {
      return "bi-cloud-snow";
    } else {
      return "bi-snow";
    }
  }

  if (main === "Tornado") {
    return "bi-tornado";
  }

  if (main === "Clear" && code === 800) {
    return "bi-brightness-high";
  }

  if (main === "Clouds") {
    if (code === 801) {
      return "bi-cloud-sun";
    } else if (code === 802) {
      return "bi-cloudy";
    } else {
      return "bi-clouds";
    }
  }

  if (701 <= code <= 771) {
    return "bi-cloud-haze";
  }
}

//change units (temps and wind speed) from imperial to metric with the metric switch at top right

function changeTemp() {
  let temperatureDisplay = document.querySelectorAll(".temperature");
  let displayUnit = document.querySelectorAll(".temp-unit");
  let tempArray = Array.from(temperatureDisplay);

  tempArray.forEach(function (temp, index) {
    temp = tempArray[index].innerText;
    if (measurementUnit === "metric" && usedUnit === "imperial") {
      let convertedTemp = (temperatures[index] - 32) / 1.8;
      temperatureDisplay[index].innerHTML = `${Math.round(convertedTemp)}`;
      displayUnit[index].innerHTML = "°C";
    } else if (measurementUnit === "imperial" && usedUnit === "metric") {
      let convertedTemp = temperatures[index] * 1.8 + 32;
      temperatureDisplay[index].innerHTML = `${Math.round(convertedTemp)}`;
      displayUnit[index].innerHTML = "°F";
    } else if (measurementUnit === usedUnit) {
      temperatureDisplay[index].innerHTML = `${Math.round(
        temperatures[index]
      )}`;
      if (measurementUnit === "imperial") {
        displayUnit[index].innerHTML = "°F";
      } else {
        displayUnit[index].innerHTML = "°C";
      }
    }
  });
}

function changeWindSpeed() {
  let windSpeedField = document.querySelector(".wind-speed");
  let windSpeedUnit = document.querySelector(".wind-unit");

  if (measurementUnit === "metric" && usedUnit === "imperial") {
    let metersPerSec = windSpeed * 1.609;
    windSpeedField.innerHTML = `${Math.round(metersPerSec)}`;
    windSpeedUnit.innerHTML = ` km/h`;
  } else if (measurementUnit === "imperial" && usedUnit === "metric") {
    let mph = windSpeed / 1.609;
    windSpeedField.innerHTML = `${Math.round(mph)}`;
    windSpeedUnit.innerHTML = ` mph`;
  } else if (measurementUnit === usedUnit) {
    windSpeedField.innerHTML = `${Math.round(windSpeed)}`;
    if (measurementUnit === "imperial") {
      windSpeedUnit.innerHTML = ` mph`;
    } else {
      windSpeedUnit.innerHTML = ` km/h`;
    }
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

//generate five-day forecast from OneCall API data

function formatForecastDay(timestamp) {
  let forecastDay = DateTime.fromSeconds(timestamp);
  console.log(forecastDay);
  let day = daysOfWeek[forecastDay.weekday - 1];

  return day;
}

function displayForecast(response) {
  let forecastElement = document.querySelector(".fiveday-forecast");

  let forecastHTML = "";

  let days = ["Thursday", "Friday", "Saturday", "Sunday", "Monday"];

  response.forEach(function (forecastDay, index) {
    if (index !== 0 && index < 6) {
      forecastHTML =
        forecastHTML +
        `              
      <div class="col tomorrow-forecast">
        <div class="forecast-day">
          <div class="">${formatForecastDay(forecastDay.dt)}</div>
          <div class="forecast-img"><i class = ${iconChange(
            forecastDay.weather[0].id,
            forecastDay.weather[0].main
          )}></i></div>
          <div class="row gx-0">
            <div class="col">
              <span class="forecast-high temperature">${Math.round(
                forecastDay.temp.max
              )}</span
              ><span class="temp-unit">°F</span>
            </div>
            <div class="col">
              <span class="forecast-low temperature">${Math.round(
                forecastDay.temp.min
              )}</span
              ><span class="temp-unit">°F</span>
            </div>
          </div>
          <div class="">
            <span class="forecast-precip-img"
              ><i class="bi bi-droplet-fill"></i></span
            ><span class="forecast-precip"> ${Math.round(
              forecastDay.pop * 100
            )}%</span>
          </div>
        </div>
      </div>`;
      temperatures.push(forecastDay.temp.max, forecastDay.temp.min);
    }
  });

  forecastElement.innerHTML = forecastHTML;
}

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

function getMoreWeather(response) {
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
  temperatures.push(nightTemp);
  let tonightDisplay = document.querySelector(".tonight-temp");
  tonightDisplay.innerHTML = `${Math.round(nightTemp)}`;

  let moonPhase = response.data.daily[0].moon_phase;
  let moonDisplay = document.querySelector(".moon-phase");
  moonDisplay.innerHTML = `${getMoonPhase(moonPhase)}`;

  displayForecast(response.data.daily);
}

//call One Call API from coordinates given by Current Weather API

function oneWeatherMore(coordinates) {
  let cityLat = coordinates.lat;
  let cityLon = coordinates.lon;
  let coordApiKey = "2169a2396100786663a70310dd79fcc1";
  let coordApi = `https://api.openweathermap.org/data/2.5/onecall?lat=${cityLat}&lon=${cityLon}&exclude=minutely,hourly,alerts&appid=${coordApiKey}&units=${measurementUnit}`;
  axios.get(coordApi).then(getMoreWeather);
}

//math and innerHTML transforms from Current Weather API

function showWeather(response) {
  temperatures = [];

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
    `bi ${iconChange(iconCode, iconMain)} current-img`
  );

  temperatures.push(mainTemperature, realFeel, tempMin, tempMax);

  oneWeatherMore(response.data.coord);
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
  usedUnit = `${measurementUnit}`;
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
  usedUnit = `${measurementUnit}`;
  console.log(usedUnit);
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

debugger;
