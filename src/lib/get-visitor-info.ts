export interface VisitorInfo {
  ip: string;
  location: {
    country?: string;
    region?: string;
    city?: string;
    timezone?: string;
    latitude?: number;
    longitude?: number;
  };
}

/**
 * Fetches the visitor's IP address and location information
 * Uses ipapi.co free tier (up to 1000 requests/day)
 */
export async function getVisitorInfo(): Promise<VisitorInfo | null> {
  try {
    // Try to get IP and location from ipapi.co
    const response = await fetch('https://ipapi.co/json/');
    
    if (!response.ok) {
      throw new Error('Failed to fetch IP info');
    }
    
    const data = await response.json();
    
    return {
      ip: data.ip || 'unknown',
      location: {
        country: data.country_name,
        region: data.region,
        city: data.city,
        timezone: data.timezone,
        latitude: data.latitude,
        longitude: data.longitude,
      },
    };
  } catch (error) {
    console.error('Error fetching visitor info:', error);
    
    // Fallback: Try to get just the IP from a simpler API
    try {
      const fallbackResponse = await fetch('https://api.ipify.org?format=json');
      const fallbackData = await fallbackResponse.json();
      
      return {
        ip: fallbackData.ip || 'unknown',
        location: {},
      };
    } catch (fallbackError) {
      console.error('Fallback IP fetch also failed:', fallbackError);
      return null;
    }
  }
}
