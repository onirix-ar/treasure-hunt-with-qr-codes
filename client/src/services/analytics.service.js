import { getAnalytics, logEvent } from 'firebase/analytics';

class AnalyticsService {

    constructor() {
        this._analytics = getAnalytics();
    }

    sendEvent(eventName, eventParams) {
        logEvent(this._analytics, eventName, eventParams);
    }

}

const analyticsService = new AnalyticsService();

export default analyticsService;