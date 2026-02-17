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
 * Implements a robust fallback chain:
 * 1. ipwho.is (Primary - Rich data)
 * 2. ipapi.co (Fallback 1 - Rich data, HTTPS)
 * 3. ip-api.com (Fallback 2 - Rich data, HTTP/HTTPS mixed)
 * 4. ipify.org (Last resort - IP only)
 */
export async function getVisitorInfo(): Promise<VisitorInfo | null> {
  // Provider 1: ipwho.is
  try {
    const response = await fetch('https://ipwho.is/');
    if (!response.ok) {
      console.warn(`Warning: ipwho.is failed with status ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.warn(`Response body: ${text}`);
      throw new Error(`ipwho.is failed: ${response.status}`);
    }
    const data = await response.json();
    if (!data.success && data.message) {
      console.warn(`Warning: ipwho.is returned success:false - ${data.message}`);
      throw new Error(`ipwho.is API error: ${data.message}`);
    }

    console.log('Visitor info fetched successfully from ipwho.is');
    return {
      ip: data.ip,
      location: {
        country: data.country,
        region: data.region,
        city: data.city,
        timezone: data.timezone?.id || data.timezone, // specific to ipwho.is structure
        latitude: data.latitude,
        longitude: data.longitude,
      },
    };
  } catch (error) {
    console.warn('Primary provider (ipwho.is) failed, trying fallback 1 (ipapi.co)...', error);
  }

  // Provider 2: ipapi.co
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) {
      console.warn(`Warning: ipapi.co failed with status ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.warn(`Response body: ${text}`);
      throw new Error(`ipapi.co failed: ${response.status}`);
    }
    const data = await response.json();
    if (data.error) {
      console.warn(`Warning: ipapi.co returned error - ${data.reason}`);
      throw new Error(`ipapi.co API error: ${data.reason}`);
    }

    console.log('Visitor info fetched successfully from ipapi.co');
    return {
      ip: data.ip,
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
    console.warn('Fallback 1 (ipapi.co) failed, trying fallback 2 (ip-api.com)...', error);
  }

  // Provider 3: ip-api.com
  // Note: Free tier is HTTP only usually, but some endpoints might work. 
  // We use the protocol-relative URL or HTTP explicitly if needed, but fetch usually upgrades to HTTPS if the page is HTTPS.
  // ip-api.com often blocks AWS/Cloud hosting, so it might fail in production but work locally.
  try {
    const response = await fetch('http://ip-api.com/json/?fields=status,message,country,regionName,city,lat,lon,timezone,query');
    if (!response.ok) {
      console.warn(`Warning: ip-api.com failed with status ${response.status} ${response.statusText}`);
      throw new Error(`ip-api.com failed: ${response.status}`);
    }
    const data = await response.json();
    if (data.status === 'fail') {
      console.warn(`Warning: ip-api.com returned fail - ${data.message}`);
      throw new Error(`ip-api.com API error: ${data.message}`);
    }

    console.log('Visitor info fetched successfully from ip-api.com');
    return {
      ip: data.query, // ip-api returns IP in 'query' field
      location: {
        country: data.country,
        region: data.regionName,
        city: data.city,
        timezone: data.timezone,
        latitude: data.lat,
        longitude: data.lon,
      },
    };
  } catch (error) {
    console.warn('Fallback 2 (ip-api.com) failed, trying final fallback (ipify)...', error);
  }

  // Final Fallback: ipify (IP only)
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    if (!response.ok) throw new Error('ipify failed');
    const data = await response.json();

    console.log('Visitor IP fetched from ipify (no location data)');
    return {
      ip: data.ip || 'unknown',
      location: {},
    };
  } catch (error) {
    console.error('All IP fetch providers failed.', error);
    return null;
  }
}
