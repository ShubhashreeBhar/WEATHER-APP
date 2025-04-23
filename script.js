// === CONFIGURATION ===
const apiKey = `9f7645323c621e977a39c1c2646fe724`;
const baseUrl = `https://api.openweathermap.org/data/2.5/`;
const defaultUnits = 'metric';

// === DOM SELECTORS ===
const $ = (selector) => document.querySelector(selector);

const dom = {
    cityInput: $('.city-input'),
    searchBtn: $('.search-btn'),
    weatherInfo: $('.weather-info'),
    notFound: $('.not-found'),
    searchCity: $('.search-city'),
    country: $('.country-txt'),
    temp: $('.temp-txt'),
    feel: $('.feel-txt'),
    max: $('.maxtemp-txt'),
    min: $('.mintemp-txt'),
    condition: $('.condition-txt'),
    humidity: $('.humidity-value-txt'),
    wind: $('.wind-value-txt'),
    summaryImg: $('.weather-summary-img'),
    currentDate: $('.current-date-txt'),
    forecastContainer: $('.forecast-items-container'),
};

// === EVENT LISTENERS ===
dom.searchBtn.addEventListener('click', handleSearch);
dom.cityInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSearch();
});

// === MAIN FUNCTIONS ===
function handleSearch() {
    const city = dom.cityInput.value.trim();
    if (city) {
        updateWeatherInfo(city);
        dom.cityInput.value = '';
        dom.cityInput.blur();
    }
}

async function updateWeatherInfo(city) {
    const data = await fetchWeather('weather', city);
    if (data.cod !== 200) return showOnlySection(dom.notFound);

    const {
        name,
        main: { temp, feels_like, temp_max, temp_min, humidity },
        weather: [{ id, main }],
        wind: { speed },
    } = data;

    updateText(dom.country, name);
    updateText(dom.temp, `${Math.round(temp)} °C`);
    updateText(dom.feel, `${Math.round(feels_like)} °C`);
    updateText(dom.max, `${Math.round(temp_max)} °C`);
    updateText(dom.min, `${Math.round(temp_min)} °C`);
    updateText(dom.condition, main);
    updateText(dom.humidity, `${humidity}%`);
    updateText(dom.wind, `${speed} M/s`);
    updateText(dom.currentDate, getCurrentDate());
    dom.summaryImg.src = getWeatherIcon(id);

    await updateForecast(city);
    showOnlySection(dom.weatherInfo);
}

async function updateForecast(city) {
    const data = await fetchWeather('forecast', city);
    const timeFilter = '12:00:00';
    const today = new Date().toISOString().split('T')[0];

    dom.forecastContainer.innerHTML = '';

    data.list.forEach(item => {
        if (item.dt_txt.includes(timeFilter) && !item.dt_txt.includes(today)) {
            dom.forecastContainer.insertAdjacentHTML('beforeend', createForecastHTML(item));
        }
    });
}

// === UTILITIES ===
function updateText(element, value) {
    element.textContent = value;
}

function showOnlySection(activeSection) {
    [dom.weatherInfo, dom.searchCity, dom.notFound].forEach(section => {
        section.style.display = 'none';
    });
    activeSection.style.display = 'flex';
}

function getCurrentDate() {
    const options = { weekday: 'short', day: '2-digit', month: 'short' };
    return new Date().toLocaleDateString('en-GB', options);
}

function getWeatherIcon(id) {
    if (id <= 232) return 'thundrstorm.png';
    if (id <= 531) return 'rain.png';
    if (id <= 622) return 'snow.png';
    if (id <= 781) return 'haze.png';
    if (id === 800) return 'sun.png';
    return 'cloud.png';
}

async function fetchWeather(endpoint, city) {
    const url = `${baseUrl}${endpoint}?q=${city}&appid=${apiKey}&units=${defaultUnits}`;
    const res = await fetch(url);
    return res.json();
}

function createForecastHTML({ dt_txt, weather: [{ id }], main: { temp } }) {
    const date = new Date(dt_txt).toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
    });

    return `
        <div class="forecast-item">
            <h5 class="forecast-item-date regular-txt">${date}</h5>
            <img src="${getWeatherIcon(id)}" class="forecast-item-img" />
            <h5 class="forecast-item-temp">${Math.round(temp)} °C</h5>
        </div>
    `;
}
