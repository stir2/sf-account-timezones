public with sharing class AccountTimeController {
    
    private static final String API_KEY = 'GJMIERX0GO8Y';
    
    @AuraEnabled(cacheable=true)
    public static String getAccountTimeZone(Id accountId) {
        // Get Salesforce Geocode fields
        Account acc = [
            SELECT BillingLatitude, BillingLongitude 
            FROM Account 
            WHERE Id = :accountId 
            LIMIT 1
        ];

        // Fallback if Salesforce hasn't geocoded the address yet
        if (acc.BillingLatitude == null || acc.BillingLongitude == null) {
            return null;
        }

        try {
            // Pass the coordinates TimeZoneDB
            String endpoint = 'https://api.timezonedb.com/v2.1/get-time-zone?key=' + API_KEY
                              + '&format=json&by=position&lat=' + acc.BillingLatitude 
                              + '&lng=' + acc.BillingLongitude;

            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint(endpoint);
            request.setMethod('GET');
            
            HttpResponse response = http.send(request);

            if (response.getStatusCode() == 200) {
                Map<String, Object> results = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
                
                // Return the IANA string
                if (results.containsKey('zoneName')) {
                    return (String) results.get('zoneName');
                }
            }
        } catch (Exception e) {
            System.debug('Callout failed: ' + e.getMessage());
        }

        return null;
    }
}
