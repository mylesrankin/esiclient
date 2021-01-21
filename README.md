# esiclient
esiclient is a client for making easy API requests (both public and secure) to EVE Online's OpenAPI (ESI).

The client has built in rate limiting and error handling, using the headers CCP return in each call. It can also handle refreshing access tokens when they expire.

## Using the client

First run ```npm install esiclient```

### Initiate the client
Get these from EVE Online developer application and manually run the oauth2 flow. A good guide to do this can be found here: https://developers.eveonline.com/blog/article/sso-to-authenticated-calls
```
const ESIClient = require("esiclient")
// No auth
const esiClient = new ESIClient("https://esi.evetech.net/latest", {})

// Auth
const credentials = {
          "access_token": "xxxxxxx",
          "refresh_token": "xxxxxxxx",
          "clientId": "xxxxxxxx",
          "clientSecret": "xxxxxxxx"
      }
const esiClient = new ESIClient("https://esi.evetech.net/latest", { credentials })
```

### Make requests
```
// Public routes
const result = await esiClient.request("/status/", "GET", {})

// Secure route with url override for /oauth/verify (auth required)
const result = await esiClient.request(
                "/oauth/verify",
                "GET",
                { useAuth: true, urlOverride: "https://login.eveonline.com" }
            )
            
// Secure route (auth required)
const result = await esiClient.request(
                "/characters/927451403/",
                "GET",
                { useAuth: true }
            )
```

### Alternative requests method
Works for .get, .post, .update and .delete
```
const result = await esiclient.get("/route/to/public", {})
const result = await esiclient.get("/route/to/private", { credentials })
```

### Options
The client supports options as a last parameter for both initialising the client and making requests

The client:
- baseUrl is required - example: "https://esi.evetech.net/latest"
- credentials and proxy are optional.
```
const esiClient = new ESIClient(baseUrl, { credentials, proxy})
```

Requests
- Route is required - example: "/status/"
- method is required for .request function, not for .get .update .delete and .post
- Optional: headers, useAuth, urlOverride
```
esiClient.request(route, method, { headers, useAuth, urlOverride })
```
