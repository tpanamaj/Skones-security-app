import axios from 'axios';
import { z } from 'zod';

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  location: string;
}

interface TrafficData {
  status: 'clear' | 'slow' | 'congested';
  estimatedDelay: number;
  route: string;
}

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  accuracy: number;
}

class ExternalAPIService {
  private static instance: ExternalAPIService;
  private weatherApiKey = process.env.WEATHER_API_KEY;
  private googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
  private geolocationApiKey = process.env.GEOLOCATION_API_KEY;

  private constructor() {}

  static getInstance(): ExternalAPIService {
    if (!ExternalAPIService.instance) {
      ExternalAPIService.instance = new ExternalAPIService();
    }
    return ExternalAPIService.instance;
  }

  // Weather Integration
  async getWeatherData(latitude: number, longitude: number): Promise<WeatherData> {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${this.weatherApiKey}&units=metric`
      );

      const data = response.data;
      return {
        temperature: data.main.temp,
        condition: data.weather[0].main,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        location: data.name,
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  }

  // Traffic Integration
  async getTrafficData(origin: string, destination: string): Promise<TrafficData> {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${this.googleMapsApiKey}`
      );

      const element = response.data.rows[0].elements[0];
      const durationInSeconds = element.duration.value;
      const durationInMinutes = Math.floor(durationInSeconds / 60);

      let status: 'clear' | 'slow' | 'congested' = 'clear';
      if (durationInMinutes > 30) status = 'congested';
      else if (durationInMinutes > 15) status = 'slow';

      return {
        status,
        estimatedDelay: durationInMinutes,
        route: `${origin} to ${destination}`,
      };
    } catch (error) {
      console.error('Error fetching traffic data:', error);
      throw error;
    }
  }

  // Geolocation Integration
  async getGeolocation(latitude: number, longitude: number): Promise<LocationData> {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${this.googleMapsApiKey}`
      );

      const result = response.data.results[0];
      return {
        latitude,
        longitude,
        address: result.formatted_address,
        accuracy: 1000, // Placeholder
      };
    } catch (error) {
      console.error('Error fetching geolocation data:', error);
      throw error;
    }
  }

  // Reverse Geolocation
  async reverseGeocode(address: string): Promise<LocationData> {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.googleMapsApiKey}`
      );

      const location = response.data.results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng,
        address,
        accuracy: 1000,
      };
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      throw error;
    }
  }

  // Distance Matrix
  async calculateDistance(origins: string[], destinations: string[]): Promise<any> {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins.join('|')}&destinations=${destinations.join('|')}&key=${this.googleMapsApiKey}`
      );

      return response.data;
    } catch (error) {
      console.error('Error calculating distance:', error);
      throw error;
    }
  }

  // SMS Integration (Twilio)
  async sendSMSViaProvider(phoneNumber: string, message: string): Promise<void> {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_PHONE_NUMBER;

      const response = await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        `From=${fromNumber}&To=${phoneNumber}&Body=${encodeURIComponent(message)}`,
        {
          auth: {
            username: accountSid,
            password: authToken,
          },
        }
      );

      console.log('SMS sent successfully:', response.data);
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw error;
    }
  }

  // Email Integration (SendGrid)
  async sendEmailViaProvider(
    to: string,
    subject: string,
    html: string
  ): Promise<void> {
    try {
      const response = await axios.post(
        'https://api.sendgrid.com/v3/mail/send',
        {
          personalizations: [
            {
              to: [{ email: to }],
              subject,
            },
          ],
          from: {
            email: process.env.SENDGRID_FROM_EMAIL,
            name: 'Skones Security',
          },
          content: [
            {
              type: 'text/html',
              value: html,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
          },
        }
      );

      console.log('Email sent successfully:', response.status);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}

export default ExternalAPIService;
