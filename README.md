# Account Local Time Component
The Account Local Time component is a Lightning Web Component (LWC) that calculates and displays the live local time of any Account based on its Billing Address. 

This component uses Salesforce's geocoding engine to parse the address into GPS coordinates. It then uses the GPS coordinates to fetch the IANA time zone from TimeZoneDB, which should be accurate even across complex global borders and daylight saving time shifts.

# Note to Users:
When you update the Billing Address of an account, you might have to reload the page before the time zone updates.

Currently, this component only works using the Billing Address, so don't expect that updating the Shipping Address or any other kind of Address type will change the time zone shown.

# Note to the Org Manager:
There are a few settings to change in your org before you can use the component. The Salesforce Geocoding Engine and TimeZoneDB are free tools, but you need to allow them to work first.

1. Enable Salesforce Geocoding:
    - Click the Setup Gear and search for Data Integration Rules.
    - Click on Geocodes for Account Billing Address.
    - Click Activate.

2. Enable the TimeZoneDB API:
    - Click the Setup Gear and search for Remote Site Settings.
    - Click New Remote Site.
    - Name it "TimeZone_API".
    - Set the Remote Site URL to "https://api.timezonedb.com".
    - Make sure Active is checked and click Save.

# Errors
If you see "No time zone available for this location." shown on the component:
    You need to wait / reload the page for the changes to take effect,
    You entered an incomplete or unsupported address, or
    The TimeZoneBD API is down.

# Deployment and Usage
Deploy this project to your Salesforce environment using the Salesforce CLI:
sf project deploy start --source-dir force-app
