import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import getAccountTimeZone from '@salesforce/apex/AccountTimeController.getAccountTimeZone';

// Specify the fields we want to monitor for changes
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

    // 1. Listen for standard record saves/edits
    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredAccount({ error, data }) {
        if (data) {
            // When the user saves an address change, show the spinner...
            this.isLoading = true;
            
            // ...and force the Apex method to fetch the new time zone
            if (this.wiredTimeZoneResult) {
                refreshApex(this.wiredTimeZoneResult);
            }
        }
    }

    // 2. Fetch the time zone from Apex
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