package com.platform.dummy;

public class UpdateKnownLicenseeRequest {
    private String selectedLicensee;
    private String knownLicensee;

    // Getters and setters for selectedLicensee and knownLicensee
    public String getSelectedLicensee() {
        return selectedLicensee;
    }

    public void setSelectedLicensee(String selectedLicensee) {
        this.selectedLicensee = selectedLicensee;
    }

    public String getKnownLicensee() {
        return knownLicensee;
    }

    public void setKnownLicensee(String knownLicensee) {
        this.knownLicensee = knownLicensee;
    }
}
