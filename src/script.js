//Get the dom inputs and stored as a variable
const serachButton = document.getElementById("search");
const cityInput = document.getElementById("cityInput");
const locationButton = document.getElementById("location");
const currentWeatherDiv = document.getElementById("currentWeather");
const weatherCardDiv = document.getElementById("weather-cards");
//API KEY for Openweather api provider
const API_KEY = "6960f7a3e834dc2df94fe4aadbe0217d";
//Create the forecast weather card
const createWeatherCard = (cityName,weatherItem,index) => {
    if(index === 0){
//current weather and image for corresponding weather display in separate block
        return ` <div class="p-5 bg-sky-700 text-white font-sans" id="information">
                        <h2 class="text-center text-black"><b><u>${cityName}</b></u>-<b><u>${weatherItem.dt_txt.split(" ")[0]}</b></u></h2>
                        <h4>🌡️Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                        <h4>💨Wind:${weatherItem.wind.speed}M/S</h4>
                        <h4">💧Humidity:${weatherItem.main.humidity}%</h4>
                    </div>
                    <div class="p-5 bg-sky-700 text-white" id="icon">
                        <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="Weather icon">
                        <h4>${weatherItem.weather[0].description}</h4>
                    </div>`;

    }else{
    //Forecasted weather display for five days
    return `<li class="font-sans justify-between p-4 bg-sky-700 text-white" id="card">
                            <h3 class="text-center text-black">(<b><u>${weatherItem.dt_txt.split(" ")[0]}</b></u>)</h3>
                            <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="Weather icon">
                            <h4>🌡️Temp:${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                            <h4>💨Wind:${weatherItem.wind.speed}M/S</h4>
                            <h4>💧Humidity: ${weatherItem.main.humidity}%</h4>
                        </li>`;
    }
}
//API Call to get weather detail for particular city
const getWeatherDetails = (cityName, lat, lon) => {
    //Weather API
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
//Promise to fetch the weather details 
    fetch(WEATHER_API_URL).then(res => res.json())
                          .then(data => {
                            const forecastDays = [];
                            //Filter the weather details for particular 5 days
                            const fiveDaysForecast = data.list.filter(forecast => {
                                const forecastDate = new Date(forecast.dt_txt).getDate();
                                if(!forecastDays.includes(forecastDate)){
                                    return forecastDays.push(forecastDate);
                                }
                            });
                            //Empty the value for next input
                            cityInput.value = "";
                            currentWeatherDiv.innerHTML = "";
                            weatherCardDiv.innerHTML = "";
                            //Display the Current weather and forecasted weather cards
                            fiveDaysForecast.forEach((weatherItem, index) => {
                                if(index === 0){
                                    currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName,weatherItem,index));

                                }else{
                                    weatherCardDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName,weatherItem,index));
                                }  
                            });
                            //Error dealing for weather forecast
                          }).catch(() => {
                            alert("Error occured while fetching the Weather Forecast!");
                        });
                    
}
//Get the starting input while clicking search button
function getCityInputs(city){
    let cityName = cityInput.value.trim(); 
    if(!cityName){
        //Get the input from dropdown cities
         let cityInput = city;
         cityName = cityInput;
    }
 //API to get latitude and longitude of the city  
const GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
//Promise to fetch the city details
fetch(GEOCODING_API_URL).then(res => res.json())            
                        .then(data => {
                            //Incorrect city values alert
                            if(!data.length){
                               return alert(`Enter the valid City Name`);
                            }
                            const {name, lat, lon} = data[0];
                            getWeatherDetails(name, lat, lon);
                        //Invoke the Dropdown menu function
                            updateRecentlySearchedCities(cityInput);
                        //Error alert while fetching the data
                        }).catch(() => {
                            alert("Error occured while fetching the data!");
                        });
                         
}
//Get the User location input while clicking Use Current location button
const getUserInputs = () => {
    //Navigate the geolocation of current position
    navigator.geolocation.getCurrentPosition( (position) => {
        const {latitude, longitude} = position.coords;
        const REVERSE_GEOCODING_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;
        fetch(REVERSE_GEOCODING_URL).then(res => res.json())            
                        .then(data => { 
                            const {name} = data[0];
                            getWeatherDetails(name,latitude,longitude);
    //Error alert while fetching the current location data
                        }).catch(() => {
                            alert("Error occured while fetching the city!");
                        });
    },
    error => {
        if(error.code === error.PERMISSION_DENIED){
            alert("geolocation request Denied.Please reset location permission to grand access again.");
        }
    }
);

}

//Event listener for input and current location input while clicking search and location button
locationButton.addEventListener("click",getUserInputs);
serachButton.addEventListener("click", getCityInputs);


// Function to update the list of recently searched cities
function updateRecentlySearchedCities(cityInput) {
    const cityName = cityInput.value;
    let cities = JSON.parse(localStorage.getItem('recentCities')) || []; // Get recent cities from local storage
    if (!cities.includes(cityName)) {
        cities.push(cityName); // Add new city to the list
        localStorage.setItem('recentCities', JSON.stringify(cities)); // Save updated list to local storage
        updateCityDropdown(cities); // Update the city dropdown with the new list
    }
}

// Function to update the city dropdown with recent searches
function updateCityDropdown(cities) {
    const cityName = cityInput.value;
    const dropdown = document.getElementById('city-dropdown');
    if (!dropdown) {
        // Create a new dropdown if it doesn't exist
        const newheading = document.createElement('p');
        newheading.innerHTML = `<h2 class="text-xl font-extrabold text-start mt-4 text-white ">Recent Search</h2>`;
        const newDropdown = document.createElement('select');
        newDropdown.id = 'city-dropdown';
        newDropdown.classList.add('p-3', 'border', 'rounded-lg', 'bg-white', 'hover:white','hover:text-black','text-black','m-3', 'w-96','sm:w-60','smm:60');
        newDropdown.addEventListener('change', (event) => {
            const cityInput = event.target.value;
            if (cityInput) {
                getCityInputs(cityInput);// Fetch weather for selected city 
            }
        });
        document.getElementById('dropdown').appendChild(newheading); // Add the heading to the dropdown id
        document.getElementById('dropdown').appendChild(newDropdown); // Add the new dropdown to the dropdown id
    }
    const dropdownElement = document.getElementById('city-dropdown');
    dropdownElement.innerHTML = cities.map(city => `<option value="${city}">${city}</option>`).join(''); // Populate the dropdown with cities
}

// Load recently searched cities on page load
document.addEventListener('DOMContentLoaded', () => {
    const cities = JSON.parse(localStorage.getItem('recentCities')) || [];
    if (cities.length > 0) {
        updateCityDropdown(cities); // Update the city dropdown if there are recent searches
    }
});