// /**
//  * Main API handler to fetch data from a Zoho CRM module.
//  */
// import db from "@/db";
// import { NextResponse } from "next/server";

// export async function GET(req) {
//   try {
//     const { data: tokensArr, error } = await db
//       .from("zoho_token")
//       .select("*")
//       .order("id", { ascending: true })
//       .limit(1);

//     if (error) {
//       console.error("DB fetch error:", error);
//       return NextResponse.json({ error: "DB fetch error" }, { status: 500 });
//     }

//     const tokens = tokensArr?.[0];
//     console.log("Tokens:", tokens);
//     if (!tokens) {
//       return NextResponse.json(
//         { error: "No tokens found in the database" },
//         { status: 404 }
//       );
//     }

//     const accessToken = tokens.access_token;
//     const moduleName = "Job"; // Replace with your module name

//     // Fetch the first page of data
//     const response = await fetch(
//       `https://www.zohoapis.com/crm/v2/${moduleName}?page=1&per_page=200`,
//       {
//         headers: {
//           Authorization: `Zoho-oauthtoken ${accessToken}`,
//         },
//       }
//     );

//     if (!response.ok) {
//       const errorData = await response.json();
//       if (
//         errorData.code === "INVALID_TOKEN" ||
//         errorData.code === "AUTHENTICATION_FAILURE"
//       ) {
//         console.log("Access token expired, refreshing...");
//         const newAccessToken = await refreshZohoToken(tokens.refresh_token);
//         if (!newAccessToken) {
//           return NextResponse.json(
//             { error: "Could not refresh access token" },
//             { status: 401 }
//           );
//         }
//         // Retry fetching the first page with the refreshed token
//         const retryResponse = await fetch(
//           `https://www.zohoapis.com/crm/v2/${moduleName}?page=1&per_page=200`,
//           {
//             headers: {
//               Authorization: `Zoho-oauthtoken ${newAccessToken}`,
//             },
//           }
//         );
//         if (!retryResponse.ok) {
//           const retryError = await retryResponse.json();
//           return NextResponse.json(
//             { error: retryError.message || "Failed to fetch data" },
//             { status: 500 }
//           );
//         }
//         const retryData = await retryResponse.json();
//         return NextResponse.json(retryData, { status: 200 });
//       }

//       console.error("Error fetching module data:", errorData);
//       return NextResponse.json(
//         { error: errorData.message || "Failed to fetch data" },
//         { status: 500 }
//       );
//     }

//     // Parse and return the first page of data
//     const data = await response.json();
//     console.log("Fetched first page data:", data);
//     return NextResponse.json(data, { status: 200 });
//   } catch (err) {
//     console.error("Unexpected error:", err);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }

// /**
//  * Refresh the Zoho access token using the refresh token.
//  * @param {string} refreshToken - The refresh token for Zoho OAuth.
//  * @returns {string|null} The new access token, or null if refreshing failed.
//  */
// async function refreshZohoToken(refreshToken) {
//   try {
//     const { ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET } = process.env;
//     const response = await fetch("https://accounts.zoho.com/oauth/v2/token", {
//       method: "POST",
//       headers: { "Content-Type": "application/x-www-form-urlencoded" },
//       body: new URLSearchParams({
//         grant_type: "refresh_token",
//         client_id: ZOHO_CLIENT_ID,
//         client_secret: ZOHO_CLIENT_SECRET,
//         refresh_token: refreshToken,
//       }),
//     });

//     if (!response.ok) {
//       console.error("Error refreshing token:", await response.text());
//       return null;
//     }

//     const data = await response.json();

//     if (data.error) {
//       console.error("Error in token refresh response:", data.error);
//       return null;
//     }

//     const newAccessToken = data.access_token;
//     const newRefreshToken = data.refresh_token || refreshToken;

//     // Update the new tokens in the database
//     const { error } = await db
//       .from("zoho_token")
//       .update({
//         access_token: newAccessToken,
//         refresh_token: newRefreshToken,
//         updated_at: new Date().toISOString(),
//       })
//       .eq("id", 1); // Replace `1` with your actual token ID logic if necessary

//     if (error) {
//       console.error("Error updating tokens in DB:", error);
//       return null;
//     }

//     return newAccessToken;
//   } catch (err) {
//     console.error("Error refreshing Zoho token:", err);
//     return null;
//   }
// }

// /**
//  * Fetch with retry mechanism for transient network issues.
//  * @param {string} url - The URL to fetch.
//  * @param {object} options - Fetch options including headers.
//  * @param {number} retries - Number of retries in case of failure.
//  */
// async function fetchWithRetry(url, options, retries = 3) {
//   for (let i = 0; i < retries; i++) {
//     try {
//       const response = await fetch(url, options);
//       if (response.ok) return response;
//       const errorData = await response.json();
//       console.error("Error fetching data:", errorData);
//     } catch (error) {
//       console.error("Network error:", error);
//       if (i === retries - 1) throw error;
//     }
//     await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay before retry
//   }
//   throw new Error("Failed after retries");
// }

/**
 * Main API handler to fetch data from a Zoho CRM module using COQL.
 */
import db from "@/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { data: tokensArr, error } = await db
      .from("zoho_token")
      .select("*")
      .order("id", { ascending: true })
      .limit(1);

    if (error) {
      console.error("DB fetch error:", error);
      return NextResponse.json({ error: "DB fetch error" }, { status: 500 });
    }

    const tokens = tokensArr?.[0];
    console.log("Tokens:", tokens);
    if (!tokens) {
      return NextResponse.json(
        { error: "No tokens found in the database" },
        { status: 404 }
      );
    }

    const searchableFields = ["Name", "Employer", "NOC_Code"];

    let accessToken = tokens.access_token;
    const conditions = searchableFields
      .map((field) => `${field} = '${"developer"}'`)
      .join(" OR ");

    // Define your COQL query
    const coqlQuery = `
    SELECT id, Name, Employer, NOC_Code
FROM Job
WHERE Name = 'developer' OR NOC_Code = 'Developer'
LIMIT 200
  `;

    // Fetch data using COQL
    const response = await fetch("https://www.zohoapis.com/crm/v2/coql", {
      method: "POST",
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ select_query: coqlQuery }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (
        errorData.code === "INVALID_TOKEN" ||
        errorData.code === "AUTHENTICATION_FAILURE"
      ) {
        console.log("Access token expired, refreshing...");
        const newAccessToken = await refreshZohoToken(tokens.refresh_token);
        if (!newAccessToken) {
          return NextResponse.json(
            { error: "Could not refresh access token" },
            { status: 401 }
          );
        }

        // Retry with the new access token
        const retryResponse = await fetch(
          "https://www.zohoapis.com/crm/v2/coql",
          {
            method: "POST",
            headers: {
              Authorization: `Zoho-oauthtoken ${newAccessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ select_query: coqlQuery }),
          }
        );
        if (!retryResponse.ok) {
          const retryError = await retryResponse.json();
          return NextResponse.json(
            { error: retryError.message || "Failed to fetch data" },
            { status: 500 }
          );
        }
        const retryData = await retryResponse.json();
        return NextResponse.json(retryData, { status: 200 });
      }

      console.error("Error fetching module data:", errorData);
      return NextResponse.json(
        { error: errorData.message || "Failed to fetch data" },
        { status: 500 }
      );
    }

    // Parse and return the data
    const data = await response.json();
    console.log("Fetched data using COQL:", data);
    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * Refresh the Zoho access token using the refresh token.
 * @param {string} refreshToken - The refresh token for Zoho OAuth.
 * @returns {string|null} The new access token, or null if refreshing failed.
 */
async function refreshZohoToken(refreshToken) {
  try {
    const { ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET } = process.env;
    const response = await fetch("https://accounts.zoho.com/oauth/v2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: ZOHO_CLIENT_ID,
        client_secret: ZOHO_CLIENT_SECRET,
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      console.error("Error refreshing token:", await response.text());
      return null;
    }

    const data = await response.json();

    if (data.error) {
      console.error("Error in token refresh response:", data.error);
      return null;
    }

    const newAccessToken = data.access_token;
    const newRefreshToken = data.refresh_token || refreshToken;

    // Update the new tokens in the database
    const { error } = await db
      .from("zoho_token")
      .update({
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    if (error) {
      console.error("Error updating tokens in DB:", error);
      return null;
    }

    return newAccessToken;
  } catch (err) {
    console.error("Error refreshing Zoho token:", err);
    return null;
  }
}
