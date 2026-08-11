import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import getAccountTimeZone from '@salesforce/apex/AccountTimeController.getAccountTimeZone';

// Monitor these fields for changes
const FIELDS = [
    'Account.BillingStreet',
    'Account.BillingCity',
    'Account.BillingState',
    'Account.BillingCountry',
    'Account.BillingLatitude',
    'Account.BillingLongitude'
];

export default class AccountLocalTime extends LightningElement {
    @api recordId;
    
    timeZone;
    currentTime;
    timer;
    error;
    
    noData = false;
    isLoading = true; // Start in a loading state

    wiredTimeZoneResult; // Stores the Apex result object so we can refresh it later

    // Listen for record edits
    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredAccount({ error, data }) {
        if (data) {
            // Show spinner when user changes the address
            this.isLoading = true;
            
            // fetch the new time zone again
            if (this.wiredTimeZoneResult) {
                refreshApex(this.wiredTimeZoneResult);
            }
        }
    }

    // Fetch the time zone from Apex
    @wire(getAccountTimeZone, { accountId: '$recordId' })
    wiredTimeZone(result) {
        this.wiredTimeZoneResult = result; 
        const { error, data } = result;

        if (data) {
            this.timeZone = data;
            this.error = undefined;
            this.noData = false;
            this.isLoading = false; // Turn off spinner
            this.startClock();
        } else if (data === null) {
            this.stopClock();
            this.timeZone = null;
            this.currentTime = null;
            this.noData = true;
            this.error = undefined;
            this.isLoading = false; // Turn off spinner
        } else if (error) {
            this.stopClock();
            this.error = 'Error retrieving time zone data.';
            this.timeZone = undefined;
            this.noData = false;
            this.isLoading = false; // Turn off spinner
        }
    }

    startClock() {
        this.stopClock();
        this.updateTime();
        this.timer = setInterval(() => {
            this.updateTime();
        }, 1000);
    }

    stopClock() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = undefined;
        }
    }

    updateTime() {
        if (!this.timeZone) return;

        try {
            const formatter = new Intl.DateTimeFormat([], {
                timeZone: this.timeZone,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZoneName: 'short'
            });
            this.currentTime = formatter.format(new Date());
        } catch (e) {
            this.error = 'Invalid Time Zone format.';
            this.stopClock();
        }
    }

    disconnectedCallback() {
        this.stopClock();
    }
}