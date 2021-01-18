const axios = require('axios')
const bunyan = require('bunyan');
const log = bunyan.createLogger({ name: "ESIClient" });

class ESIClient {
    constructor(esiBaseUrl, { credentials, proxy }) {
        this.baseUrl = esiBaseUrl
        this.limitReset = 60
        this.limitRemain = 100
        this.log = log.child({ baseUrl: this.baseUrl, limitReset: this.limitReset, limitRemain: this.limitRemain })
        this.credentials = credentials
        this.proxy = proxy
    }

    async refreshCredentials() {
        const { clientId, clientSecret, refresh_token } = this.credentials
        const base64ClientString = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")
        const config = {
            url: "https://login.eveonline.com/oauth/token",
            method: "POST",
            body: {
                "grant_type": "refresh_token",
                "refresh_token": refresh_token
            },
            headers: {
                "Authorization": `Basic ${base64ClientString}`,
                "Content-Type": "application/json"
            }
        }
        try {
            const result = await axios(config)
            this.credentials = result.data
            var d = new Date('2014-01-01 10:11:55');
            this.credentials.expiry = new Date(new Date().getTime() + result.data.expires_in * 1000)
        } catch (e) {
            throw new Error(`Error when refreshing ESI credentials: ${e.message}`)
        }
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    saveErrorLimits(headers) {
        this.limitRemain = headers['x-esi-error-limit-remain']
        this.limitReset = headers['x-esi-error-limit-reset']
    }

    async request(route, method, headers, authRequired = false, attempt = 1) {
        const url = this.baseUrl + route
        const config = {
            url,
            method,
            ...(this.proxy ? { proxy: this.proxy } : {}),
            ...(headers ? { headers } : {})
        }
        if (this.limitRemain > 10) {
            if (authRequired) {
                if (this.credentials.expiry < new Date(new Date().getTime() + 60 * 1000)) {
                    await this.refreshCredentials()
                }
                config.headers.Authorization = `Bearer ${this.credentials.access_token}`
            }
            try {
                const result = await axios(config)
                this.log.info(`Recieved data for ${method} ${url}`, result)
                this.saveErrorLimits(result.headers)--
                return result
            } catch (e) {
                this.log.error(`An error occured when querying ${method} ${url}: ${e.message}`, e)
                if (e?.data?.error) {
                    const { headers, data } = e.response;
                    if (
                        headers['x-esi-error-limit-remain'] &&
                        headers['x-esi-error-limit-reset']
                    ) {
                        this.saveErrorLimits(headers)
                    }
                    this.log(`${id} - ${data.error}`);
                    return { error: data.error };
                } else {
                    return e
                }
            }
        } else {
            this.log.warn(`Close to esi-error-limit, throttling request ${method} ${url} for ${this.limitReset} seconds`)
            await this.sleep(this.limitReset * 1000)
            return this.request(route, method, headers, authRequired, attempt + 1)
        }
    }
}

module.exports = ESIClient