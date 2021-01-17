const axios = require('axios')
const bunyan = require('bunyan');
const log = bunyan.createLogger({ name: "ESIClient" });

class ESIClient {
    constructor(esiBaseUrl, credentials, proxy = false) {
        this.baseUrl = esiBaseUrl
        this.limitReset = 60
        this.limitRemain = 100
        this.log = log.child({ baseUrl: this.baseUrl, limitReset: this.limitReset, limitRemain: this.limitRemain })
    }

    async refreshCredentials() { }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    saveErrorLimits(headers) {
        this.limitRemain = result.headers['x-esi-error-limit-remain']
        this.limitReset = result.headers['x-esi-error-limit-reset']
    }

    async request(route, method, headers, authorization = false, attempt = 1) {
        const url = this.baseUrl + route
        const config = {
            url,
            method,
            ...(this.proxy ? { proxy: this.proxy } : {}),
            ...(headers ? { headers } : {})
        }
        if (this.limitRemain > 10) {
            console.log(this.limitRemain)
            try {
                const result = await axios(config)
                this.log.info(`Recieved data for ${method} ${url}`, result)
                this.saveErrorLimits(result.headers)
                return result
            } catch (e) {
                this.log.error(`An error occured when querying ${method} ${url}: ${e.message}`, e)
                const { headers, data } = e.response;
                if (data.error) {
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
            return this.request(route, method, headers, authorization, attempt + 1)
        }
    }
}

module.exports = ESIClient