package com.platform.dummy.payments;

import jakarta.persistence.*;

@Entity
@Table(name = "payments")
public class Payments {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long snippet_id;
    private Long pair_id;

    private String licensor;
    private String licensee;
    private String licensee_Affiliate;
    private String License_sales;
    private String Indication;
    private Integer Year;
    private String Yearly_quarters;
    private String Information_type;
    private Float Payment_amount;
    private String Payment_amount_in_local_currency;
    private String Local_currency;
    private String Royalty_rate;
    private String Royalty_min;
    private String Royalty_max;
    private String Percentage_value;

    private String Payment_type;
    private String details;
    private String directory_path;
    private String document_name;

    private String document_date;
    private String modified;

    public Payments() {
    }

    public Payments(Long id, Long snippet_id, Long pair_id, String licensor, String licensee, String licensee_Affiliate, String license_sales, String indication, Integer year, String yearly_quarters, String information_type, Float payment_amount, String payment_amount_in_local_currency, String local_currency, String royalty_rate, String royalty_min, String royalty_max, String percentage_value, String payment_type, String details, String directory_path, String document_name, String document_date, String modified) {
        this.id = id;
        this.snippet_id = snippet_id;
        this.pair_id = pair_id;
        this.licensor = licensor;
        this.licensee = licensee;
        this.licensee_Affiliate = licensee_Affiliate;
        License_sales = license_sales;
        Indication = indication;
        Year = year;
        Yearly_quarters = yearly_quarters;
        Information_type = information_type;
        Payment_amount = payment_amount;
        Payment_amount_in_local_currency = payment_amount_in_local_currency;
        Local_currency = local_currency;
        Royalty_rate = royalty_rate;
        Royalty_min = royalty_min;
        Royalty_max = royalty_max;
        Percentage_value = percentage_value;
        Payment_type = payment_type;
        this.details = details;
        this.directory_path = directory_path;
        this.document_name = document_name;
        this.document_date = document_date;
        this.modified = modified;
    }

    public Long getID() {
        return id;
    }

    public void setID(Long id) {
        this.id = id;
    }

    public Long getSnippet_id() {
        return snippet_id;
    }

    public void setSnippet_id(Long snippet_id) {
        this.snippet_id = snippet_id;
    }

    public Long getPair_id() {
        return pair_id;
    }

    public void setPair_id(Long pair_id) {
        this.pair_id = pair_id;
    }

    public String getLicensor() {
        return licensor;
    }

    public void setLicensor(String licensor) {
        this.licensor = licensor;
    }

    public String getLicensee() {
        return licensee;
    }

    public void setLicensee(String licensee) {
        this.licensee = licensee;
    }

    public String getLicensee_Affiliate() {
        return licensee_Affiliate;
    }

    public void setLicensee_Affiliate(String licensee_Affiliate) {
        this.licensee_Affiliate = licensee_Affiliate;
    }

    public String getLicense_sales() {
        return License_sales;
    }

    public void setLicense_sales(String license_sales) {
        License_sales = license_sales;
    }

    public String getIndication() {
        return Indication;
    }

    public void setIndication(String indication) {
        Indication = indication;
    }

    public Integer getYear() {
        return Year;
    }

    public void setYear(Integer year) {
        Year = year;
    }

    public String getYearly_quarters() {
        return Yearly_quarters;
    }

    public void setYearly_quarters(String yearly_quarters) {
        Yearly_quarters = yearly_quarters;
    }

    public String getInformation_type() {
        return Information_type;
    }

    public void setInformation_type(String information_type) {
        Information_type = information_type;
    }

    public Float getPayment_amount() {
        return Payment_amount;
    }

    public void setPayment_amount(Float payment_amount) {
        Payment_amount = payment_amount;
    }

    public String getPayment_amount_in_local_currency() {
        return Payment_amount_in_local_currency;
    }

    public void setPayment_amount_in_local_currency(String payment_amount_in_local_currency) {
        Payment_amount_in_local_currency = payment_amount_in_local_currency;
    }

    public String getLocal_currency() {
        return Local_currency;
    }

    public void setLocal_currency(String local_currency) {
        Local_currency = local_currency;
    }

    public String getRoyalty_rate() {
        return Royalty_rate;
    }

    public void setRoyalty_rate(String royalty_rate) {
        Royalty_rate = royalty_rate;
    }

    public String getRoyalty_min() {
        return Royalty_min;
    }

    public void setRoyalty_min(String royalty_min) {
        Royalty_min = royalty_min;
    }

    public String getRoyalty_max() {
        return Royalty_max;
    }

    public void setRoyalty_max(String royalty_max) {
        Royalty_max = royalty_max;
    }

    public String getPercentage_value() {
        return Percentage_value;
    }

    public void setPercentage_value(String percentage_value) {
        Percentage_value = percentage_value;
    }

    public String getPayment_type() {
        return Payment_type;
    }

    public void setPayment_type(String payment_type) {
        Payment_type = payment_type;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public String getDirectory_path() {
        return directory_path;
    }

    public void setDirectory_path(String directory_path) {
        this.directory_path = directory_path;
    }

    public String getDocument_name() {
        return document_name;
    }

    public void setDocument_name(String document_name) {
        this.document_name = document_name;
    }

    public String getDocument_date() {
        return document_date;
    }

    public void setDocument_date(String document_date) {
        this.document_date = document_date;
    }

    public String getModified() {
        return modified;
    }

    public void setModified(String modified) {
        this.modified = modified;
    }
}